export interface PromptParams {
  cloud: 'azure' | 'aws' | 'gcp';
  compliance?: 'commercial' | 'government';
  region?: string;
  privateCluster?: boolean;
  nodepools?: number;
}

const CLOUD_REGEX = /(azure|aws|gcp)/i;
const GOV_REGEX = /(gov|government)/i;
const REGION_REGEX = /(us[- ]?(east|west|north|south|central)(-\d)?)|(europe|asia|usgov)?[a-z0-9-]+/i;
const PRIVATE_REGEX = /private/;
const NODEPOOL_REGEX = /(\d+)\s*nodepools?/i;

export function parsePrompt(prompt: string): PromptParams {
  const lower = prompt.toLowerCase();
  const cloudMatch = lower.match(CLOUD_REGEX);
  const cloud = (cloudMatch ? cloudMatch[1].toLowerCase() : 'azure') as 'azure' | 'aws' | 'gcp';

  const compliance = GOV_REGEX.test(lower) ? 'government' : undefined;

  const regionMatch = lower.match(REGION_REGEX);
  const region = regionMatch ? regionMatch[0].replace(/\s+/g, '') : undefined;

  const privateCluster = PRIVATE_REGEX.test(lower);

  const nodepoolMatch = lower.match(NODEPOOL_REGEX);
  const nodepools = nodepoolMatch ? parseInt(nodepoolMatch[1], 10) : undefined;

  return { cloud, compliance, region, privateCluster, nodepools };
}
