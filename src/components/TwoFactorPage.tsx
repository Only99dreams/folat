import { useRef, useState } from "react";
import { Smartphone, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TwoFactorPage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...code];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setCode(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join("");
    // TODO: verify OTP
    console.log({ otp });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ───── Top Navbar ───── */}
      <header className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FOLAT Multipurpose Investment"
              className="h-10"
            />
          </Link>
          <button className="px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors">
            Help Center
          </button>
        </div>
      </header>

      {/* ───── Main Content ───── */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg border-2 border-dashed border-gray-300 rounded-2xl p-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-white" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-navy-900">
                Two-factor authentication
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                We've sent a 6-digit verification code to your registered mobile
                device ending in{" "}
                <span className="font-semibold text-navy-900">• • • • 4921</span>.
              </p>
            </div>

            {/* OTP Inputs */}
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="flex items-center justify-center gap-3">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-lg font-semibold text-navy-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-300"
                    placeholder="-"
                  />
                ))}
              </div>

              {/* Resend */}
              <p className="text-sm text-gray-500">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="font-semibold text-navy-900 hover:text-green-600 transition-colors underline"
                >
                  Resend Code
                </button>
              </p>

              {/* Submit */}
              <button
                type="submit"
                className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all"
              >
                Verify &amp; Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="w-full max-w-sm border-t border-gray-200" />

            {/* Security footer */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Lock className="w-4 h-4" />
                <p className="text-[10px] tracking-[0.15em] uppercase font-medium">
                  Secure Bank-Level Encryption
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="inline-block w-8 h-5 bg-gray-300 rounded" />
                <span className="inline-block w-8 h-5 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
