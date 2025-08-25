export interface AddonFile {
  path: string;
  content: string;
}

export interface Addon {
  steps?: Record<string, unknown>[];
  permissions?: Record<string, string>;
  files?: AddonFile[];
}

interface Job {
  permissions?: Record<string, string>;
  steps?: Record<string, unknown>[];
}

export interface Template {
  name?: string;
  on?: unknown;
  jobs?: {
    build?: Job;
    [key: string]: Job | undefined;
  };
  [key: string]: unknown;
}

export interface MergeResult {
  template: Template;
  files: AddonFile[];
}

function stepKey(step: Record<string, unknown>): string {
  if ('name' in step && typeof step.name === 'string') return step.name;
  if ('uses' in step && typeof step.uses === 'string')
    return `${step.uses}-${JSON.stringify((step as { with?: unknown }).with || {})}`;
  if ('run' in step && typeof step.run === 'string') return step.run;
  return JSON.stringify(step);
}

function privilegeRank(v: string): number {
  return v === 'write' ? 2 : v === 'read' ? 1 : 0;
}

function mergePermissions(
  base: Record<string, string> = {},
  extra: Record<string, string> = {},
): Record<string, string> {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    const existing = out[k];
    if (!existing || privilegeRank(v) > privilegeRank(existing)) {
      out[k] = v;
    }
  }
  return out;
}

export function merge(base: Template, addons: Addon[]): MergeResult {
  const result: Template = structuredClone(base);
  const files: AddonFile[] = [];
  const job = result.jobs?.build;
  if (job && !job.steps) job.steps = [];

  for (const addon of addons) {
    if (addon.permissions && job) {
      job.permissions = mergePermissions(job.permissions, addon.permissions);
    }
    const targetSteps = job?.steps;
    if (targetSteps && addon.steps) {
      for (const step of addon.steps) {
        const key = stepKey(step);
        if (!targetSteps.some((s) => stepKey(s) === key)) {
          targetSteps.push(step);
        }
      }
    }
    if (addon.files) files.push(...addon.files);
  }

  return { template: result, files };
}
