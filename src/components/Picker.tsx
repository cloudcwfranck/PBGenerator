import type { Addon } from '../lib/merge';

export interface PickerProps {
  provider: string;
  setProvider: (v: string) => void;
  workload: 'application' | 'container' | 'iac';
  setWorkload: (v: 'application' | 'container' | 'iac') => void;
  practice: 'commercial' | 'government';
  setPractice: (v: 'commercial' | 'government') => void;
  runner: 'actions' | 'azdo';
  setRunner: (v: 'actions' | 'azdo') => void;
  addons: string[];
  toggleAddon: (id: string) => void;
  addonOptions: Record<string, Addon>;
}

export function Picker({
  provider,
  setProvider,
  workload,
  setWorkload,
  practice,
  setPractice,
  runner,
  setRunner,
  addons,
  toggleAddon,
  addonOptions,
}: PickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Provider</label>
        <select
          className="border rounded p-2"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="azure">Azure</option>
          <option value="aws">AWS</option>
          <option value="gcp">GCP</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Workload</label>
        <select
          className="border rounded p-2"
          value={workload}
          onChange={(e) =>
            setWorkload(e.target.value as 'application' | 'container' | 'iac')
          }
        >
          <option value="application">Application</option>
          <option value="container">Container</option>
          <option value="iac">Infrastructure as Code</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Practice</label>
        <select
          className="border rounded p-2"
          value={practice}
          onChange={(e) =>
            setPractice(e.target.value as 'commercial' | 'government')
          }
        >
          <option value="commercial">Commercial</option>
          <option value="government">Government</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Runner</label>
        <select
          className="border rounded p-2"
          value={runner}
          onChange={(e) => setRunner(e.target.value as 'actions' | 'azdo')}
        >
          <option value="actions">GitHub Actions</option>
          <option value="azdo">Azure DevOps</option>
        </select>
      </div>
      <fieldset className="border rounded p-2">
        <legend className="font-semibold">Add-ons</legend>
        {Object.keys(addonOptions).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={addons.includes(key)}
              onChange={() => toggleAddon(key)}
            />
            {key}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
