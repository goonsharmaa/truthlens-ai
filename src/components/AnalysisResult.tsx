import { Shield, ShieldAlert, ShieldQuestion, AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";

interface Indicator {
  category: string;
  finding: string;
  severity: "none" | "low" | "medium" | "high";
}

interface AnalysisResultProps {
  verdict: "real" | "fake" | "uncertain";
  confidence: number;
  summary: string;
  indicators: Indicator[];
  imageUrl?: string;
  fileName: string;
}

const verdictConfig = {
  real: {
    label: "Authentic",
    icon: Shield,
    colorClass: "text-safe",
    bgClass: "bg-safe/10",
    borderClass: "border-safe/30",
    barClass: "bg-safe",
  },
  fake: {
    label: "Manipulated",
    icon: ShieldAlert,
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
    borderClass: "border-danger/30",
    barClass: "bg-danger",
  },
  uncertain: {
    label: "Uncertain",
    icon: ShieldQuestion,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    barClass: "bg-warning",
  },
};

const severityIcon = {
  none: <CheckCircle className="h-4 w-4 text-safe" />,
  low: <MinusCircle className="h-4 w-4 text-muted-foreground" />,
  medium: <AlertTriangle className="h-4 w-4 text-warning" />,
  high: <ShieldAlert className="h-4 w-4 text-danger" />,
};

export default function AnalysisResult({ verdict, confidence, summary, indicators, imageUrl, fileName }: AnalysisResultProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Verdict Header */}
      <div className={`rounded-lg border ${config.borderClass} ${config.bgClass} p-6`}>
        <div className="flex items-start gap-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={fileName}
              className="h-20 w-20 rounded-md object-cover border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-6 w-6 ${config.colorClass}`} />
              <span className={`text-xl font-semibold ${config.colorClass}`}>{config.label}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
            <p className="mt-1 text-xs text-muted-foreground font-mono-data truncate">{fileName}</p>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Confidence</span>
            <span className={`font-mono-data font-semibold ${config.colorClass}`}>{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full ${config.barClass} transition-all duration-1000 ease-out`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Detection Indicators</h3>
        <div className="space-y-2">
          {indicators.map((ind, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-md bg-secondary/40 p-3 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {severityIcon[ind.severity]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-data text-muted-foreground uppercase tracking-wider">{ind.category}</span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5">{ind.finding}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
