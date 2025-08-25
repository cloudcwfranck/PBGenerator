# Pipeline Blueprint Generator

Generate ready-to-run CI/CD YAML pipelines for GitHub Actions or Azure DevOps directly in the browser. Select cloud provider, workload, compliance add-ons and download a ready-to-use pipeline bundle.

![screenshot](https://via.placeholder.com/800x400?text=Pipeline+Blueprint+Generator)

## Features

- Offline JSON templates merged with optional add-ons (SAST, SBOM, OPA, tfsec, Trivy, SLSA)
- YAML preview with copy & download ZIP
- URL state sharing
- Government preset auto-selects hardened add-ons
- Deployed to GitHub Pages via Actions

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Building & Publishing

The site is deployed using GitHub Pages. Pushing to `main` triggers `.github/workflows/deploy.yml` which builds the Vite app and publishes `dist`.

## Adding templates or add-ons

1. Place base templates under `src/data/templates/{actions|azdo}` as JSON.
2. Add optional steps under `src/data/addons` following the existing structure.
3. Update `src/pages/App.tsx` to include new options.

## Security notes for Government preset

Government mode automatically enables Trivy container scanning, Syft SBOM generation, OPA policy gate and SLSA provenance. Generated pipelines require security-event and id-token permissions to upload SARIF and provenance.
