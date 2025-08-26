import { describe, it, expect } from 'vitest';
import { parsePrompt } from './prompt';

describe('parsePrompt', () => {
  it('extracts basic azure params', () => {
    const p = parsePrompt('AKS cluster in Azure, 3 nodepools, private cluster, Azure CNI');
    expect(p.cloud).toBe('azure');
    expect(p.privateCluster).toBe(true);
    expect(p.nodepools).toBe(3);
  });

  it('detects government compliance', () => {
    const p = parsePrompt('EKS on AWS GovCloud');
    expect(p.cloud).toBe('aws');
    expect(p.compliance).toBe('government');
  });
});
