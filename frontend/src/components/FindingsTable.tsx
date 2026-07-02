import type { SecurityFinding } from "../types/api";

interface FindingsTableProps {
  findings: SecurityFinding[];
}

const severityConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  CRITICAL: {
    label: "Critical",
    bg: "bg-red-100",
    text: "text-red-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1L1 14h14L8 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  HIGH: {
    label: "High",
    bg: "bg-orange-100",
    text: "text-orange-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  MEDIUM: {
    label: "Medium",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  LOW: {
    label: "Low",
    bg: "bg-green-100",
    text: "text-green-800",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.36 5.34a.75.75 0 00-1.06-1.06L7.2 8.38 5.28 6.46a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l3.83-3.83z" />
      </svg>
    ),
  },
};

export function FindingsTable({ findings }: FindingsTableProps) {
  if (!findings || findings.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No security findings were detected in the uploaded log file.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Security Findings</h2>
        <p className="text-sm text-slate-500">
          Detected suspicious activity from correlated log events.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-slate-600">Type</th>
              <th className="px-6 py-3 text-left font-medium text-slate-600">Severity</th>
              <th className="px-6 py-3 text-left font-medium text-slate-600">User</th>
              <th className="px-6 py-3 text-left font-medium text-slate-600">Source IP</th>
              <th className="px-6 py-3 text-left font-medium text-slate-600">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {findings.map((finding, index) => {
              const config = severityConfig[finding.severity];
              return (
                <tr
                  key={`${finding.finding_type}-${finding.affected_user}-${index}`}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {finding.finding_type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        config ? `${config.bg} ${config.text}` : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {config?.icon}
                      {config?.label ?? finding.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {finding.affected_user}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {finding.source_ip}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {finding.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
