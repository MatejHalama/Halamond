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
        params.set("page", page.toString());
        params.set("limit", limit.toString());

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

    async getListingAuth(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/auth`, {
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
            ...(title && { title: title }),
            ...(price && { price: price }),
            ...(categoryId && { categoryId: categoryId }),
            ...(description && { description: description }),
          }),
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async updateListing(id, payload) {
      const { title, price, categoryId, description } = payload;

      try {
        const response = await fetch(`${BASE}/api/listings/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...(title && { title: title }),
            ...(price && { price: price }),
            ...(categoryId && { categoryId: categoryId }),
            ...(description && { description: description }),
          }),
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async activateListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/activate`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async sellListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/sell`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async deleteListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/delete`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async commentListing(id, payload) {
      const { parentId, text } = payload;

      try {
        const response = await fetch(`${BASE}/api/listings/${id}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...((parentId === null || parentId) && { parentId: parentId }),
            ...(text && { text: text }),
          }),
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async getMyListings() {
      try {
        const response = await fetch(`${BASE}/api/listings/my`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async uploadPicture(listingId, file) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(
          `${BASE}/api/listings/${listingId}/pictures`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async deletePicture(listingId, picId) {
      try {
        const response = await fetch(
          `${BASE}/api/listings/${listingId}/pictures/${picId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async blockListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/block`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },

    async unblockListing(id) {
      try {
        const response = await fetch(`${BASE}/api/listings/${id}/unblock`, {
          method: "PATCH",
          credentials: "include",
        });
        return await response.json();
      } catch (error) {
        return {
          status: "ERROR",
          reason: "Chyba spojení se serverem",
        };
      }
    },
  };
}
