import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [localOpen, setLocalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = React.useCallback(
    (val: boolean) => {
      setLocalOpen(val);
      if (onOpenChange) onOpenChange(val);
    },
    [onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setOpen } = React.useContext(DialogContext);
  return React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      const childProps = (children as React.ReactElement).props;
      if (childProps.onClick) childProps.onClick(e);
      setOpen(true);
    }
  });
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(DialogContext);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-[#04060b]/80 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={cn(
              "relative z-50 w-full max-w-lg glass-panel bg-card/95 rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col max-h-[85vh] overflow-y-auto",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-md opacity-70 hover:opacity-100 hover:bg-white/5 p-1.5 transition-all text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-left pb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold leading-none text-foreground", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-row justify-end space-x-2 pt-4 border-t border-white/5 mt-4", className)} {...props} />;
}

export function DialogClose({ children }: { children: React.ReactNode }) {
  const { setOpen } = React.useContext(DialogContext);
  return React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      const childProps = (children as React.ReactElement).props;
      if (childProps.onClick) childProps.onClick(e);
      setOpen(false);
    }
  });
}
