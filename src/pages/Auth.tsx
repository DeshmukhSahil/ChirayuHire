import { useState } from "react";
import { auth, db } from "@/src/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, Chrome, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Create new user record
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "recruiter", // Default role
          orgId: "default-org", // Default org for demo
          createdAt: new Date().toISOString(),
        });
        toast.success("Welcome to Chirayu Hire! We've set you up as a Recruiter.");
      } else {
        toast.success(`Welcome back, ${user.displayName}!`);
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      if (error.code === "auth/popup-blocked") {
        toast.error("Google Login popup was blocked by your browser. Please allow popups or try Demo Login.");
      } else if (error.code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized in the Firebase console. Please try Demo Login instead.");
      } else if (error.code === "auth/operation-not-allowed") {
        toast.error("Google sign-in is not enabled in Firebase Auth. Please try Demo Login instead.");
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Create new user record for the demo user
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: "demo.recruiter@hireflow.ai",
          displayName: "Demo Recruiter",
          photoURL: "",
          role: "recruiter", // Authorized recruiter role
          orgId: "default-org", // Belongs to default org
          createdAt: new Date().toISOString(),
        });
        toast.success("Welcome! Signed in successfully with a Demo Recruiter account.");
      } else {
        toast.success("Welcome back, Demo Recruiter!");
      }
    } catch (error: any) {
      console.error("Demo login failed:", error);
      if (error.code === "auth/operation-not-allowed") {
        toast.error("Anonymous authentication is disabled in Firebase console. Please enable it to use Demo Login.");
      } else {
        toast.error(error.message || "Demo login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl glass">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tighter">Chirayu Hire AI</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enterprise-grade recruitment platform, powered by Gemini.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 border rounded-lg bg-card/50">
               <p className="text-2xl font-bold">12k+</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Hires Made</p>
            </div>
            <div className="p-4 border rounded-lg bg-card/50">
               <p className="text-2xl font-bold">99%</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Accuracy</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full h-12 gap-3 text-lg font-medium" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
              Continue with Google
            </Button>

            <Button 
              variant="outline"
              className="w-full h-12 gap-3 text-lg font-medium border-primary/20 hover:bg-secondary/50" 
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-amber-500" />}
              Sign in as Demo Recruiter
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to Chirayu Hire's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </CardFooter>
      </Card>
      
      {/* Visual Accents */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-muted to-primary"></div>
    </div>
  );
}
