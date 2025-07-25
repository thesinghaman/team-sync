/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";

const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<any>(null);

  const onOpenDialog = useCallback((data?: any) => {
    setContext(data || null);
    setOpen(true);
  }, []);

  const onCloseDialog = useCallback(() => {
    setContext(null);
    setOpen(false);
  }, []);

  return {
    open,
    context,
    onOpenDialog,
    onCloseDialog,
  };
};

export default useConfirmDialog;
