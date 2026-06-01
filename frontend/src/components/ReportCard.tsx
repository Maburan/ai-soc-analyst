import type { InvestigationReport } from "../types/api";

interface ReportCardProps {
  report: InvestigationReport;
}

const severityStyles: Record<string, string> = {
  CRITICAL: "border-red-200 bg-red-50",
  HIGH: "border-orange-200 bg-orange-50",
  MEDIUM: "border-yellow-200 bg-yellow-50",
  LOW: "border-green-200 bg-green-50",
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <article
      className={`rounded-xl border p-6 shadow-sm ${
        severityStyles[report.severity] ?? "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{report.incident_title}</h3>
          <p className="mt-1 text-sm text-slate-600">Severity: {report.severity}</p>
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
              <li key={index} className="rounded-md bg-white/70 px-3 py-2">
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
              <li key={index}>{item}</li>
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
