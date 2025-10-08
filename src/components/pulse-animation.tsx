"use client";

import { cn } from "@/lib/utils";

interface PulseAnimationProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "success" | "warning" | "danger";
  intensity?: "subtle" | "normal" | "strong";
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-4 w-4",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const colorClasses = {
  primary: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
};

const intensityClasses = {
  subtle: "opacity-30",
  normal: "opacity-50",
  strong: "opacity-70",
};

export function PulseAnimation({ 
  className, 
  size = "md", 
  color = "primary", 
  intensity = "normal" 
}: PulseAnimationProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Main pulse dot */}
      <div 
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
      
      {/* Expanding ring 1 */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full animate-ping",
          sizeClasses[size],
          colorClasses[color],
          intensityClasses[intensity]
        )}
        style={{ animationDuration: "2s" }}
      />
      
      {/* Expanding ring 2 */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full animate-ping",
          sizeClasses[size],
          colorClasses[color],
          intensityClasses[intensity]
        )}
        style={{ 
          animationDuration: "2s",
          animationDelay: "0.5s"
        }}
      />
    </div>
  );
}

interface PulseIndicatorProps {
  status: "active" | "inactive" | "warning" | "error";
  label?: string;
  className?: string;
}

export function PulseIndicator({ status, label, className }: PulseIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "primary";
      case "warning":
        return "warning";
      case "error":
        return "danger";
      default:
        return "primary";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "Active";
      case "warning":
        return "Warning";
      case "error":
        return "Error";
      default:
        return "Inactive";
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <PulseAnimation 
        color={getStatusColor() as "primary" | "success" | "warning" | "danger"}
        size="sm"
        intensity={status === "active" ? "strong" : "normal"}
      />
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}: {getStatusText()}
        </span>
      )}
    </div>
  );
}

interface HeartbeatAnimationProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function HeartbeatAnimation({ className, size = "md" }: HeartbeatAnimationProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "text-primary animate-pulse",
          sizeClasses[size]
        )}
        style={{ 
          animation: "heartbeat 1.5s ease-in-out infinite",
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="w-full h-full"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <style jsx>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.1); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
