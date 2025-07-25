import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/loading-variants";
import { createPortal } from "react-dom";

interface SafeConfirmDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  children?: React.ReactNode;
}

export const SafeConfirmDialog: React.FC<SafeConfirmDialogProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Simple focus on the dialog container
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative bg-background p-6 rounded-lg shadow-lg w-full max-w-md mx-4 focus:outline-none"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {children && <div className="py-4">{children}</div>}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoading) {
                  onClose();
                }
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
              type="button"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "default" : variant}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoading) {
                  onConfirm();
                }
              }}
              disabled={isLoading}
              className={`w-full sm:w-auto ${
                variant === "destructive"
                  ? "bg-black hover:bg-black/90 text-white"
                  : ""
              }`}
              type="button"
            >
              {isLoading && <ButtonSpinner />}
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
