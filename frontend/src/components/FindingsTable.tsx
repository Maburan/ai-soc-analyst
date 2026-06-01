import type { SecurityFinding } from "../types/api";

interface FindingsTableProps {
  findings: SecurityFinding[];
}

const severityStyles: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

export function FindingsTable({ findings }: FindingsTableProps) {
  if (findings.length === 0) {
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
            {findings.map((finding, index) => (
              <tr key={`${finding.finding_type}-${finding.affected_user}-${index}`}>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {finding.finding_type}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      severityStyles[finding.severity] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {finding.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">{finding.affected_user}</td>
                <td className="px-6 py-4 font-mono text-slate-700">{finding.source_ip}</td>
                <td className="px-6 py-4 text-slate-700">{finding.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
