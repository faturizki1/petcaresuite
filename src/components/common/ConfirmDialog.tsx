import * as React from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'default' | 'destructive';
}

const variantStyles: Record<NonNullable<ConfirmDialogProps['variant']>, string> = {
  default: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700'
};

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, isLoading = false, variant = 'default' }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button className={variantStyles[variant]} onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
