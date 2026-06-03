"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  FileText,
  PenSquare,
  Brain,
  GitBranch,
  Users,
  ShieldCheck,
  GraduationCap,
  Building2,
  Stethoscope,
  Scale,
  CheckCircle2,
  Star,
  ArrowRight,
  Zap,
} from "lucide-react"

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

const features = [
  { icon: FileText, title: "Document Management", desc: "Organize, version, and manage all your files with Google Drive integration and unlimited storage.", color: "text-cyan-400" },
  { icon: PenSquare, title: "E-Signatures", desc: "Send documents for signature with automated workflows, audit trails, and legal compliance.", color: "text-purple-400" },
  { icon: Brain, title: "AI Assistant", desc: "Instantly summarize documents, extract key points, auto-tag files, and answer questions.", color: "text-pink-400" },
  { icon: GitBranch, title: "Workflow Automation", desc: "Build approval pipelines, auto-assign tasks, and trigger actions on document events.", color: "text-amber-400" },
  { icon: Users, title: "Real-Time Collaboration", desc: "Live presence, comments, @mentions, and shared notes with your entire team.", color: "text-green-400" },
  { icon: ShieldCheck, title: "Enterprise Security", desc: "RBAC, MFA, audit logs, IP allowlisting, and end-to-end encryption for compliance.", color: "text-blue-400" },
]

const useCases = [
  { icon: GraduationCap, title: "Universities", desc: "Manage research papers, student records, and institutional documents securely.", color: "bg-indigo-500/10 border-indigo-500/20" },
  { icon: Building2, title: "Enterprises", desc: "Streamline cross-department workflows and document governance at scale.", color: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: Stethoscope, title: "Healthcare", desc: "HIPAA-compliant document handling for patient records and clinical workflows.", color: "bg-green-500/10 border-green-500/20" },
  { icon: Scale, title: "Legal Firms", desc: "Secure client portals, contract management, and e-signature workflows.", color: "bg-purple-500/10 border-purple-500/20" },
]

const comparisons = [
  { feature: "AI Document Summary", lookup: true, box: false, dropbox: false, sharepoint: false },
  { feature: "Built-in E-Signatures", lookup: true, box: true, dropbox: false, sharepoint: false },
  { feature: "Workflow Automation", lookup: true, box: false, dropbox: false, sharepoint: true },
  { feature: "Real-time Collaboration", lookup: true, box: true, dropbox: true, sharepoint: true },
  { feature: "Granular RBAC", lookup: true, box: true, dropbox: false, sharepoint: true },
  { feature: "Offline PWA Support", lookup: true, box: false, dropbox: false, sharepoint: false },
  { feature: "Open API", lookup: true, box: true, dropbox: true, sharepoint: true },
  { feature: "Pricing", lookup: "Free–$49", box: "$20+", dropbox: "$15+", sharepoint: "$12+" },
]

const plans = [
  {
    name: "Starter", price: "$0", period: "/mo", cta: "Get Started Free", ctaHref: "/register",
    features: ["Up to 5 users", "10 GB storage", "3 repositories", "Basic workflows", "E-mail support"],
    highlight: false,
  },
  {
    name: "Professional", price: "$49", period: "/mo", cta: "Start Free Trial", ctaHref: "/register",
    features: ["Up to 50 users", "500 GB storage", "Unlimited repos", "AI assistant", "E-signatures", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "", cta: "Contact Sales", ctaHref: "mailto:sales@lookupdms.com",
    features: ["Unlimited users", "Unlimited storage", "SSO / SAML", "Custom workflows", "SLA guarantee", "Dedicated support"],
    highlight: false,
  },
]

const testimonials = [
  { name: "Sarah Chen", company: "Stanford University", role: "CIO", quote: "LookUp DMS replaced three separate tools. The AI summary feature alone saves our research team 10 hours a week.", avatar: "SC" },
  { name: "Marcus Williams", company: "Apex Legal Group", role: "Managing Partner", quote: "The e-signature workflow is flawless. We close client contracts 4x faster than before.", avatar: "MW" },
  { name: "Priya Sharma", company: "HealthFirst Inc.", role: "Head of IT", quote: "HIPAA compliance was a deal-breaker for us. LookUp DMS handled it out of the box. Exceptional product.", avatar: "PS" },
]

function Check() { return <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> }

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-lg">LookUp DMS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm px-4 py-1.5 rounded-full mb-8">
              <Zap className="w-3.5 h-3.5" />
              Powered by AI · Built for Enterprise
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Enterprise Document{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Management, Reimagined
              </span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
              Organize, sign, automate, and collaborate on documents with AI-powered intelligence.
              Replace Box, Dropbox, and DocuSign with one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-700 transition-colors">
                View Demo
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-4">No credit card required · Free forever plan · SOC 2 compliant</p>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-16 relative"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 mx-4 bg-slate-700 rounded h-5 text-xs text-slate-500 flex items-center px-3">app.lookupdms.com/dashboard</div>
              </div>
              <div className="p-6 flex gap-4" style={{ height: 280 }}>
                <div className="w-48 bg-slate-900/50 rounded-xl p-4 space-y-2">
                  {["Dashboard", "Repositories", "Documents", "Signatures", "Workflows", "Notes", "Analytics"].map(item => (
                    <div key={item} className={`h-7 rounded-lg flex items-center px-3 text-xs ${item === "Dashboard" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[["Total Files", "2,847", "text-cyan-400"], ["Storage Used", "48.2 GB", "text-purple-400"], ["Active Workflows", "12", "text-green-400"]].map(([label, val, color]) => (
                      <div key={label} className="bg-slate-900/50 rounded-xl p-4">
                        <div className="text-slate-500 text-xs mb-1">{label}</div>
                        <div className={`text-xl font-bold ${color}`}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 flex-1">
                    <div className="h-3 bg-slate-700 rounded w-32 mb-3" />
                    <div className="space-y-2">
                      {[80, 60, 45, 70, 55].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-slate-700 rounded" />
                          <div className="bg-slate-700 rounded h-3 flex-1" style={{ maxWidth: `${w}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need in one platform</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">From document storage to AI summaries to e-signatures — LookUp DMS handles your entire document lifecycle.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
              >
                <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for every industry</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((u, i) => (
              <motion.div key={u.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className={`border rounded-2xl p-6 ${u.color}`}>
                <u.icon className="w-8 h-8 mb-4 text-white/80" />
                <h3 className="text-white font-semibold mb-2">{u.title}</h3>
                <p className="text-slate-400 text-sm">{u.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Better than Box, Dropbox & SharePoint</h2>
          </motion.div>
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-700 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">Feature</th>
                  <th className="px-6 py-4 text-cyan-400 font-semibold">LookUp DMS</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Box</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Dropbox</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">SharePoint</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-slate-700/50 ${i % 2 === 0 ? "" : "bg-slate-800/20"}`}>
                    <td className="px-6 py-4 text-slate-300">{row.feature}</td>
                    {[row.lookup, row.box, row.dropbox, row.sharepoint].map((val, j) => (
                      <td key={j} className="px-6 py-4 text-center">
                        {typeof val === "boolean" ? (
                          val ? <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-slate-600">—</span>
                        ) : (
                          <span className={j === 0 ? "text-cyan-400 font-medium" : "text-slate-400"}>{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start free. Scale as you grow.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 border ${plan.highlight ? "bg-gradient-to-b from-cyan-500/10 to-purple-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20" : "bg-slate-800/50 border-slate-700"}`}
              >
                {plan.highlight && <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">Most Popular</div>}
                <h3 className="text-white text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-3 rounded-xl font-medium transition-opacity ${plan.highlight ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90" : "bg-slate-700 text-white hover:bg-slate-600"}`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by teams worldwide</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-bold mb-4">Ready to transform your document workflow?</h2>
            <p className="text-slate-400 text-lg mb-8">Join thousands of teams already using LookUp DMS to move faster.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="font-bold text-white">LookUp DMS</span>
            </Link>
            <div className="flex gap-8 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <a href="mailto:support@lookupdms.com" className="hover:text-white">Support</a>
              <Link href="/docs" className="hover:text-white">Docs</Link>
            </div>
            <p className="text-slate-500 text-sm">© 2024 LookUp DMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
