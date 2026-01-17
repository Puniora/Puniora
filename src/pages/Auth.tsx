import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowRight } from "lucide-react";

const Auth = () => {
  const { loginWithOtp, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (user) {
    return <Navigate to="/account" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await loginWithOtp(email);
      setSubmitted(true);
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
           {/* Decorative Background Blur */}
           <div className="absolute inset-0 bg-gold/5 blur-[80px] -z-10 rounded-full" />
           
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to manage your orders and saved addresses.
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl shadow-gold/5 ring-1 ring-gold/10">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="pl-10 h-12 bg-white/50 border-gold/20 focus:border-gold focus:ring-gold/20 transition-all font-medium"
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
                      Send Magic Link <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                   We'll send a secure login link to your email. No password required.
                </p>
              </form>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-heading text-foreground">Check your email</h3>
                    <p className="text-muted-foreground mt-2">
                      We've sent a login link to <span className="font-bold text-foreground">{email}</span>.
                    </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSubmitted(false)}
                  className="border-gold/20 text-muted-foreground hover:text-gold hover:bg-gold/5"
                >
                  Try a different email
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
