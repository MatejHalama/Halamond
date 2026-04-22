import { createAuthApi } from "./authApi.js";
import { createListingsApi } from "./listingsApi.js";
import { createTicketsApi } from "./ticketsApi.js";
import { createCategoriesApi } from "./categoriesApi.js";
import { createNotificationsApi } from "./notificationsApi.js";
import { createUsersApi } from "./usersApi.js";
import { createRatingsApi } from "./ratingsApi.js";

export function createApi() {
  return {
    auth: createAuthApi(),
    listings: createListingsApi(),
    tickets: createTicketsApi(),
    categories: createCategoriesApi(),
    notifications: createNotificationsApi(),
    users: createUsersApi(),
    ratings: createRatingsApi(),
  };
}
