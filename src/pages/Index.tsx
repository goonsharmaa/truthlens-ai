import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Activity, Clock, Scan } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import AnalysisResult from "@/components/AnalysisResult";
import ScanAnimation from "@/components/ScanAnimation";
import HistoryList from "@/components/HistoryList";

interface AnalysisData {
  verdict: "real" | "fake" | "uncertain";
  confidence: number;
  summary: string;
  indicators: { category: string; finding: string; severity: "none" | "low" | "medium" | "high" }[];
}

interface HistoryItem {
  id: string;
  file_name: string;
  file_type: string;
  verdict: string;
  confidence: number;
  created_at: string;
}

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<(AnalysisData & { imageUrl: string; fileName: string }) | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("analyses")
      .select("id, file_name, file_type, verdict, confidence, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFileSelect = async (file: File) => {
    setResult(null);
    setIsProcessing(true);

    // Create local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      // Upload to storage
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const fileType = file.type.startsWith("video") ? "video" : "image";

      // Call analysis edge function
      const { data: analysis, error: fnError } = await supabase.functions.invoke("analyze-media", {
        body: { imageUrl: publicUrl, fileName: file.name, fileType },
      });

      if (fnError) throw fnError;
      if (analysis.error) throw new Error(analysis.error);

      // Save to DB
      await supabase.from("analyses").insert({
        file_name: file.name,
        file_type: fileType,
        file_url: publicUrl,
        verdict: analysis.verdict,
        confidence: analysis.confidence,
        analysis_details: analysis,
      });

      setResult({
        ...analysis,
        imageUrl: publicUrl,
        fileName: file.name,
      });

      loadHistory();
      toast.success("Analysis complete");
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalScans = history.length;
  const fakeCount = history.filter((h) => h.verdict === "fake").length;
  const realCount = history.filter((h) => h.verdict === "real").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Scan className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">DeepScan</span>
          </div>
          <span className="text-xs font-mono-data text-muted-foreground hidden sm:block">
            AI-POWERED FORENSIC ANALYSIS
          </span>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-up">
          {[
            { label: "Total Scans", value: totalScans, icon: Activity, color: "text-primary" },
            { label: "Authentic", value: realCount, icon: Shield, color: "text-safe" },
            { label: "Manipulated", value: fakeCount, icon: Shield, color: "text-danger" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-mono-data font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-up stagger-1">
              <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </div>

            {isProcessing && (
              <div className="animate-fade-up">
                <ScanAnimation imageUrl={previewUrl || undefined} />
              </div>
            )}

            {result && !isProcessing && (
              <AnalysisResult
                verdict={result.verdict}
                confidence={result.confidence}
                summary={result.summary}
                indicators={result.indicators}
                imageUrl={result.imageUrl}
                fileName={result.fileName}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="animate-fade-up stagger-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Recent Analyses</h2>
              </div>
              <HistoryList items={history} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
