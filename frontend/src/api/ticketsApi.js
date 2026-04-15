const BASE = "http://localhost:3000";

export function createTicketsApi() {
  return {
    async getTickets() {
      try {
        const response = await fetch(`${BASE}/api/tickets`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async getTicket(id) {
      try {
        const response = await fetch(`${BASE}/api/tickets/${id}`, {
          credentials: "include",
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async createTicket(listingId, message) {
      try {
        const response = await fetch(`${BASE}/api/tickets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ listingId, message }),
        });
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async sendMessage(ticketId, message) {
      try {
        const response = await fetch(
          `${BASE}/api/tickets/${ticketId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ message }),
          },
        );
        return await response.json();
      } catch {
        return { status: "ERROR", reason: "Chyba spojení se serverem" };
      }
    },

    async closeTicket(id) {
      try {
        const response = await fetch(`${BASE}/api/tickets/${id}/close`, {
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
