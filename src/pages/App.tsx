import { useEffect, useState } from 'react';
import { Picker } from '../components/Picker';
import { Preview } from '../components/Preview';
import { Toast } from '../components/Toast';
import { merge, type Addon, type Template } from '../lib/merge';
import { toYaml } from '../lib/yaml';
import { createZip } from '../lib/zip';
import { encodeState, decodeState, type AppState } from '../lib/state';

// base templates
import commercialNode from '../data/templates/actions/commercial-node.json';
import govContainer from '../data/templates/actions/gov-container.json';
import iacTerraform from '../data/templates/actions/iac-terraform.json';
import azdoCommercial from '../data/templates/azdo/commercial-dotnet.json';

// addons
import sast from '../data/addons/sast.json';
import sbom from '../data/addons/sbom.json';
import opa from '../data/addons/opa.json';
import tfsec from '../data/addons/iac-tfsec.json';
import trivy from '../data/addons/trivy.json';
import slsa from '../data/addons/slsa.json';

const addonMap: Record<string, Addon> = {
  sast,
  sbom,
  opa,
  tfsec,
  trivy,
  slsa,
};

const baseTemplates: Record<string, Record<string, Record<string, Template>>> = {
  actions: {
    application: { commercial: commercialNode, government: commercialNode },
    container: { commercial: commercialNode, government: govContainer },
    iac: { commercial: iacTerraform, government: iacTerraform },
  },
  azdo: {
    application: { commercial: azdoCommercial, government: azdoCommercial },
    container: { commercial: azdoCommercial, government: azdoCommercial },
    iac: { commercial: azdoCommercial, government: azdoCommercial },
  },
};

const govDefaults = ['trivy', 'sbom', 'opa', 'slsa'];

export default function App() {
  const [state, setState] = useState<AppState>(() => ({
    provider: 'azure',
    workload: 'application',
    practice: 'commercial',
    runner: 'actions',
    addons: [],
    ...decodeState(window.location.search),
  }));
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const [toast, setToast] = useState('');

  // ensure gov defaults
  useEffect(() => {
    if (state.practice === 'government') {
      setState((s) => ({
        ...s,
        addons: Array.from(new Set([...govDefaults, ...s.addons])),
      }));
    }
  }, [state.practice]);

  // update URL
  useEffect(() => {
    const qs = encodeState(state);
    const url = `${window.location.pathname}?${qs}`;
    window.history.replaceState(null, '', url);
  }, [state]);

  const toggleAddon = (id: string) => {
    setState((s) => ({
      ...s,
      addons: s.addons.includes(id)
        ? s.addons.filter((a) => a !== id)
        : [...s.addons, id],
    }));
  };

  const template =
    baseTemplates[state.runner][state.workload][state.practice] || commercialNode;
  const addons = state.addons.map((a) => addonMap[a]).filter(Boolean);
  const merged = merge(template, addons);
  const yaml = toYaml(merged.template);

  const copy = async () => {
    await navigator.clipboard.writeText(yaml);
    setToast('Copied to clipboard');
  };

  const download = async () => {
    const path =
      state.runner === "actions"
        ? '.github/workflows/pipeline.yml'
        : 'azure-pipelines.yml';
    const extras = [...merged.files, { path: "README-GET-STARTED.md", content: "Run the generated pipeline in your repository." }];
    const blob = await createZip(yaml, path, extras);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "pipeline.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline Blueprint Generator</h1>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="border px-2 py-1 rounded">
          {theme === "dark" ? "Light" : "Dark"} mode
        </button>
      </header>
      <Picker
        provider={state.provider}
        setProvider={(v) => setState((s) => ({ ...s, provider: v }))}
        workload={state.workload}
        setWorkload={(v) => setState((s) => ({ ...s, workload: v }))}
        practice={state.practice}
        setPractice={(v) => setState((s) => ({ ...s, practice: v }))}
        runner={state.runner}
        setRunner={(v) => setState((s) => ({ ...s, runner: v }))}
        addons={state.addons}
        toggleAddon={toggleAddon}
        addonOptions={addonMap}
      />
      <Preview yaml={yaml} onCopy={copy} onDownload={download} />
      {toast && <Toast message={toast} onHide={() => setToast('')} />}
    </div>
  );
}
