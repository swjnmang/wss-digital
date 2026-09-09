import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface TaskLayoutProps {
  breadcrumbs: Breadcrumb[];
  title: string;
  description?: string;
  backHref: string;
  onReset?: () => void;
  resetLabel?: string;
  children: ReactNode;
}

export default function TaskLayout({
  breadcrumbs,
  title,
  description,
  backHref,
  onReset,
  resetLabel = "Neue Aufgabe",
  children,
}: TaskLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-slate-900">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
          <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <span className="text-slate-300">/</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-[var(--accent)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
              {description && (
                <p className="text-slate-600 max-w-2xl">{description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={backHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Link>
              {onReset && (
                <button
                  onClick={onReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  {resetLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}

export const taskCardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors";

export const infoBoxClass = "bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900";

export function FeedbackBanner({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div
      className={`rounded-lg p-4 text-sm font-medium border ${
        correct
          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
          : "bg-amber-50 text-amber-900 border-amber-200"
      }`}
    >
      {children}
    </div>
  );
}

export function SolutionBox({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-slate-200 pt-6 space-y-3">
      <div className={`${infoBoxClass} space-y-2`}>{children}</div>
    </div>
  );
}
