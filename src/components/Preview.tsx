export interface PreviewProps {
  yaml: string;
  onCopy: () => Promise<void>;
  onDownload: () => Promise<void>;
}

export function Preview({ yaml, onCopy, onDownload }: PreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={onCopy} className="px-3 py-1 bg-blue-600 text-white rounded">Copy</button>
        <button onClick={onDownload} className="px-3 py-1 bg-green-600 text-white rounded">Download ZIP</button>
      </div>
      <pre className="bg-gray-100 dark:bg-gray-800 p-2 overflow-auto text-sm">
        <code>{yaml}</code>
      </pre>
    </div>
  );
}
