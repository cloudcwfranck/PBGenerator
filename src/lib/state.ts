export interface AppState {
  provider: string;
  workload: 'application' | 'container' | 'iac';
  practice: 'commercial' | 'government';
  runner: 'actions' | 'azdo';
  addons: string[];
}

export function encodeState(state: AppState): string {
  const p = new URLSearchParams();
  p.set('provider', state.provider);
  p.set('workload', state.workload);
  p.set('practice', state.practice);
  p.set('runner', state.runner);
  if (state.addons.length) p.set('addons', state.addons.join(','));
  return p.toString();
}

export function decodeState(search: string): Partial<AppState> {
  const params = new URLSearchParams(search);
  const result: Partial<AppState> = {};
  const provider = params.get('provider');
  if (provider) result.provider = provider;
  const workload = params.get('workload') as AppState['workload'] | null;
  if (workload) result.workload = workload;
  const practice = params.get('practice') as AppState['practice'] | null;
  if (practice) result.practice = practice;
  const runner = params.get('runner') as AppState['runner'] | null;
  if (runner) result.runner = runner;
  const addons = params.get('addons');
  if (addons) result.addons = addons.split(',');
  return result;
}
