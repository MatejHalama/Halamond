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

    async getCategoriesFlat() {
      try {
        const response = await fetch(`${BASE}/api/categories/flat`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getAllSubCategories(id) {
      try {
        const response = await fetch(
          `${BASE}/api/categories/allSubCategories/${id}`,
          {
            credentials: "include",
          },
        );
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async createCategory(name, parentId) {
      try {
        const response = await fetch(`${BASE}/api/categories`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, parentId: parentId ?? null }),
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async updateCategory(id, name, parentId) {
      try {
        const response = await fetch(`${BASE}/api/categories/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            parentId: parentId !== undefined ? parentId : undefined,
          }),
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async deleteCategory(id) {
      try {
        const response = await fetch(`${BASE}/api/categories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },
  };
}
