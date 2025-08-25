import { useState } from 'react';
import './App.css';
import commercialNode from './data/templates/actions/commercial-node.json';
import govContainer from './data/templates/actions/gov-container.json';
import iacTerraform from './data/templates/actions/iac-terraform.json';
import azdoCommercial from './data/templates/azdo/commercial-dotnet.json';
import sast from './data/addons/sast.json';
import sbom from './data/addons/sbom.json';
import opa from './data/addons/opa.json';
import tfsec from './data/addons/iac-tfsec.json';
import trivy from './data/addons/trivy.json';
import { merge } from './lib/merge';
import type { Addon, MergeResult, Template } from './lib/merge';
import { toYaml } from './lib/yaml';

const addonMap: Record<string, Addon> = { sast, sbom, opa, tfsec, trivy };

const baseTemplates: Record<
  string,
  Record<string, Record<string, unknown>>
> = {
  actions: {
    app: { commercial: commercialNode, government: commercialNode },
    container: { commercial: commercialNode, government: govContainer },
    iac: { commercial: iacTerraform, government: iacTerraform },
  },
  azdo: {
    app: { commercial: azdoCommercial },
  },
};

function App() {
  const [provider, setProvider] = useState('aws');
  const [repoType, setRepoType] = useState<'app' | 'container' | 'iac'>('app');
  const [practice, setPractice] = useState<'commercial' | 'government'>('commercial');
  const [extras, setExtras] = useState<string[]>([]);
  const [system, setSystem] = useState<'actions' | 'azdo'>('actions');

  const toggleExtra = (name: string) => {
    setExtras((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const selectedTemplate =
    (baseTemplates[system]?.[repoType]?.[practice] as Template) ||
    commercialNode;
  const selectedAddons = extras.map((e) => addonMap[e]);
  const result: MergeResult = merge(selectedTemplate, selectedAddons);
  const yaml = toYaml(result.template);

  const copy = async () => {
    await navigator.clipboard.writeText(yaml);
  };

  const download = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file('pipeline.yaml', yaml);
    for (const file of result.files) {
      zip.file(file.path, file.content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <header>
        <h1>Pipeline Blueprint Generator</h1>
        <p>Instant CI/CD pipeline templates tailored to your project.</p>
      </header>
      <main className="layout">
        <section className="controls">
          <label>
            Cloud
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
            </select>
          </label>
          <label>
            Repo type
            <select
              value={repoType}
              onChange={(e) =>
                setRepoType(e.target.value as 'app' | 'container' | 'iac')
              }
            >
              <option value="app">App</option>
              <option value="container">Container</option>
              <option value="iac">IaC</option>
            </select>
          </label>
          <label>
            Practice
            <select
              value={practice}
              onChange={(e) =>
                setPractice(e.target.value as 'commercial' | 'government')
              }
            >
              <option value="commercial">Commercial</option>
              <option value="government">Government</option>
            </select>
          </label>
          <fieldset>
            <legend>Extras</legend>
            {Object.keys(addonMap).map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={extras.includes(key)}
                  onChange={() => toggleExtra(key)}
                />
                {key}
              </label>
            ))}
          </fieldset>
          <label>
            <input
              type="checkbox"
              checked={system === 'azdo'}
              onChange={(e) => setSystem(e.target.checked ? 'azdo' : 'actions')}
            />
            Azure DevOps
          </label>
        </section>
        <section className="output">
          <div className="actions">
            <button onClick={copy}>Copy to clipboard</button>
            <button onClick={download}>Download as zip</button>
          </div>
          <pre className="preview">{yaml}</pre>
        </section>
      </main>
    </div>
  );
}

export default App;
