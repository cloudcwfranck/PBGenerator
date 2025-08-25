import JSZip from 'jszip';
import type { AddonFile } from './merge';

export async function createZip(
  yaml: string,
  path: string,
  files: AddonFile[],
): Promise<Blob> {
  const zip = new JSZip();
  zip.file(path, yaml);
  for (const f of files) {
    zip.file(f.path, f.content);
  }
  return zip.generateAsync({ type: 'blob' });
}
