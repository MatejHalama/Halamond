export function createAuthApi() {
    return {
        async login(email, password)
        {
            try {
                const response = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: email,
                        password: password
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

        async logout() {
            try {
                const response = await fetch("http://localhost:3000/api/auth/logout", {
                    method: "POST",
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

        async whoAmI()
        {
            try {
                const response = await fetch("http://localhost:3000/api/auth/whoami", {
                    method: "GET",
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
