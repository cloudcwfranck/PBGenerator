import YAML from 'yaml';

export function toYaml(obj: unknown): string {
  return YAML.stringify(obj);
}
