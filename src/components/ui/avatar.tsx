"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AvatarContext = React.createContext<{
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
}>({
  imageLoaded: false,
  setImageLoaded: () => {},
});

export function Avatar({ children, className, ...props }: AvatarProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export function AvatarImage({ src, alt, className, ...props }: AvatarImageProps) {
  const { setImageLoaded } = React.useContext(AvatarContext);

  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageLoaded(false)}
      {...props}
    />
  );
}

export function AvatarFallback({ children, className, ...props }: AvatarFallbackProps) {
  const { imageLoaded } = React.useContext(AvatarContext);

  if (imageLoaded) return null;

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

