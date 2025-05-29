"use client";

interface Props {
  error: string | null;
}

export default function ErrorBanner({ error }: Props) {
  if (!error) return null;
  return (
    <p className="text-red-400 bg-red-900/20 border border-red-500/30 p-4 rounded">
      <strong>Error:</strong> {error}
    </p>
  );
}
