import Image from "next/image";
import type { ReactNode } from "react";
export function AppHeader({
  title,
  action,
  titleAction,
}: {
  title: string;
  action?: ReactNode;
  titleAction?: ReactNode;
}) {
  return (
    <header className="app-header">
      <div className="app-header-branding">
        <div className="company-logo">
          <Image
            src="/homie-logo.svg"
            alt="Homie D’Lion"
            width={842}
            height={595}
            className="company-logo-image"
            unoptimized
            priority
          />
        </div>
        {action && <div className="app-header-action">{action}</div>}
      </div>
      <p className="app-header-subtitle">CHẤM CÔNG NỘI BỘ</p>
      <div className={`app-header-title${titleAction ? " has-action" : ""}`}>
        <h1>{title}</h1>
        {titleAction}
      </div>
    </header>
  );
}
