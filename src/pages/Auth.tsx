import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowRight, KeyRound, ArrowLeft } from "lucide-react";

const Auth = () => {
  const { loginWithOtp, verifyOtp, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  if (user) {
    return <Navigate to="/account" replace />;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await loginWithOtp(email);
      setStep("otp");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    try {
      await verifyOtp(email, otp);
      navigate("/account");
    } catch (error) {
      // Error handled in context
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
          {/* Decorative Background Blur */}
          <div className="absolute inset-0 bg-gold/5 blur-[80px] -z-10 rounded-full" />

          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading text-white tracking-wide">Welcome Back</h1>
            <p className="text-muted-foreground text-lg">
              {step === "email"
                ? "Sign in to manage your orders and saved addresses."
                : "Enter the verification code sent to your email."}
            </p>
          </div>

          <div className="glass p-8 rounded-3xl shadow-[0_0_50px_-10px_rgba(255,85,0,0.1)] border-orange-500/10">
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gold/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-black/40 border-white/10 focus:border-gold focus:ring-gold/10 transition-all font-medium text-white placeholder:text-white/30"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send a verification code to your email.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp" className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Verification Code</Label>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-xs text-gold hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> Change email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gold/50" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="pl-10 h-12 bg-black/40 border-white/10 focus:border-gold focus:ring-gold/10 transition-all font-medium text-center tracking-[0.5em] text-2xl text-white"
                      maxLength={8}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Code sent to <span className="font-bold text-foreground">{email}</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full h-12 bg-gold hover:bg-gold/90 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-xs text-gold hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
