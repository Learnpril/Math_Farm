import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { AlertCircle } from "lucide-react";

export interface ToolDemoProps {
  title: string;
  description: string;
  demoType: "graphing" | "calculator" | "solver";
  interactive: boolean;
  children: ReactNode;
  error?: string | null;
  isLoading?: boolean;
  className?: string;
}

export const ToolDemo: React.FC<ToolDemoProps> = ({
  title,
  description,
  demoType,
  interactive,
  children,
  error,
  isLoading = false,
  className = "",
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {!interactive && (
            <span className="text-xs bg-muted px-2 py-1 rounded">
              Demo Only
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div
            className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Tool Error</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-1">
                Try refreshing the page or using a different browser.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div
            className="flex items-center justify-center p-8"
            role="status"
            aria-label="Loading tool demonstration"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading {demoType} tool...</span>
          </div>
        ) : (
          <div className="space-y-4">{children}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToolDemo;
