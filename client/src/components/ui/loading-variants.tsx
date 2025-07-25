import { Loading } from "./loading";

// Pre-configured loading variants for common use cases
export const ButtonSpinner = () => <Loading size="sm" variant="spin" />;
export const PageSpinner = () => (
  <Loading size="lg" variant="spin" className="text-primary" />
);
export const CardSpinner = () => (
  <Loading size="md" variant="spin" className="text-primary" />
);
export const TableSpinner = () => (
  <Loading size="md" variant="spin" className="text-muted-foreground" />
);

// Full page overlay loader
export const FullPageLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card shadow-lg border">
      <Loading size="xl" variant="spin" className="text-primary" />
      <p className="text-lg font-medium text-foreground">{text}</p>
    </div>
  </div>
);

// Small inline spinners for buttons, etc.
export const SmallSpinner = ({ className = "" }: { className?: string }) => (
  <Loading size="xs" variant="spin" className={className} />
);
