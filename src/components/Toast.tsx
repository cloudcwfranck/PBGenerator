import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, onHide, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onHide, duration);
    return () => clearTimeout(id);
  }, [onHide, duration]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}
