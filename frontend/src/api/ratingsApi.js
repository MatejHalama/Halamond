const BASE = "http://localhost:3000";

export function createRatingsApi() {
  return {
    async submitRating(reviewedId, rating) {
      try {
        const res = await fetch(`${BASE}/api/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reviewedId, rating }),
        });
        const data = await res.json();
        if (!res.ok) return { status: "ERROR", reason: data.reason };
        return { status: "SUCCESS", rating: data.rating };
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },
  };
}
