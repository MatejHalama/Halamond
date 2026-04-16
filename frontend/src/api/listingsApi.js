const BASE = "http://localhost:3000";

export function createListingsApi() {
  return {
    async getListings({
      q,
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = {}) {
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (categoryId) params.set("categoryId", categoryId);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        params.set("page", page);
        params.set("limit", limit);

        const response = await fetch(`${BASE}/api/listings?${params}`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async createListing(payload) {
      const { title, price, categoryId, description = "" } = payload;

      try {
        const response = await fetch(`${BASE}/api/listings/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            tittle: title,
            price: price,
            categoryId: categoryId,
            description: description,
          })
        });
        return await response.json();
      }
      catch (error) {
        return {
          status: "ERROR", reason: "Chyba spojení se serverem"
        }
      }
    },

    async activateListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/activate`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      }
      catch (error) {
        return {
          status: "ERROR", reason: "Chyba spojení se serverem"
        }
      }
    },
  };
}
