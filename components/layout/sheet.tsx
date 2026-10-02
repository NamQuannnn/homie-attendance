"use client";
import { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const headingId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const viewport = window.visualViewport;
    const fitKeyboard = () => {
      if (dialog && viewport)
        dialog.style.maxHeight = `${Math.max(200, viewport.height - 16)}px`;
    };
    fitKeyboard();
    viewport?.addEventListener("resize", fitKeyboard);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
      viewport?.removeEventListener("resize", fitKeyboard);
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={headingId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet-body">
        <div className="handle" />
        <div className="sheet-heading">
          <h2 id={headingId}>{title}</h2>
          <button className="icon-button" aria-label="Đóng" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
