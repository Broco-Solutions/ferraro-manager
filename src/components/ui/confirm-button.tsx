"use client";

import { useRef } from "react";

import { ConfirmDialog } from "./overlays";

interface ConfirmButtonProps {
  children: string;
  message: string;
  className?: string;
  disabled?: boolean;
}

export function ConfirmButton({
  children,
  message,
  className,
  disabled,
}: ConfirmButtonProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={anchorRef}>
      <ConfirmDialog
        isDisabled={disabled}
        confirmLabel={children}
        description={message}
        onConfirm={() => anchorRef.current?.closest("form")?.requestSubmit()}
        title="Confirmar acción"
        triggerClassName={className}
        triggerLabel={children}
      />
    </span>
  );
}
