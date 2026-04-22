const BASE = "http://localhost:3000";

export function createNotificationsApi() {
  return {
    async getNotifications() {
      try {
        const response = await fetch(`${BASE}/api/notifications`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async markRead(id) {
      try {
        const response = await fetch(`${BASE}/api/notifications/${id}/read`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async markAllRead() {
      try {
        const response = await fetch(`${BASE}/api/notifications/read-all`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },
  };
}
