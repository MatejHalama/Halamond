const BASE = "http://localhost:3000";

export function createUsersApi() {
  return {
    async blockUser(id) {
      try {
        const res = await fetch(`${BASE}/api/users/${id}/block`, {
          method: "PATCH",
          credentials: "include",
        });
        const data = await res.json();
        return res.ok
          ? { status: "SUCCESS", user: data.user }
          : { status: "ERROR", reason: data.reason };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async unblockUser(id) {
      try {
        const res = await fetch(`${BASE}/api/users/${id}/unblock`, {
          method: "PATCH",
          credentials: "include",
        });
        const data = await res.json();
        return res.ok
          ? { status: "SUCCESS", user: data.user }
          : { status: "ERROR", reason: data.reason };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getBlockedUsers() {
      try {
        const res = await fetch(`${BASE}/api/users?state=blocked`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { status: "ERROR", reason: data.reason };
        return { status: "SUCCESS", users: data.users };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getUser(id) {
      try {
        const res = await fetch(`${BASE}/api/users/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { status: "ERROR", reason: data.reason };
        return { status: "SUCCESS", user: data.user };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },
  };
}
