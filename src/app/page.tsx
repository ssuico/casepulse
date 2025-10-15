"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to cases after a brief loading state
    const timer = setTimeout(() => {
      router.push("/cases");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0F5F9 0%, #C9D6DF 100%)' }}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: '#bfc7d1' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: '#bfc7d1', animationDelay: "1s" }} />
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-lg mx-auto mb-4">
            <Activity className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mt-4">
            Case Pulse
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Real-time Amazon case monitoring
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Loading your cases...
        </p>
      </div>
    </div>
  );
}
