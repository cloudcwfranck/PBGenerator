import { describe, expect, it } from 'vitest';
import { toYaml } from './yaml';
import YAML from 'yaml';

describe('yaml', () => {
  it('produces valid YAML', () => {
    const obj = { a: 1, b: { c: 2 } };
    const yaml = toYaml(obj);
    expect(() => YAML.parse(yaml)).not.toThrow();
  });

  it('is stable for key ordering', () => {
    const obj = { a: 1, b: 2 };
    const first = toYaml(obj);
    const second = toYaml(obj);
    expect(first).toBe(second);
  });
});
