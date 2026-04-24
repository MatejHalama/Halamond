export async function fakeApi() {
    return {
        auth: {
            login: () => ({
                status: "SUCCESS",
                user: {
                    userId: 1,
                    username: "user 1",
                    role: "user",
                },
            }),
            logout: () => ({
                status: "SUCCESS",
            }),
            register: () => ({
                status: "SUCCESS",
                userId: 1,
            }),
            whoAmI: async () => ({
                status: "SUCCESS",
                user: {
                    UserID: 1,
                    Username: "user 1",
                    Role: "user",
                },
            }),
        },
        listings: {
            getListings: async () => ({
                status: "SUCCESS",
                listings: [],
            }),
            getMyListings: async () => ({
                status: "SUCCESS",
                listings: [],
            }),
            getListingAuth: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            createListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            updateListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            activateListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            sellListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "sold", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            deleteListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "deleted", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            uploadPicture: async () => ({
                status: "SUCCESS",
                picture: {
                    path: ""
                },
            }),
            deletePicture: async () => ({
                status: "SUCCESS",
            }),
            blockListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "blocked", Title: "chair", Price: 10, belongsTo: 1 },
            }),
            unblockListing: async () => ({
                status: "SUCCESS",
                listing: { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 },
            }),
        },
        tickets: {
            getTickets: async () => ({
                status: "SUCCESS",
                tickets: [],
            }),
            getTicket: async () => ({
                status: "SUCCESS",
                ticket: {}
            }),
            createTicket: async () => ({
                status: "SUCCESS",
                ticket: {}
            }),
            closeTicket: async () => ({
                status: "SUCCESS",
            }),
            sendMessage: async () => ({
                status: "SUCCESS",
                message: {},
            }),
        },
        categories: {
            getCategories: async () => ({
                status: "SUCCESS",
                categories: [],
            }),
            getAllSubCategories: async () => ({
                status: "SUCCESS",
                categories: [{ CategoryID: 1 }],
            }),
        },
        notifications: {
            getNotifications: async () => ({
                status: "SUCCESS",
                notifications: [],
            }),
            markRead: async () => ({
                status: "SUCCESS",
            }),
            markAllRead: async () => ({
                status: "SUCCESS",
            }),
        },
        users: {
            getUser: async () => ({
                status: "SUCCESS",
                user: {}
            }),
        },
        reports: {
            submitReport: async () => ({
                status: "SUCCESS",
                report: {},
            }),
            getReports: async () => ({
                status: "SUCCESS",
                reports: [],
            }),
            deleteReport: async () => ({
                status: "SUCCESS",
            }),
        },
    };
}

const error = {
    status: "ERROR",
    reason: "too complicated",
}

export async function fakeErrorApi() {
    return {
        auth: {
            login: () => ({
                ...error
            }),
            logout: () => ({
                ...error
            }),
            register: () => ({
                ...error
            }),
            whoAmI: async () => ({
                ...error
            }),
        },
        listings: {
            getListings: async () => ({
                ...error
            }),
            getMyListings: async () => ({
                ...error
            }),
            getListingAuth: async () => ({
                ...error
            }),
            createListing: async () => ({
                ...error
            }),
            updateListing: async () => ({
                ...error
            }),
            activateListing: async () => ({
                ...error
            }),
            sellListing: async () => ({
                ...error
            }),
            deleteListing: async () => ({
                ...error
            }),
            uploadPicture: async () => ({
                ...error
            }),
            deletePicture: async () => ({
                ...error
            }),
            blockListing: async () => ({
                ...error
            }),
            unblockListing: async () => ({
                ...error
            }),
        },
        tickets: {
            getTickets: async () => ({
                ...error
            }),
            getTicket: async () => ({
                ...error
            }),
            createTicket: async () => ({
                ...error
            }),
            closeTicket: async () => ({
                ...error
            }),
        },
        categories: {
            getCategories: async () => ({
                ...error
            }),
            getAllSubCategories: async () => ({
                ...error
            }),
        },
        notifications: {
            getNotifications: async () => ({
                ...error
            }),
            markRead: async () => ({
                ...error
            }),
            markAllRead: async () => ({
                ...error
            }),
        },
        users: {
            getUser: async () => ({
                ...error
            }),
        },
        reports: {
            submitReport: async () => ({
                ...error
            }),
            getReports: async () => ({
                ...error
            }),
            deleteReport: async () => ({
                ...error
            }),
        },
    };
}