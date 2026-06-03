"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, FileText, Shield, Zap, Users, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

const features = [
  { icon: Shield, title: "Enterprise Security", desc: "SOC2 compliant with end-to-end encryption" },
  { icon: Zap, title: "Lightning Fast", desc: "Powered by Google Drive infrastructure" },
  { icon: Users, title: "Team Collaboration", desc: "Real-time comments, workflows & signatures" },
]

const testimonial = {
  quote: "LookUp DMS transformed how our 500+ person team manages documents. Incredible product.",
  author: "Sarah Chen",
  role: "CTO, Meridian Technologies",
  avatar: "SC",
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setError("Invalid email or password. Please try again.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0C4A6E 70%, #06B6D4 100%)",
        }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                background: `rgba(6, 182, 212, ${0.03 + i * 0.01})`,
                top: `${-20 + i * 25}%`,
                right: `${-10 + i * 5}%`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 45, 0],
              }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Logo */}
        <motion.div
          className="relative z-10 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">LookUp</span>
            <span className="text-xl font-light text-cyan-400"> DMS</span>
          </div>
        </motion.div>

        {/* Center content */}
        <motion.div
          className="relative z-10 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              The Document Hub
              <br />
              <span className="text-gradient bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Your Team Deserves
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Centralize, collaborate, and control your organization&apos;s documents with enterprise-grade security.
            </p>
          </div>

          <div className="grid gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          className="relative z-10 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-slate-200 text-sm italic leading-relaxed mb-4">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {testimonial.avatar}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{testimonial.author}</p>
              <p className="text-slate-400 text-xs">{testimonial.role}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Sign In Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 bg-[rgb(var(--background))]"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">LookUp DMS</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-1">Welcome back</h2>
              <p className="text-[rgb(var(--muted-foreground))]">Sign in to your workspace</p>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full mb-4 font-medium hover:bg-[rgb(var(--muted))] transition-all"
              onClick={handleGoogleSignIn}
              loading={googleLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgb(var(--border))]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[rgb(var(--background))] px-2 text-[rgb(var(--muted-foreground))]">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={cn("h-11", errors.email && "border-red-500")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="/forgot-password" className="text-xs text-[rgb(var(--accent))] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn("h-11 pr-10", errors.password && "border-red-500")}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-medium"
                loading={isSubmitting}
              >
                {!isSubmitting && (
                  <>
                    Sign in <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-[rgb(var(--muted-foreground))] mt-6">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-[rgb(var(--accent))] font-medium hover:underline">
                Contact your admin
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
