const BASE = "http://localhost:3000";

export function createReportsApi() {
  return {
    async submitReport({ text, reportedListingId, reportedUserId }) {
      try {
        const res = await fetch(`${BASE}/api/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text, reportedListingId, reportedUserId }),
        });
        const data = await res.json();
        if (!res.ok) return { status: "ERROR", reason: data.reason };
        return { status: "SUCCESS", report: data.report };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getReports() {
      try {
        const res = await fetch(`${BASE}/api/reports`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { status: "ERROR", reason: data.reason };
        return { status: "SUCCESS", reports: data.reports };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async deleteReport(id) {
      try {
        const res = await fetch(`${BASE}/api/reports/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { status: "ERROR", reason: data.reason };
        return { status: "SUCCESS" };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },
  };
}
