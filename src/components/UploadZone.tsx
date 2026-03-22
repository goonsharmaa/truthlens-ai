import { useCallback, useState } from "react";
import { Upload, Image, Film } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && ACCEPTED.includes(file.type)) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <label
      className={`
        relative flex flex-col items-center justify-center gap-4 
        rounded-lg border-2 border-dashed p-12 cursor-pointer
        transition-all duration-300
        ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-muted-foreground/40 hover:bg-secondary/40"}
        ${isProcessing ? "pointer-events-none opacity-50" : ""}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="sr-only"
        accept={ACCEPTED.join(",")}
        onChange={handleChange}
        disabled={isProcessing}
      />

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-secondary p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-foreground font-medium">
          Drop media here or <span className="text-primary underline underline-offset-4">browse</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports JPEG, PNG, WebP, MP4, WebM
        </p>
      </div>

      <div className="flex gap-6 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Image className="h-3.5 w-3.5" />
          Images
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Film className="h-3.5 w-3.5" />
          Videos
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-center">
          <p className="text-primary font-semibold">Release to upload</p>
        </div>
      )}
    </label>
  );
}
