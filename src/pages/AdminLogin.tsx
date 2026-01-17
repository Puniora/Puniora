import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        localStorage.setItem("isAdminAuthenticated", "true"); // Keep locally for simple route protection
        // Ideally we would use proper auth context, but this bridges the gap for now
        toast.success("Welcome back, Admin");
        navigate("/admin");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Authentication failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading tracking-widest text-gold uppercase mb-2">Puniora</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="border-border shadow-soft">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@puniora.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Puniora Fragrances. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
