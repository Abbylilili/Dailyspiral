import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { toast } from "sonner";
import { LogIn, UserPlus, Apple, ArrowRight } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = () => {
    toast.info("Apple Login is coming soon for iOS!");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#E0C3FC] via-[#F7D1CD] to-[#D0F4DE] overflow-hidden relative">
      {/* Decorative Pastel Bubbles */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-tr from-purple-400 to-pink-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200"
            >
              <LogIn className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
              {isSignUp ? "Join the Spiral" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-slate-500 mt-2 text-base">
              {isSignUp ? "Start your journey to self-growth" : "Step into your daily spiral of growth"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-10 space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 ml-1">Email</Label>
                <Input
                  type="email"
                  placeholder="hello@example.com"
                  className="h-14 rounded-2xl border-0 bg-slate-100/50 focus-visible:ring-purple-400/50 transition-all text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 ml-1">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-14 rounded-2xl border-0 bg-slate-100/50 focus-visible:ring-purple-400/50 transition-all text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-bold shadow-xl shadow-purple-200 transition-all active:scale-[0.98]"
              >
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-slate-400">Or continue with</span></div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleAppleLogin}
              className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all flex items-center justify-center gap-3"
            >
              <Apple className="w-5 h-5" />
              Sign in with Apple
            </Button>

            <p className="text-center text-slate-500 text-sm mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-500 font-bold hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
