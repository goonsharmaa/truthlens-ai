export default function ScanAnimation({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-card">
      {imageUrl ? (
        <img src={imageUrl} alt="Scanning" className="w-full h-48 object-cover opacity-60" />
      ) : (
        <div className="w-full h-48 bg-secondary" />
      )}

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/50 animate-scan-line" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary" />
      <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-primary" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-primary" />

      {/* Status text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm px-4 py-1.5 border border-border">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-mono-data text-primary">ANALYZING</span>
        </div>
      </div>
    </div>
  );
}
