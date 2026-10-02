"use client";

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
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
