import { describe, it, expect } from 'vitest';
import { generateAks } from './scaffolder';

describe('generateAks', () => {
  it('creates expected file paths', () => {
    const files = generateAks({
      name: 'demo',
      env: 'dev',
      region: 'eastus',
      azureEnvironment: 'public',
      privateCluster: true,
    });
    expect(Object.keys(files)).toContain('infra/terraform/providers.tf');
    expect(files['infra/terraform/providers.tf']).toMatch(/environment = var.azure_environment/);
    expect(files['env/dev.tfvars']).toMatch(/name = "demo"/);
  });
});
