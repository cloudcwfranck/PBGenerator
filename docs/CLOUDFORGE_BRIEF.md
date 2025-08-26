# CloudForge Scaffolder Brief

## 0. Objectives
- Accept a natural language prompt (e.g., "AKS cluster in Azure, 3 nodepools, private cluster, Azure CNI, FluxCD, IL4/IL5 hardening").
- Produce a ready-to-run repository with infrastructure as code, provisioning scripts, bootstrap manifests, GitHub Actions workflows, and documentation.
- Offer presets for Azure Commercial, Azure Government, and AWS.
- Package output as a ZIP file or push to GitHub; resulting repo deploys end-to-end once secrets are set.

## 1. Architecture & Tech Choices
- **UI**: Next.js with TypeScript and Tailwind CSS, deployable on GitHub Pages or Vercel.
- **Generator Core**: Node.js service (Serverless API routes) using Handlebars/EJS templates driven by a blueprint JSON spec.
- **Templating DSL**: Supports conditional logic for government endpoints and extra policy steps.
- **Packaging**: Output repository zipped or pushed via GitHub API (PAT optional).
- **Hosting**: Static + serverless, no dedicated infrastructure required.

## 2. Blueprints & Inputs
- Supported blueprints:
  - AKS on Azure (Commercial/Gov) with Terraform, AAD auth, private cluster, Azure CNI, node pools, FluxCD.
  - EKS on AWS with Terraform, IRSA, private subnets, managed node groups, FluxCD.
  - _(Stretch)_ GKE on GCP (scaffold only).
- Prompt parsing extracts parameters: cloud, environment, region, network model, node pools, add-ons, compliance.
- User edits generated plan before scaffolding.

## 3. Output Repository Structure (AKS example)
```
aks-blueprint/
├─ infra/
│  ├─ terraform/
│  │  ├─ main.tf
│  │  ├─ providers.tf
│  │  ├─ variables.tf
│  │  ├─ outputs.tf
│  │  ├─ backend.tf
│  │  └─ modules/
│  │     ├─ resource_group/
│  │     ├─ network/
│  │     ├─ aks_cluster/
│  │     └─ key_vault/
│  └─ policy/
│     ├─ opa/
│     └─ tfsec/
├─ scripts/
│  ├─ az-login.ps1
│  ├─ az-login.sh
│  ├─ tf-init-plan-apply.sh
│  ├─ tf-destroy.sh
│  ├─ bootstrap-kube.sh
│  └─ generate-sbom.sh
├─ k8s/
│  ├─ base/
│  │  ├─ namespaces.yaml
│  │  └─ network-policies.yaml
│  └─ flux/
│     ├─ gotk-components.yaml
│     ├─ gotk-sync.yaml
│     └─ sources-kustomization.yaml
├─ .github/
│  └─ workflows/
│     ├─ infra-plan.yml
│     ├─ infra-apply.yml
│     ├─ infra-destroy.yml
│     ├─ cluster-bootstrap.yml
│     └─ compliance-gates.yml
├─ env/
│  ├─ dev.tfvars
│  ├─ qa.tfvars
│  └─ prod.tfvars
├─ docs/
│  ├─ README.md
│  ├─ SECRETS.md
│  ├─ RUNBOOK.md
│  └─ ARCHITECTURE.md
└─ .editorconfig
```
- Azure Government mode adjusts endpoints, provider environments, and enforces GCCH restrictions.

## 4. Example File Stubs
Example: `infra/terraform/providers.tf` (Azure)
```hcl
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.120" }
    random  = { source = "hashicorp/random",  version = "~> 3.6" }
  }
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  environment = var.azure_environment
}
```

Example: `scripts/tf-init-plan-apply.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
ENV=${1:-dev}
WORKDIR="infra/terraform"
TFVARS="env/${ENV}.tfvars"

pushd "$WORKDIR"
terraform init -input=false
terraform workspace select "$ENV" || terraform workspace new "$ENV"
terraform plan -var-file="../../${TFVARS}" -out plan.tfplan
conftest test . --policy ../policy/opa || { echo "OPA gate failed"; exit 1; }
tfsec --soft-fail . || echo "tfsec findings recorded"
terraform apply -auto-approve plan.tfplan
popd
```

Example: `.github/workflows/infra-apply.yml`
```yaml
name: Infra Apply
on:
  workflow_dispatch:
    inputs:
      env: { description: "Environment", required: true, default: "dev", type: choice, options: [dev, qa, prod] }
jobs:
  apply:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read, security-events: write }
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - name: Azure Login (OIDC)
        if: inputs.cloud == 'azure'
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true
      - name: Install tools
        run: |
          curl -sSfL https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | sh
          curl -sSfL https://raw.githubusercontent.com/open-policy-agent/conftest/master/install.sh | sh
      - name: Terraform Apply
        run: ./scripts/tf-init-plan-apply.sh ${{ github.event.inputs.env }}
      - name: Generate SBOM
        run: ./scripts/generate-sbom.sh
      - name: Upload SARIF (tfsec)
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: results.sarif }
```

## 5. Secrets & OIDC
- `docs/SECRETS.md` lists required secrets for each cloud.
- Azure: `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CLIENT_ID`, optional backend settings.
- AWS: `AWS_ROLE_TO_ASSUME`, `AWS_REGION`, backend bucket and Dynamo table.
- Government toggles set `azure_environment = "usgovernment"` and require AzureUSGovernment CLI examples.

## 6. Compliance & Guardrails
- OPA/Conftest gates on Terraform plan JSON.
- `tfsec` static analysis (soft or hard fail per environment).
- Syft SBOM generation.
- Optional SLSA provenance for release tags.

## 7. UX Flow
1. User provides prompt.
2. App parses prompt to parameters and displays summary.
3. User edits parameters, chooses commercial or government mode.
4. App generates repository tree and previews files.
5. User downloads ZIP or pushes to GitHub.
6. Post-generation checklist shows required secrets and instructions.

## 8. Acceptance Criteria
- From a prompt, generate a repository with Terraform, scripts, Flux manifests, GitHub Actions, and docs.
- AKS and EKS blueprints deploy successfully after secrets are configured.
- Government mode switches providers and policies automatically.
- `infra-plan.yml` renders a plan and enforces OPA rules.
- `infra-apply.yml` provisions the cluster and outputs kubeconfig context.
- `cluster-bootstrap.yml` applies namespaces and Flux sync.
- ZIP export and GitHub push produce runnable repos.
- README documents deployment for Bash and PowerShell.

## 9. Nice-to-Haves (Phase 2)
- Matrix builds for environments with per-env tfvars.
- Destroy workflow with confirmation gate.
- Saved parameter presets.
- Governance report artifacts (plan summary, policy status, SBOM).
- One-line summary for development teams.

> Build a prompt-driven CloudForge Scaffolder that generates a complete, runnable repository (IaC, scripts, workflows, docs) for AKS (Azure Commercial/Gov) and EKS (AWS). It parses natural language prompts, renders project trees from blueprints, packages as ZIP or pushes to GitHub, and deploys via Actions using OIDC auth, Terraform backends, policy gates, SBOM, and environment tfvars.

