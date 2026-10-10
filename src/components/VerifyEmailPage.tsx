import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setError("Invalid verification link")
      setLoading(false)
      return
    }

    const verify = async () => {
      setLoading(true)
      setError("")
      setSuccess(false)

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ token, email }),
          }
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.success === false) {
          throw new Error(data?.error || data?.message || "Verification failed");
        }

        setSuccess(true)
        toast.success("Email verified successfully! Please log in.")
        setTimeout(() => {
          window.location.href = "/"
        }, 1000)
      } catch (err) {
        console.error("Verification error:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Verification failed. Please try again or request a new verification link."
        )
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [searchParams, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
            </a>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500" />
            </div>
            <p className="mt-4 text-navy-900">Verifying your email...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
            </a>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <div className="text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-900 hover:text-green-600 transition-colors"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    toast.success("Email verified successfully! Please log in.")
    setTimeout(() => {
      navigate("/login", { replace: true })
    }, 1500)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FOLAT Multipurpose Investment" className="h-10" />
            </a>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-navy-900">
              Email Verified Successfully
            </h1>
            <p className="mt-2 text-gray-600">
              Your email has been verified. Redirecting to login...
            </p>
          </div>
        </main>
      </div>
    )
  }

  return null
}
