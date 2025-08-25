import YAML from 'yaml';

export function toYaml(obj: any): string {
  return YAML.stringify(obj);
}
