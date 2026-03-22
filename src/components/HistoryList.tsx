import { Shield, ShieldAlert, ShieldQuestion, Clock } from "lucide-react";

interface HistoryItem {
  id: string;
  file_name: string;
  file_type: string;
  verdict: string;
  confidence: number;
  created_at: string;
}

const verdictIcons: Record<string, { icon: typeof Shield; colorClass: string }> = {
  real: { icon: Shield, colorClass: "text-safe" },
  fake: { icon: ShieldAlert, colorClass: "text-danger" },
  uncertain: { icon: ShieldQuestion, colorClass: "text-warning" },
};

export default function HistoryList({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No analyses yet. Upload media to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const v = verdictIcons[item.verdict] || verdictIcons.uncertain;
        const Icon = v.icon;
        const timeAgo = getTimeAgo(item.created_at);
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-md bg-secondary/40 p-3 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Icon className={`h-5 w-5 shrink-0 ${v.colorClass}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.file_name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            <span className={`text-xs font-mono-data font-semibold ${v.colorClass}`}>
              {item.confidence.toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
