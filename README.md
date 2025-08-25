# Pipeline Blueprint Generator

A tiny web app that generates ready-to-use CI/CD pipeline YAML and scaffolding files based on a few project selections. The app runs entirely in the browser and is deployed to GitHub Pages.

## Features

- Choose cloud provider, workload type, and practice (commercial or government).
- Toggle compliance add-ons such as SAST, SBOM, OPA, tfsec, and Trivy.
- Preview the resulting pipeline YAML for GitHub Actions or Azure DevOps.
- Copy the pipeline to your clipboard or download a zip that includes optional policy files.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The project is deployed using the workflow in `.github/workflows/deploy.yml`.
