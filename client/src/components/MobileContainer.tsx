import { type ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="relative w-full max-w-md min-h-[600px] max-h-[740px] h-[calc(100vh-2rem)] bg-card rounded-[40px] soft-shadow-lg overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
