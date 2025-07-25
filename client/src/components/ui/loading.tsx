import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "spin" | "pulse" | "dots" | "bars";
  className?: string;
  text?: string;
  overlay?: boolean;
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const LoadingSpinner = ({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) => <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />;

const LoadingPulse = ({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-full bg-current animate-pulse",
      sizeClasses[size],
      className
    )}
  />
);

const LoadingDots = ({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) => {
  const dotSize =
    size === "xs"
      ? "h-1 w-1"
      : size === "sm"
      ? "h-1.5 w-1.5"
      : size === "md"
      ? "h-2 w-2"
      : size === "lg"
      ? "h-2.5 w-2.5"
      : "h-3 w-3";

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div
        className={cn("bg-current rounded-full animate-pulse", dotSize)}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn("bg-current rounded-full animate-pulse", dotSize)}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn("bg-current rounded-full animate-pulse", dotSize)}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
};

const LoadingBars = ({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) => {
  const barHeight =
    size === "xs"
      ? "h-3"
      : size === "sm"
      ? "h-4"
      : size === "md"
      ? "h-6"
      : size === "lg"
      ? "h-8"
      : "h-12";

  return (
    <div className={cn("flex items-end space-x-1", className)}>
      <div
        className={cn("w-1 bg-current animate-pulse rounded-sm", barHeight)}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn("w-1 bg-current animate-pulse rounded-sm", barHeight)}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn("w-1 bg-current animate-pulse rounded-sm", barHeight)}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
};

export const Loading = ({
  size = "md",
  variant = "spin",
  className = "",
  text,
  overlay = false,
}: LoadingProps) => {
  const renderLoader = () => {
    switch (variant) {
      case "pulse":
        return <LoadingPulse size={size} className={className} />;
      case "dots":
        return <LoadingDots size={size} className={className} />;
      case "bars":
        return <LoadingBars size={size} className={className} />;
      default:
        return <LoadingSpinner size={size} className={className} />;
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        text && "flex-col sm:flex-row",
        overlay && "absolute inset-0 bg-background/80 backdrop-blur-sm z-50"
      )}
    >
      {renderLoader()}
      {text && (
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  return overlay ? <div className="relative">{content}</div> : content;
};

// Button loading states
export const ButtonLoading = ({
  size = "sm",
  className = "",
  text = "Loading...",
}: Omit<LoadingProps, "variant" | "overlay"> & { text?: string }) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner size={size} className={className} />
    <span>{text}</span>
  </div>
);

// Page loading overlay
export const PageLoading = ({
  text = "Loading...",
  size = "lg",
}: Pick<LoadingProps, "text" | "size">) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size={size} className="text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Inline loading for replacing content
export const InlineLoading = ({
  text,
  size = "md",
  className = "",
}: Pick<LoadingProps, "text" | "size" | "className">) => (
  <div className={cn("flex items-center justify-center py-8", className)}>
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} className="text-primary" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  </div>
);

export default Loading;
