const BASE = "http://localhost:3000";

export function createCategoriesApi() {
  return {
    async getCategories() {
      try {
        const response = await fetch(`${BASE}/api/categories`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getAllSubCategories(id) {
      try {
        const response = await fetch(`${BASE}/api/categories/allSubCategories/${id}`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },
  };
}
