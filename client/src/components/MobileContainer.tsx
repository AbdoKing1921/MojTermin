import { type ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-background flex items-start justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-background flex flex-col border-x border-border/30">
        {children}
      </div>
    </div>
  );
}
