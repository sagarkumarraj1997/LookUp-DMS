"use client"

import { motion } from "framer-motion"
import { Sparkles, FileSearch, Tag, AlertTriangle, BookOpen, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIChat } from "@/components/ai/ai-chat"
import { Badge } from "@/components/ui/badge"

const AI_CAPABILITIES = [
  { label: "Document Summarization", icon: BookOpen, color: "text-cyan-500" },
  { label: "Key Points Extraction", icon: FileSearch, color: "text-violet-500" },
  { label: "Auto-Tagging", icon: Tag, color: "text-amber-500" },
  { label: "Risk Detection", icon: AlertTriangle, color: "text-red-500" },
  { label: "Contract Analysis", icon: FileSearch, color: "text-emerald-500" },
  { label: "Semantic Search", icon: Sparkles, color: "text-cyan-600" },
]

export default function AIPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 h-[calc(100vh-8rem)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-cyan-500" /> AI Assistant
          </h1>
          <p className="text-slate-500 text-sm mt-1">Chat with AI, analyze documents, and automate insights</p>
        </div>
        <Badge className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white border-0">
          Powered by GPT-4
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-6 h-[calc(100%-5rem)]">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {AI_CAPABILITIES.map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 py-1">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                "Analyze latest uploads",
                "Find unsigned contracts",
                "Summarize this week's activity",
                "Suggest tags for documents",
              ].map((action) => (
                <button
                  key={action}
                  className="w-full text-left text-xs text-slate-600 hover:text-cyan-600 py-1.5 px-2 rounded hover:bg-cyan-50 transition-colors"
                >
                  {action}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="col-span-3">
          <Card className="border-0 shadow-sm h-full flex flex-col overflow-hidden">
            <AIChat />
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
