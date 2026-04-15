import { createAuthApi } from "./authApi.js";

export function createApi() {
    return {
        auth: createAuthApi(),
        // TODO: data api
    };
}
