"use client";

import { useRef } from "react";

import { ConfirmDialog } from "./overlays";

interface ConfirmButtonProps {
  children: string;
  message: string;
  className?: string;
}

export function ConfirmButton({
  children,
  message,
  className,
}: ConfirmButtonProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={anchorRef}>
      <ConfirmDialog
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
