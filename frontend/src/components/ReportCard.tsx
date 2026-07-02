import type { InvestigationReport } from "../types/api";

interface ReportCardProps {
  report: InvestigationReport;
}

const severityConfig: Record<
  string,
  { border: string; bg: string; badge: string; badgeText: string; icon: React.ReactNode }
> = {
  CRITICAL: {
    border: "border-red-200",
    bg: "bg-red-50",
    badge: "bg-red-100",
    badgeText: "text-red-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1L1 14h14L8 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  HIGH: {
    border: "border-orange-200",
    bg: "bg-orange-50",
    badge: "bg-orange-100",
    badgeText: "text-orange-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  MEDIUM: {
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100",
    badgeText: "text-yellow-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  LOW: {
    border: "border-green-200",
    bg: "bg-green-50",
    badge: "bg-green-100",
    badgeText: "text-green-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.36 5.34a.75.75 0 00-1.06-1.06L7.2 8.38 5.28 6.46a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l3.83-3.83z" />
      </svg>
    ),
  },
};

export function ReportCard({ report }: ReportCardProps) {
  if (!report) return null;

  const config = severityConfig[report.severity];

  return (
    <article
      className={`rounded-xl border p-6 shadow-sm ${
        config ? `${config.border} ${config.bg}` : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {report.incident_title}
          </h3>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              config ? `${config.badge} ${config.badgeText}` : "bg-slate-100 text-slate-700"
            }`}
          >
            {config?.icon}
            {report.severity}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">{report.summary}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Evidence
          </h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {report.evidence.map((item, index) => (
              <li key={`ev-${index}`} className="rounded-md bg-white/70 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recommendations
          </h4>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {report.recommendations.map((item, index) => (
              <li key={`rec-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}

interface ReportCardsProps {
  reports: InvestigationReport[];
}

export function ReportCards({ reports }: ReportCardsProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No investigation reports were generated.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Investigation Reports</h2>
        <p className="text-sm text-slate-500">
          Detailed incident summaries and recommended response actions.
        </p>
      </div>

      {reports.map((report, index) => (
        <ReportCard key={`${report.incident_title}-${index}`} report={report} />
      ))}
    </div>
  );
}
