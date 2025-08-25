export interface AddonFile {
  path: string;
  content: string;
}

export interface Addon {
  steps?: unknown[];
  permissions?: Record<string, string>;
  files?: AddonFile[];
}

interface Job {
  permissions?: Record<string, string>;
  steps?: unknown[];
}

export interface Template {
  jobs?: {
    build?: Job;
    [key: string]: unknown;
  };
  steps?: unknown[];
  [key: string]: unknown;
}

export interface MergeResult {
  template: Template;
  files: AddonFile[];
}

export function merge(base: Template, addons: Addon[]): MergeResult {
  const result: Template = structuredClone(base);
  const extraFiles: AddonFile[] = [];

  for (const addon of addons) {
    const buildJob = result.jobs?.build;
    if (addon.permissions && buildJob?.permissions) {
      buildJob.permissions = {
        ...buildJob.permissions,
        ...addon.permissions,
      };
    }

    const targetSteps = buildJob?.steps || result.steps;
    if (targetSteps && addon.steps) {
      for (const step of addon.steps) {
        const exists = targetSteps.some(
          (s) => JSON.stringify(s) === JSON.stringify(step)
        );
        if (!exists) {
          targetSteps.push(step);
        }
      }
    }

    if (addon.files) {
      extraFiles.push(...addon.files);
    }
  }

  return { template: result, files: extraFiles };
}
