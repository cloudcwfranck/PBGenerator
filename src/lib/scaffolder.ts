export interface AksParams {
  name: string;
  env: string;
  region: string;
  azureEnvironment: 'public' | 'usgovernment';
  privateCluster: boolean;
}

export function generateAks(params: AksParams): Record<string, string> {
  const files: Record<string, string> = {};
  files['infra/terraform/providers.tf'] = providersTf;
  files['infra/terraform/main.tf'] = mainTf;
  files['scripts/tf-init-plan-apply.sh'] = tfScript;
  files['.github/workflows/infra-apply.yml'] = workflowYaml;
  files[`env/${params.env}.tfvars`] = `name = "${params.name}"
region = "${params.region}"
azure_environment = "${params.azureEnvironment}"
private_cluster = ${params.privateCluster}`;
  return files;
}

const providersTf = `terraform {
  required_version = ">= 1.7.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.120" }
    random  = { source = "hashicorp/random",  version = "~> 3.6" }
  }
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  environment = var.azure_environment # "public" | "usgovernment"
}`;

const mainTf = `module "rg" {
  source   = "./modules/resource_group"
  name     = "${'$'}{var.name}-${'$'}{var.env}-rg"
  location = var.region
}

module "network" {
  source              = "./modules/network"
  name                = "${'$'}{var.name}-${'$'}{var.env}-vnet"
  location            = var.region
  resource_group_name = module.rg.name
  address_space       = ["10.10.0.0/16"]
}

module "aks" {
  source                    = "./modules/aks_cluster"
  name                      = "${'$'}{var.name}-${'$'}{var.env}-aks"
  location                  = var.region
  resource_group_name       = module.rg.name
  vnet_subnet_id            = module.network.subnet_ids["aks"]
  private_cluster_enabled   = var.private_cluster
  network_plugin            = "azure"
  nodepools = var.nodepools
  enable_azure_monitor      = true
}`;

const tfScript = `#!/usr/bin/env bash
set -euo pipefail
ENV=${'$'}{1:-dev}
WORKDIR="infra/terraform"
TFVARS="env/${'$'}{ENV}.tfvars"

pushd "${'$'}{WORKDIR}"
terraform init -input=false
terraform workspace select "${'$'}{ENV}" || terraform workspace new "${'$'}{ENV}"
terraform plan -var-file="../../${'$'}{TFVARS}" -out plan.tfplan
conftest test . --policy ../policy/opa || { echo "OPA gate failed"; exit 1; }
tfsec --soft-fail . || echo "tfsec findings recorded"
terraform apply -auto-approve plan.tfplan
popd
`;

const workflowYaml = [
  'name: Infra Apply',
  'on:',
  '  workflow_dispatch:',
  '    inputs:',
  '      env: { description: "Environment", required: true, default: "dev", type: choice, options: [dev, qa, prod] }',
  'jobs:',
  '  apply:',
  '    runs-on: ubuntu-latest',
  '    permissions: { id-token: write, contents: read, security-events: write }',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: hashicorp/setup-terraform@v3',
  '      - name: Azure Login (OIDC)',
  "        if: inputs.cloud == 'azure'",
  '        uses: azure/login@v2',
  '        with:',
  '          client-id: ${{ secrets.AZURE_CLIENT_ID }}',
  '          tenant-id: ${{ secrets.AZURE_TENANT_ID }}',
  '          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}',
  '          enable-AzPSSession: true',
  '      - name: Install tools',
  '        run: |',
  '          curl -sSfL https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | sh',
  '          curl -sSfL https://raw.githubusercontent.com/open-policy-agent/conftest/master/install.sh | sh',
  '      - name: Terraform Apply',
  '        run: ./scripts/tf-init-plan-apply.sh ${{ github.event.inputs.env }}',
  '      - name: Generate SBOM',
  '        run: ./scripts/generate-sbom.sh',
  '      - name: Upload SARIF (tfsec)',
  '        if: always()',
  '        uses: github/codeql-action/upload-sarif@v3',
  '        with: { sarif_file: results.sarif }',
  '',
].join('\n');
