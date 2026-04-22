const BASE = "http://localhost:3000";

export function createUsersApi() {
  return {
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
