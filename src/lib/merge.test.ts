import { describe, expect, it } from 'vitest';
import { merge, type Template, type Addon } from './merge';

const base: Template = {
  jobs: {
    build: {
      permissions: { contents: 'read' },
      steps: [{ name: 'checkout', uses: 'actions/checkout@v4' }],
    },
  },
};

const addonStep: Addon = {
  steps: [{ name: 'checkout', uses: 'actions/checkout@v4' }],
};

const permAddon: Addon = {
  permissions: { contents: 'write', 'id-token': 'write' },
};

const bAddon: Addon = {
  steps: [{ name: 'B', run: 'echo B' }],
};

const cAddon: Addon = {
  steps: [{ name: 'C', run: 'echo C' }],
};

describe('merge', () => {
  it('deduplicates steps', () => {
    const res = merge(base, [addonStep]);
    expect(res.template.jobs!.build!.steps).toHaveLength(1);
  });

  it('widens permissions', () => {
    const res = merge(base, [permAddon]);
    expect(res.template.jobs!.build!.permissions).toEqual({
      contents: 'write',
      'id-token': 'write',
    });
  });

  it('appends add-on steps in order', () => {
    const res = merge(base, [bAddon, cAddon]);
    const steps = res.template.jobs!.build!.steps as Array<{ name?: string }>;
    expect(steps.map((s) => s.name)).toEqual(['checkout', 'B', 'C']);
  });

  it('is idempotent for repeated addons', () => {
    const res = merge(base, [bAddon, bAddon]);
    const steps = res.template.jobs!.build!.steps as Array<{ name?: string }>;
    expect(steps.filter((s) => s.name === 'B')).toHaveLength(1);
  });
});
