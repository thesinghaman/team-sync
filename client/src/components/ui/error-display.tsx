import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import {
  AlertTriangle,
  Wifi,
  Lock,
  FileX,
  Server,
  RefreshCw,
  Home,
  Shield,
  Mail,
} from "lucide-react";
import { UserFriendlyError } from "../../utils/error-handler";

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

const getErrorIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("connection") || lowerTitle.includes("network")) {
    return <Wifi className="h-4 w-4" />;
  }
  if (
    lowerTitle.includes("access") ||
    lowerTitle.includes("permission") ||
    lowerTitle.includes("denied")
  ) {
    return <Lock className="h-4 w-4" />;
  }
  if (lowerTitle.includes("not found")) {
    return <FileX className="h-4 w-4" />;
  }
  if (lowerTitle.includes("server") || lowerTitle.includes("service")) {
    return <Server className="h-4 w-4" />;
  }
  if (lowerTitle.includes("authentication") || lowerTitle.includes("session")) {
    return <Shield className="h-4 w-4" />;
  }
  if (lowerTitle.includes("email") || lowerTitle.includes("verify")) {
    return <Mail className="h-4 w-4" />;
  }

  return <AlertTriangle className="h-4 w-4" />;
};

const getActionButton = (
  action: string,
  onRetry?: () => void,
  onGoHome?: () => void
) => {
  const lowerAction = action.toLowerCase();

  if (lowerAction.includes("retry") || lowerAction.includes("try again")) {
    return (
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
        <RefreshCw className="h-3 w-3 mr-1" />
        {action}
      </Button>
    );
  }

  if (lowerAction.includes("home") || lowerAction.includes("go")) {
    return (
      <Button variant="outline" size="sm" onClick={onGoHome} className="mt-2">
        <Home className="h-3 w-3 mr-1" />
        {action}
      </Button>
    );
  }

  // For other actions, just show the text
  return (
    <div className="mt-2 text-sm text-muted-foreground">
      Suggested action: {action}
    </div>
  );
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onGoHome,
  className = "",
}) => {
  const icon = getErrorIcon(error.title);

  return (
    <Alert
      className={`border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive ${className}`}
    >
      {icon}
      <AlertTitle className="text-destructive">{error.title}</AlertTitle>
      <AlertDescription className="text-destructive/90">
        {error.message}
        {error.action && getActionButton(error.action, onRetry, onGoHome)}
      </AlertDescription>
    </Alert>
  );
};

// Compact version for inline errors
export const InlineErrorDisplay: React.FC<{
  error: UserFriendlyError;
  className?: string;
}> = ({ error, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
    >
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};

// Full page error component
export const FullPageError: React.FC<{
  error: UserFriendlyError;
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ error, onRetry, onGoHome }) => {
  const icon = getErrorIcon(error.title);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          {React.cloneElement(icon, { className: "h-8 w-8 text-destructive" })}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">{error.title}</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>

        {error.action && (
          <div className="flex gap-3 justify-center">
            {error.action.toLowerCase().includes("retry") && onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                {error.action}
              </Button>
            )}
            {error.action.toLowerCase().includes("home") && onGoHome && (
              <Button onClick={onGoHome} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
            {!error.action.toLowerCase().includes("retry") &&
              !error.action.toLowerCase().includes("home") && (
                <div className="text-sm text-muted-foreground">
                  {error.action}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
