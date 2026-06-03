"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Sparkles, FileText, Tag, AlertTriangle, FileSearch, BookOpen, Loader2, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  summary?: string
  keyPoints?: string[]
  tags?: string[]
  sentiment?: string
  risks?: Array<{ description: string; severity: string; recommendation: string }>
  level?: string
  overallScore?: number
  parties?: string[]
  effectiveDate?: string | null
  expirationDate?: string | null
  keyObligations?: string[]
}

interface DocumentAnalyzerProps {
  documentId: string
  documentName: string
}

const analysisTypes = [
  { type: "summary", label: "Summary", icon: BookOpen, color: "text-cyan-500" },
  { type: "keypoints", label: "Key Points", icon: FileSearch, color: "text-violet-500" },
  { type: "tags", label: "Auto-Tag", icon: Tag, color: "text-amber-500" },
  { type: "risks", label: "Risk Analysis", icon: AlertTriangle, color: "text-red-500" },
  { type: "contract", label: "Contract Analysis", icon: FileText, color: "text-emerald-500" },
]

export function DocumentAnalyzer({ documentId, documentName }: DocumentAnalyzerProps) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, AnalysisResult>>({})
  const { toast } = useToast()

  const analyzeMutation = useMutation({
    mutationFn: async (analysisType: string) => {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, analysisType }),
      })
      if (!res.ok) throw new Error("Analysis failed")
      return res.json()
    },
    onSuccess: (data, analysisType) => {
      setResults((prev) => ({ ...prev, [analysisType]: data }))
      setActiveType(analysisType)
    },
    onError: () => toast({ title: "Analysis failed", variant: "destructive" }),
  })

  const renderResult = (type: string, result: AnalysisResult) => {
    switch (type) {
      case "summary":
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
            {result.sentiment && (
              <Badge variant="outline" className={
                result.sentiment === "positive" ? "border-emerald-300 text-emerald-700" :
                result.sentiment === "negative" ? "border-red-300 text-red-700" :
                "border-slate-300 text-slate-600"
              }>
                Sentiment: {result.sentiment}
              </Badge>
            )}
          </div>
        )
      case "keypoints":
        return (
          <ul className="space-y-2">
            {result.keyPoints?.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                {point}
              </li>
            ))}
          </ul>
        )
      case "tags":
        return (
          <div className="flex flex-wrap gap-2">
            {result.tags?.map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                {tag}
              </Badge>
            ))}
          </div>
        )
      case "risks":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={
                result.level === "CRITICAL" ? "bg-red-600" :
                result.level === "HIGH" ? "bg-red-500" :
                result.level === "MEDIUM" ? "bg-amber-500" :
                "bg-emerald-500"
              }>
                {result.level} RISK
              </Badge>
              <span className="text-sm text-slate-500">Score: {result.overallScore}/100</span>
            </div>
            <div className="space-y-2">
              {result.risks?.map((risk, i) => (
                <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm font-medium text-red-800">{risk.description}</p>
                  <p className="text-xs text-red-600 mt-1">{risk.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case "contract":
        return (
          <div className="space-y-3 text-sm">
            {result.parties && result.parties.length > 0 && (
              <div>
                <p className="font-medium text-slate-600 mb-1">Parties</p>
                <div className="flex flex-wrap gap-1">
                  {result.parties.map((p, i) => <Badge key={i} variant="outline">{p}</Badge>)}
                </div>
              </div>
            )}
            {(result.effectiveDate || result.expirationDate) && (
              <div className="grid grid-cols-2 gap-2">
                {result.effectiveDate && (
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-xs text-slate-500">Effective</p>
                    <p className="font-medium">{result.effectiveDate}</p>
                  </div>
                )}
                {result.expirationDate && (
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-xs text-slate-500">Expires</p>
                    <p className="font-medium text-red-700">{result.expirationDate}</p>
                  </div>
                )}
              </div>
            )}
            {result.keyObligations && result.keyObligations.length > 0 && (
              <div>
                <p className="font-medium text-slate-600 mb-1">Key Obligations</p>
                <ul className="space-y-1">
                  {result.keyObligations.map((o, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-emerald-500">•</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      default:
        return <pre className="text-xs text-slate-600">{JSON.stringify(result, null, 2)}</pre>
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" /> AI Analysis
          <span className="text-slate-400 font-normal ml-1 truncate max-w-[200px]">{documentName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Analysis type buttons */}
        <div className="flex flex-wrap gap-2">
          {analysisTypes.map(({ type, label, icon: Icon, color }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5",
                activeType === type ? "border-cyan-400 bg-cyan-50 text-cyan-700" : ""
              )}
              onClick={() => {
                if (results[type]) {
                  setActiveType(activeType === type ? null : type)
                } else {
                  analyzeMutation.mutate(type)
                }
              }}
              disabled={analyzeMutation.isPending && analyzeMutation.variables === type}
            >
              {analyzeMutation.isPending && analyzeMutation.variables === type ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Icon className={cn("w-3 h-3", color)} />
              )}
              {label}
            </Button>
          ))}
        </div>

        {/* Results */}
        {analyzeMutation.isPending && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {activeType && results[activeType] && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 border-t border-slate-100"
          >
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
              {analysisTypes.find((t) => t.type === activeType)?.label} Results
            </p>
            {renderResult(activeType, results[activeType])}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
