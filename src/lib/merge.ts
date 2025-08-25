export interface AddonFile {
  path: string;
  content: string;
}

export interface Addon {
  steps?: any[];
  permissions?: Record<string, string>;
  files?: AddonFile[];
}

export interface Template {
  [key: string]: any;
}

export interface MergeResult {
  template: Template;
  files: AddonFile[];
}

export function merge(base: Template, addons: Addon[]): MergeResult {
  const result: Template = structuredClone(base);
  const extraFiles: AddonFile[] = [];

  for (const addon of addons) {
    if (addon.permissions && result?.jobs?.build?.permissions) {
      result.jobs.build.permissions = {
        ...result.jobs.build.permissions,
        ...addon.permissions,
      };
    }

    const targetSteps = result?.jobs?.build?.steps || result.steps;
    if (targetSteps && addon.steps) {
      for (const step of addon.steps) {
        const exists = targetSteps.some((s: any) => JSON.stringify(s) === JSON.stringify(step));
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
