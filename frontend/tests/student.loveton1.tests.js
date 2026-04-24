import { assert, total } from "./support/assert.js";
import { fakeApi, fakeErrorApi } from "./support/fake.js";
import { createStore } from "../src/infra/store/createStore.js";
import { sendMessage } from "../src/app/actions/sendMessage.js";
import { closeTicket } from "../src/app/actions/closeTicket.js";
import { contactSeller } from "../src/app/actions/contactSeller.js";
import { enterTicketDetail } from "../src/app/actions/enterTicketDetail.js";
import { enterTicketList } from "../src/app/actions/enterTicketList.js";
import { enterListingDetail } from "../src/app/actions/enterListingDetail.js";
import { enterListingList } from "../src/app/actions/enterListingList.js";
import { createCategory } from "../src/app/actions/createCategory.js";
import { updateCategory } from "../src/app/actions/updateCategory.js";
import { deleteCategory } from "../src/app/actions/deleteCategory.js";
import { dismissReport } from "../src/app/actions/dismissReport.js";
import {
    canSendMessage,
    canCloseTicket,
    canRateSeller,
    canCreateListing,
    canUpdateListing,
    canActivateListing,
    canSellListing,
    canDeleteListing,
    canEnterAdministration,
    canComment,
    canContactSeller,
    selectFilteredListings,
    selectListingDetailView,
    selectTicketDetailView,
    selectUnreadCount,
    selectUnreadNotificationCount,
} from "../src/infra/store/selectors.js";
import {
    listingDetailHandlers,
    ticketDetailHandlers,
    adminHandlers,
} from "../src/app/actionHandlers/createHandlers.js";

import * as ACTION_TYPE from "../src/constants/actionType.js";
import * as ROLE from "../src/constants/role.js";
import * as UI_MODE from "../src/constants/uiMode.js";
import * as UI_STATUS from "../src/statuses/uiStatus.js";
import * as VIEW_STATE_TYPE from "../src/constants/viewStateType.js";

const api = await fakeApi();
const errorApi = await fakeErrorApi();

function makeStore(overrides = {}) {
    return createStore({
        listings: [],
        myListings: [],
        categories: [],
        adminCategories: [],
        tickets: [],
        notifications: [],
        reports: [],
        blockedListings: [],
        blockedUsers: [],
        profileUser: null,
        auth: { role: ROLE.USER, userId: "1", name: "user 1" },
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.LISTING_LIST,
            selectedListing: null,
            selectedTicket: null,
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
            errorMessage: null,
            notification: null,
        },
        ...overrides,
    });
}

function makeListingState(authOverrides = {}, listingOverrides = {}) {
    return {
        auth: { role: ROLE.USER, userId: "1", ...authOverrides },
        ui: {
            selectedListing: {
                ListingID: 1,
                State: "draft",
                author: "1",
                ...listingOverrides,
            },
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
        },
        listings: [],
    };
}

function makeTicketState(ticketOverrides = {}, authOverrides = {}) {
    return {
        auth: { role: ROLE.USER, userId: "1", ...authOverrides },
        ui: {
            selectedTicket: {
                TicketID: 1,
                State: "open",
                buyer: "1",
                listing: { author: "2" },
                messages: [],
                ...ticketOverrides,
            },
        },
    };
}

// --------------------------------------------------
// Ticket – canSendMessage (IR05 + business entita)
// --------------------------------------------------

console.log("\n── canSendMessage ──");

{
    assert(
        canSendMessage(makeTicketState({ buyer: "1", listing: { author: "2" } }, { userId: "1" })) === true,
        "canSendMessage: kupující může poslat zprávu do otevřeného ticketu",
    );
    assert(
        canSendMessage(makeTicketState({ buyer: "2", listing: { author: "1" } }, { userId: "1" })) === true,
        "canSendMessage: prodejce může poslat zprávu do otevřeného ticketu",
    );
    assert(
        canSendMessage(makeTicketState({ State: "closed", buyer: "1" }, { userId: "1" })) === false,
        "canSendMessage: do uzavřeného ticketu nelze posílat zprávy",
    );
    assert(
        canSendMessage(makeTicketState({ buyer: "99", listing: { author: "88" } }, { userId: "1" })) === false,
        "canSendMessage: třetí strana nemůže posílat zprávy",
    );
    assert(
        canSendMessage({ auth: { userId: "1" }, ui: { selectedTicket: null } }) === false,
        "canSendMessage: bez vybraného ticketu vrátí false",
    );
}

// --------------------------------------------------
// Ticket – canCloseTicket (IR05 + business entita)
// --------------------------------------------------

console.log("\n── canCloseTicket ──");

{
    assert(
        canCloseTicket(makeTicketState({ buyer: "1", listing: { author: "2" } }, { userId: "1" })) === true,
        "canCloseTicket: kupující může uzavřít ticket",
    );
    assert(
        canCloseTicket(makeTicketState({ buyer: "2", listing: { author: "1" } }, { userId: "1" })) === true,
        "canCloseTicket: prodejce může uzavřít ticket",
    );
    assert(
        canCloseTicket(makeTicketState({ State: "closed", buyer: "1" }, { userId: "1" })) === false,
        "canCloseTicket: uzavřený ticket nelze znovu uzavřít",
    );
    assert(
        canCloseTicket(makeTicketState({ buyer: "99", listing: { author: "88" } }, { userId: "1" })) === false,
        "canCloseTicket: třetí strana nemůže uzavřít ticket",
    );
    assert(
        canCloseTicket({ auth: { userId: "1" }, ui: { selectedTicket: null } }) === false,
        "canCloseTicket: bez vybraného ticketu vrátí false",
    );
}

// --------------------------------------------------
// Ticket – canRateSeller (IR05 + business entita)
// --------------------------------------------------

console.log("\n── canRateSeller ──");

{
    assert(
        canRateSeller(makeTicketState({ buyer: "1" }, { userId: "1" })) === true,
        "canRateSeller: kupující může hodnotit prodejce",
    );
    assert(
        canRateSeller(makeTicketState({ buyer: "2" }, { userId: "1" })) === false,
        "canRateSeller: prodejce nemůže hodnotit sám sebe (není kupující)",
    );
    assert(
        canRateSeller({ auth: { userId: "1" }, ui: { selectedTicket: null } }) === false,
        "canRateSeller: bez vybraného ticketu vrátí false",
    );
}

// --------------------------------------------------
// selectTicketDetailView (IR05 + business entita)
// --------------------------------------------------

console.log("\n── selectTicketDetailView ──");

{
    const state = {
        auth: { role: ROLE.USER, userId: "1" },
        ui: {
            selectedTicket: { TicketID: 5, State: "open", buyer: "1", listing: { author: "2" }, messages: [] },
        },
    };
    const view = selectTicketDetailView(state);

    assert(view.ticket?.TicketID === 5, "selectTicketDetailView: ticket je součástí viewState");
    assert(view.capabilities.canSendMessage === true, "selectTicketDetailView: kupující má canSendMessage");
    assert(view.capabilities.canCloseTicket === true, "selectTicketDetailView: kupující má canCloseTicket");
    assert(view.capabilities.canRateSeller === true, "selectTicketDetailView: kupující má canRateSeller");
}

{
    const closedState = {
        auth: { role: ROLE.USER, userId: "1" },
        ui: {
            selectedTicket: { TicketID: 5, State: "closed", buyer: "1", listing: { author: "2" }, messages: [] },
        },
    };
    const view = selectTicketDetailView(closedState);
    assert(view.capabilities.canSendMessage === false, "selectTicketDetailView: uzavřený ticket – canSendMessage false");
    assert(view.capabilities.canCloseTicket === false, "selectTicketDetailView: uzavřený ticket – canCloseTicket false");
}

// --------------------------------------------------
// selectUnreadCount (IR05)
// --------------------------------------------------

console.log("\n── selectUnreadCount ──");

{
    const noTickets = { auth: { userId: "1" }, tickets: [] };
    assert(selectUnreadCount(noTickets) === 0, "selectUnreadCount: bez ticketů vrátí 0");

    const withUnread = {
        auth: { userId: "1" },
        tickets: [
            { TicketID: 1, State: "open", messages: [{ sender: "2" }] },
        ],
    };
    assert(selectUnreadCount(withUnread) === 1, "selectUnreadCount: zpráva od jiného uživatele se počítá jako nepřečtená");

    const selfMessage = {
        auth: { userId: "1" },
        tickets: [
            { TicketID: 1, State: "open", messages: [{ sender: "1" }] },
        ],
    };
    assert(selectUnreadCount(selfMessage) === 0, "selectUnreadCount: vlastní zpráva se nepočítá jako nepřečtená");

    const closedWithUnread = {
        auth: { userId: "1" },
        tickets: [
            { TicketID: 1, State: "closed", messages: [{ sender: "2" }] },
        ],
    };
    assert(selectUnreadCount(closedWithUnread) === 0, "selectUnreadCount: uzavřený ticket se nepočítá");

    const noMessage = {
        auth: { userId: "1" },
        tickets: [
            { TicketID: 1, State: "open", messages: [] },
        ],
    };
    assert(selectUnreadCount(noMessage) === 0, "selectUnreadCount: ticket bez zpráv se nepočítá");
}

// --------------------------------------------------
// selectUnreadNotificationCount (IR05)
// --------------------------------------------------

console.log("\n── selectUnreadNotificationCount ──");

{
    assert(
        selectUnreadNotificationCount({ notifications: [] }) === 0,
        "selectUnreadNotificationCount: bez notifikací vrátí 0",
    );
    assert(
        selectUnreadNotificationCount({ notifications: [{ Read: false }, { Read: false }, { Read: true }] }) === 2,
        "selectUnreadNotificationCount: počítá pouze nepřečtené notifikace",
    );
    assert(
        selectUnreadNotificationCount({ notifications: [{ Read: true }] }) === 0,
        "selectUnreadNotificationCount: všechny přečtené → 0",
    );
}

// --------------------------------------------------
// sendMessage (IR03 + Ticket entita)
// --------------------------------------------------

console.log("\n── sendMessage ──");

{
    const store = makeStore({
        tickets: [{ TicketID: 1, State: "open", messages: [] }],
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.TICKET_DETAIL,
            selectedTicket: { TicketID: 1, State: "open", messages: [] },
            selectedListing: null,
            filters: {},
            errorMessage: null,
            notification: null,
        },
    });

    await sendMessage({ store, api, payload: { ticketId: 1, message: "ahoj" } });

    const state = store.getState();
    assert(
        state.ui.selectedTicket.messages.length === 1,
        "sendMessage SUCCESS: zpráva přidána do selectedTicket.messages",
    );
    assert(
        state.ui.notification === null,
        "sendMessage SUCCESS: žádná chybová notifikace",
    );
}

{
    const store = makeStore({
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.TICKET_DETAIL,
            selectedTicket: { TicketID: 1, State: "open", messages: [] },
            selectedListing: null,
            filters: {},
            errorMessage: null,
            notification: null,
        },
    });

    await sendMessage({ store, api: errorApi, payload: { ticketId: 1, message: "ahoj" } });

    const state = store.getState();
    assert(
        state.ui.notification !== null,
        "sendMessage ERROR: notifikace je nastavena",
    );
    assert(
        state.ui.notification.type === "ERROR",
        "sendMessage ERROR: notifikace je typu ERROR",
    );
    assert(
        state.ui.selectedTicket.messages.length === 0,
        "sendMessage ERROR: zprávy se nezmění",
    );
}

// --------------------------------------------------
// closeTicket (IR03 + Ticket entita)
// --------------------------------------------------

console.log("\n── closeTicket ──");

{
    const store = makeStore({
        tickets: [{ TicketID: 1, State: "open", messages: [] }],
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.TICKET_DETAIL,
            selectedTicket: { TicketID: 1, State: "open", messages: [] },
            selectedListing: null,
            filters: {},
            errorMessage: null,
            notification: null,
        },
    });

    await closeTicket({ store, api, payload: { ticketId: 1 } });

    const state = store.getState();
    assert(
        state.ui.selectedTicket.State === "closed",
        "closeTicket SUCCESS: selectedTicket.State je closed",
    );
    assert(
        state.tickets[0].State === "closed",
        "closeTicket SUCCESS: ticket v seznamu je také uzavřen",
    );
    assert(
        state.ui.notification === null,
        "closeTicket SUCCESS: žádná chybová notifikace",
    );
}

{
    const store = makeStore({
        tickets: [{ TicketID: 1, State: "open", messages: [] }],
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.TICKET_DETAIL,
            selectedTicket: { TicketID: 1, State: "open", messages: [] },
            selectedListing: null,
            filters: {},
            errorMessage: null,
            notification: null,
        },
    });

    await closeTicket({ store, api: errorApi, payload: { ticketId: 1 } });

    const state = store.getState();
    assert(
        state.ui.selectedTicket.State === "open",
        "closeTicket ERROR: stav ticketu se nezmění",
    );
    assert(
        state.ui.notification !== null,
        "closeTicket ERROR: notifikace je nastavena",
    );
    assert(
        state.ui.notification.type === "ERROR",
        "closeTicket ERROR: notifikace je typu ERROR",
    );
}

// --------------------------------------------------
// Listing selektory – capabilities (IR05)
// --------------------------------------------------

console.log("\n── canCreateListing ──");

{
    assert(
        canCreateListing({ auth: { role: ROLE.USER } }) === true,
        "canCreateListing: USER může vytvořit inzerát",
    );
    assert(
        canCreateListing({ auth: { role: ROLE.ADMIN } }) === true,
        "canCreateListing: ADMIN může vytvořit inzerát",
    );
    assert(
        canCreateListing({ auth: { role: ROLE.ANON } }) === false,
        "canCreateListing: ANON nemůže vytvořit inzerát",
    );
}

console.log("\n── canActivateListing ──");

{
    assert(
        canActivateListing(makeListingState({}, { State: "draft", author: "1" })) === true,
        "canActivateListing: vlastník může aktivovat draft",
    );
    assert(
        canActivateListing(makeListingState({}, { State: "sold", author: "1" })) === true,
        "canActivateListing: vlastník může aktivovat sold",
    );
    assert(
        canActivateListing(makeListingState({}, { State: "active", author: "1" })) === false,
        "canActivateListing: nelze aktivovat již aktivní inzerát",
    );
    assert(
        canActivateListing(makeListingState({}, { State: "draft", author: "99" })) === false,
        "canActivateListing: nevlastník nemůže aktivovat",
    );
    assert(
        canActivateListing(makeListingState({ role: ROLE.ANON, userId: null }, { State: "draft" })) === false,
        "canActivateListing: ANON nemůže aktivovat",
    );
}

console.log("\n── canSellListing ──");

{
    assert(
        canSellListing(makeListingState({}, { State: "active", author: "1" })) === true,
        "canSellListing: vlastník může označit aktivní inzerát jako prodaný",
    );
    assert(
        canSellListing(makeListingState({}, { State: "draft", author: "1" })) === false,
        "canSellListing: nelze prodat draft",
    );
    assert(
        canSellListing(makeListingState({}, { State: "active", author: "99" })) === false,
        "canSellListing: nevlastník nemůže prodat",
    );
}

console.log("\n── canDeleteListing ──");

{
    assert(
        canDeleteListing(makeListingState({}, { State: "active", author: "1" })) === true,
        "canDeleteListing: vlastník může smazat aktivní inzerát",
    );
    assert(
        canDeleteListing(makeListingState({}, { State: "sold", author: "1" })) === true,
        "canDeleteListing: vlastník může smazat prodaný inzerát",
    );
    assert(
        canDeleteListing(makeListingState({}, { State: "draft", author: "1" })) === false,
        "canDeleteListing: nelze smazat draft",
    );
    assert(
        canDeleteListing(makeListingState({}, { State: "active", author: "99" })) === false,
        "canDeleteListing: nevlastník nemůže smazat",
    );
}

console.log("\n── canComment ──");

{
    assert(
        canComment(makeListingState({}, { State: "active" })) === true,
        "canComment: přihlášený uživatel může komentovat aktivní inzerát",
    );
    assert(
        canComment(makeListingState({}, { State: "draft" })) === false,
        "canComment: nelze komentovat draft",
    );
    assert(
        canComment(makeListingState({ role: ROLE.ANON, userId: null }, { State: "active" })) === false,
        "canComment: ANON nemůže komentovat",
    );
}

console.log("\n── canContactSeller ──");

{
    assert(
        canContactSeller(makeListingState({ userId: "2" }, { State: "active", author: "1" })) === true,
        "canContactSeller: přihlášený uživatel může kontaktovat prodejce",
    );
    assert(
        canContactSeller(makeListingState({ userId: "1" }, { State: "active", author: "1" })) === false,
        "canContactSeller: vlastník nemůže kontaktovat sám sebe",
    );
    assert(
        canContactSeller(makeListingState({ role: ROLE.ANON, userId: null }, { State: "active", author: "1" })) === false,
        "canContactSeller: ANON nemůže kontaktovat prodejce",
    );
}

console.log("\n── canBlockListing / canUnblockListing ──");

{
    const adminListingState = (listingState) => ({
        auth: { role: ROLE.ADMIN, userId: "admin" },
        ui: {
            selectedListing: { ListingID: 1, State: listingState, author: "1", user: null },
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
        },
    });

    const activeView = selectListingDetailView(adminListingState("active"));
    assert(activeView.capabilities.canBlockListing === true, "canBlockListing: admin může blokovat aktivní inzerát");
    assert(activeView.capabilities.canUnblockListing === false, "canUnblockListing: admin nemůže odblokovat aktivní inzerát");

    const blockedView = selectListingDetailView(adminListingState("blocked"));
    assert(blockedView.capabilities.canBlockListing === false, "canBlockListing: nelze blokovat již zablokovaný inzerát");
    assert(blockedView.capabilities.canUnblockListing === true, "canUnblockListing: admin může odblokovat zablokovaný inzerát");

    const userState = {
        auth: { role: ROLE.USER, userId: "1" },
        ui: {
            selectedListing: { ListingID: 1, State: "active", author: "99", user: null },
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
        },
    };
    const userView = selectListingDetailView(userState);
    assert(userView.capabilities.canBlockListing === false, "canBlockListing: běžný uživatel nemůže blokovat");
}

// --------------------------------------------------
// selectFilteredListings (IR05)
// --------------------------------------------------

console.log("\n── selectFilteredListings ──");

function makeFilterState(listings, filters) {
    return {
        listings,
        ui: {
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [], ...filters },
        },
    };
}

{
    const listings = [
        { ListingID: 1, Title: "Notebook", Description: "rychlý", Price: 1000, belongsTo: 1 },
        { ListingID: 2, Title: "Telefon", Description: "starý", Price: 500, belongsTo: 2 },
        { ListingID: 3, Title: "Tiskárna", Description: "levná tiskárna", Price: 200, belongsTo: 3 },
    ];

    const all = selectFilteredListings(makeFilterState(listings, {}));
    assert(all.length === 3, "selectFilteredListings: bez filtrů vrátí všechny inzeráty");

    const byTitle = selectFilteredListings(makeFilterState(listings, { q: "notebook" }));
    assert(byTitle.length === 1 && byTitle[0].ListingID === 1, "selectFilteredListings: filtr q hledá v Title");

    const byDesc = selectFilteredListings(makeFilterState(listings, { q: "levná" }));
    assert(byDesc.length === 1 && byDesc[0].ListingID === 3, "selectFilteredListings: filtr q hledá v Description");

    const byMin = selectFilteredListings(makeFilterState(listings, { minPrice: 600 }));
    assert(byMin.length === 1 && byMin[0].ListingID === 1, "selectFilteredListings: minPrice filtruje");

    const byMax = selectFilteredListings(makeFilterState(listings, { maxPrice: 400 }));
    assert(byMax.length === 1 && byMax[0].ListingID === 3, "selectFilteredListings: maxPrice filtruje");

    const byCategory = selectFilteredListings(makeFilterState(listings, {
        categoryId: 2,
        allSubCategories: [{ CategoryID: 2 }],
    }));
    assert(byCategory.length === 1 && byCategory[0].ListingID === 2, "selectFilteredListings: categoryId filtruje");

    const combined = selectFilteredListings(makeFilterState(listings, { q: "telefon", minPrice: 300, maxPrice: 600 }));
    assert(combined.length === 1 && combined[0].ListingID === 2, "selectFilteredListings: kombinace filtrů funguje");
}

// --------------------------------------------------
// Handlery – IR07
// --------------------------------------------------

console.log("\n── listingDetailHandlers ──");

{
    const mockDispatch = async (action) => action;

    const withComment = listingDetailHandlers(mockDispatch, {
        listing: { ListingID: 1 },
        capabilities: {
            canComment: true, canContactSeller: false, canBackToList: false,
            canActivateListing: false, canSellListing: false, canDeleteListing: false,
            canEnterAdministration: false, canViewSellerProfile: false,
            canReportListing: false, canBlockListing: false, canUnblockListing: false,
        },
    });
    assert(
        typeof withComment.onSubmitComment === "function",
        "listingDetailHandlers: onSubmitComment je definován když canComment=true",
    );

    const withoutComment = listingDetailHandlers(mockDispatch, {
        listing: { ListingID: 1 },
        capabilities: {
            canComment: false, canContactSeller: false, canBackToList: false,
            canActivateListing: false, canSellListing: false, canDeleteListing: false,
            canEnterAdministration: false, canViewSellerProfile: false,
            canReportListing: false, canBlockListing: false, canUnblockListing: false,
        },
    });
    assert(
        withoutComment.onSubmitComment === undefined,
        "listingDetailHandlers: onSubmitComment není definován když canComment=false",
    );

    const withContact = listingDetailHandlers(mockDispatch, {
        listing: { ListingID: 1 },
        capabilities: {
            canComment: false, canContactSeller: true, canBackToList: false,
            canActivateListing: false, canSellListing: false, canDeleteListing: false,
            canEnterAdministration: false, canViewSellerProfile: false,
            canReportListing: false, canBlockListing: false, canUnblockListing: false,
        },
    });
    assert(
        typeof withContact.onContactSeller === "function",
        "listingDetailHandlers: onContactSeller je definován když canContactSeller=true",
    );

    const withBlock = listingDetailHandlers(mockDispatch, {
        listing: { ListingID: 1 },
        capabilities: {
            canComment: false, canContactSeller: false, canBackToList: false,
            canActivateListing: false, canSellListing: false, canDeleteListing: false,
            canEnterAdministration: false, canViewSellerProfile: false,
            canReportListing: false, canBlockListing: true, canUnblockListing: false,
        },
    });
    assert(
        typeof withBlock.onBlockListing === "function",
        "listingDetailHandlers: onBlockListing je definován když canBlockListing=true",
    );
}

console.log("\n── listingDetailHandlers – payload dispatch ──");

{
    const dispatchCalls = [];
    const dispatch = (action) => dispatchCalls.push(action);
    const handlers = listingDetailHandlers(dispatch, {
        listing: { ListingID: 7 },
        capabilities: {
            canComment: true, canContactSeller: true, canBackToList: false,
            canActivateListing: false, canSellListing: false, canDeleteListing: false,
            canEnterAdministration: false, canViewSellerProfile: false,
            canReportListing: false, canBlockListing: true, canUnblockListing: false,
        },
    });

    handlers.onSubmitComment(null, "test komentář");
    assert(dispatchCalls.length === 1, "onSubmitComment: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.SUBMIT_COMMENT, "onSubmitComment: type je SUBMIT_COMMENT");
    assert(dispatchCalls[0].payload.text === "test komentář", "onSubmitComment: payload.text je správný");
    assert(dispatchCalls[0].payload.parentId === null, "onSubmitComment: payload.parentId je správný");

    dispatchCalls.length = 0;
    handlers.onContactSeller(7, "mám zájem");
    assert(dispatchCalls.length === 1, "onContactSeller: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.CONTACT_SELLER, "onContactSeller: type je CONTACT_SELLER");
    assert(dispatchCalls[0].payload.listingId === 7, "onContactSeller: payload.listingId je správný");
    assert(dispatchCalls[0].payload.message === "mám zájem", "onContactSeller: payload.message je správný");

    dispatchCalls.length = 0;
    handlers.onBlockListing();
    assert(dispatchCalls.length === 1, "onBlockListing: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.BLOCK_LISTING, "onBlockListing: type je BLOCK_LISTING");
    assert(dispatchCalls[0].payload.listingId === 7, "onBlockListing: payload.listingId je správný");
}

console.log("\n── ticketDetailHandlers ──");

{
    const mockDispatch = async (action) => action;

    const withAll = ticketDetailHandlers(mockDispatch, {
        capabilities: { canSendMessage: true, canCloseTicket: true, canRateSeller: true },
    });
    assert(typeof withAll.onSendMessage === "function", "ticketDetailHandlers: onSendMessage je definován když canSendMessage=true");
    assert(typeof withAll.onCloseTicket === "function", "ticketDetailHandlers: onCloseTicket je definován když canCloseTicket=true");
    assert(typeof withAll.onRateSeller === "function", "ticketDetailHandlers: onRateSeller je definován když canRateSeller=true");

    const withNone = ticketDetailHandlers(mockDispatch, {
        capabilities: { canSendMessage: false, canCloseTicket: false, canRateSeller: false },
    });
    assert(withNone.onSendMessage === undefined, "ticketDetailHandlers: onSendMessage není definován když canSendMessage=false");
    assert(withNone.onCloseTicket === undefined, "ticketDetailHandlers: onCloseTicket není definován když canCloseTicket=false");
    assert(withNone.onRateSeller === undefined, "ticketDetailHandlers: onRateSeller není definován když canRateSeller=false");
    assert(typeof withNone.onBackToTickets === "function", "ticketDetailHandlers: onBackToTickets je vždy definován");
}

console.log("\n── ticketDetailHandlers – payload dispatch ──");

{
    const dispatchCalls = [];
    const dispatch = (action) => dispatchCalls.push(action);
    const handlers = ticketDetailHandlers(dispatch, {
        capabilities: { canSendMessage: true, canCloseTicket: true, canRateSeller: true },
    });

    handlers.onSendMessage(42, "ahoj");
    assert(dispatchCalls.length === 1, "onSendMessage: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.SEND_MESSAGE, "onSendMessage: type je SEND_MESSAGE");
    assert(dispatchCalls[0].payload.ticketId === 42, "onSendMessage: payload.ticketId je správný");
    assert(dispatchCalls[0].payload.message === "ahoj", "onSendMessage: payload.message je správný");

    dispatchCalls.length = 0;
    handlers.onCloseTicket(42);
    assert(dispatchCalls.length === 1, "onCloseTicket: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.CLOSE_TICKET, "onCloseTicket: type je CLOSE_TICKET");
    assert(dispatchCalls[0].payload.ticketId === 42, "onCloseTicket: payload.ticketId je správný");

    dispatchCalls.length = 0;
    handlers.onRateSeller(99, 5);
    assert(dispatchCalls.length === 1, "onRateSeller: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.SUBMIT_RATING, "onRateSeller: type je SUBMIT_RATING");
    assert(dispatchCalls[0].payload.reviewedId === 99, "onRateSeller: payload.reviewedId je správný");
    assert(dispatchCalls[0].payload.rating === 5, "onRateSeller: payload.rating je správný");

    dispatchCalls.length = 0;
    handlers.onBackToTickets();
    assert(dispatchCalls.length === 1, "onBackToTickets: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.ENTER_TICKET_LIST, "onBackToTickets: type je ENTER_TICKET_LIST");
}

// --------------------------------------------------
// createCategory (IR03)
// --------------------------------------------------

console.log("\n── createCategory ──");

{
    const store = makeStore({ adminCategories: [] });
    await createCategory({ store, api, payload: { name: "New Category", parentId: null } });
    const state = store.getState();
    assert(state.adminCategories.length === 1, "createCategory SUCCESS: kategorie přidána do adminCategories");
    assert(state.adminCategories[0].CategoryID === 10, "createCategory SUCCESS: přidaná kategorie má správné ID");
    assert(state.adminCategories[0].Name === "New Category", "createCategory SUCCESS: přidaná kategorie má správný název");
}

{
    const store = makeStore({ adminCategories: [{ CategoryID: 5, Name: "Existing" }] });
    await createCategory({ store, api: errorApi, payload: { name: "New", parentId: null } });
    assert(store.getState().adminCategories.length === 1, "createCategory ERROR: adminCategories se nezmění");
}

// --------------------------------------------------
// updateCategory (IR03)
// --------------------------------------------------

console.log("\n── updateCategory ──");

{
    const store = makeStore({ adminCategories: [{ CategoryID: 1, Name: "Old Name", parentCategory: 5 }] });
    await updateCategory({ store, api, payload: { categoryId: 1, name: "Updated Name", parentId: null } });
    const cat = store.getState().adminCategories.find((c) => c.CategoryID === 1);
    assert(cat?.Name === "Updated Name", "updateCategory SUCCESS: název kategorie je aktualizován");
    assert(cat?.parentCategory === null, "updateCategory SUCCESS: parentCategory je aktualizován");
}

{
    const store = makeStore({ adminCategories: [{ CategoryID: 1, Name: "Old Name", parentCategory: 5 }] });
    await updateCategory({ store, api: errorApi, payload: { categoryId: 1, name: "Updated Name", parentId: null } });
    assert(store.getState().adminCategories[0].Name === "Old Name", "updateCategory ERROR: název kategorie se nezmění");
}

// --------------------------------------------------
// deleteCategory (IR03)
// --------------------------------------------------

console.log("\n── deleteCategory ──");

{
    const store = makeStore({
        adminCategories: [{ CategoryID: 1, Name: "Electronics" }, { CategoryID: 2, Name: "Phones" }],
    });
    await deleteCategory({ store, api, payload: { categoryId: 1 } });
    const state = store.getState();
    assert(state.adminCategories.length === 1, "deleteCategory SUCCESS: kategorie odstraněna z adminCategories");
    assert(state.adminCategories[0].CategoryID === 2, "deleteCategory SUCCESS: zbývá jen druhá kategorie");
}

{
    const store = makeStore({ adminCategories: [{ CategoryID: 1, Name: "Electronics" }] });
    await deleteCategory({ store, api: errorApi, payload: { categoryId: 1 } });
    assert(store.getState().adminCategories.length === 1, "deleteCategory ERROR: adminCategories se nezmění");
}

// --------------------------------------------------
// dismissReport (IR03)
// --------------------------------------------------

console.log("\n── dismissReport ──");

{
    const store = makeStore({ reports: [{ ReportID: 1, text: "spam" }, { ReportID: 2, text: "fake" }] });
    await dismissReport({ store, api, payload: { reportId: 1 } });
    const state = store.getState();
    assert(state.reports.length === 1, "dismissReport SUCCESS: hlášení odstraněno z reports");
    assert(state.reports[0].ReportID === 2, "dismissReport SUCCESS: zbývá jen druhé hlášení");
}

{
    const store = makeStore({ reports: [{ ReportID: 1, text: "spam" }] });
    await dismissReport({ store, api: errorApi, payload: { reportId: 1 } });
    assert(store.getState().reports.length === 1, "dismissReport ERROR: reports se nezmění");
}

// --------------------------------------------------
// adminHandlers – payload dispatch (IR07)
// --------------------------------------------------

console.log("\n── adminHandlers – payload dispatch ──");

{
    const dispatchCalls = [];
    const dispatch = (action) => dispatchCalls.push(action);
    const handlers = adminHandlers(dispatch);

    handlers.onCreateCategory("Technika", null);
    assert(dispatchCalls.length === 1, "adminHandlers onCreateCategory: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.CREATE_CATEGORY, "adminHandlers onCreateCategory: type je CREATE_CATEGORY");
    assert(dispatchCalls[0].payload.name === "Technika", "adminHandlers onCreateCategory: payload.name je správný");
    assert(dispatchCalls[0].payload.parentId === null, "adminHandlers onCreateCategory: payload.parentId je správný");

    dispatchCalls.length = 0;
    handlers.onUpdateCategory(1, "Nový Název", 5);
    assert(dispatchCalls.length === 1, "adminHandlers onUpdateCategory: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.UPDATE_CATEGORY, "adminHandlers onUpdateCategory: type je UPDATE_CATEGORY");
    assert(dispatchCalls[0].payload.categoryId === 1, "adminHandlers onUpdateCategory: payload.categoryId je správný");
    assert(dispatchCalls[0].payload.name === "Nový Název", "adminHandlers onUpdateCategory: payload.name je správný");
    assert(dispatchCalls[0].payload.parentId === 5, "adminHandlers onUpdateCategory: payload.parentId je správný");

    dispatchCalls.length = 0;
    handlers.onDeleteCategory(3);
    assert(dispatchCalls.length === 1, "adminHandlers onDeleteCategory: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.DELETE_CATEGORY, "adminHandlers onDeleteCategory: type je DELETE_CATEGORY");
    assert(dispatchCalls[0].payload.categoryId === 3, "adminHandlers onDeleteCategory: payload.categoryId je správný");

    dispatchCalls.length = 0;
    handlers.onDismissReport(7);
    assert(dispatchCalls.length === 1, "adminHandlers onDismissReport: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.DISMISS_REPORT, "adminHandlers onDismissReport: type je DISMISS_REPORT");
    assert(dispatchCalls[0].payload.reportId === 7, "adminHandlers onDismissReport: payload.reportId je správný");
}

// --------------------------------------------------
// enterTicketDetail (IR03 + Ticket entita)
// --------------------------------------------------

console.log("\n── enterTicketDetail ──");

{
    const store = makeStore({
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.LISTING_LIST,
            selectedListing: null,
            selectedTicket: null,
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
            errorMessage: null,
            notification: null,
        },
    });

    await enterTicketDetail({ store, api, payload: { ticketId: 1 } });

    const state = store.getState();
    assert(state.ui.mode === UI_MODE.TICKET_DETAIL, "enterTicketDetail SUCCESS: ui.mode je TICKET_DETAIL");
    assert(state.ui.status === UI_STATUS.RDY, "enterTicketDetail SUCCESS: ui.status je RDY");
    assert(state.ui.selectedTicket !== null, "enterTicketDetail SUCCESS: selectedTicket je nastaven");
}

{
    const store = makeStore();
    await enterTicketDetail({ store, api: errorApi, payload: { ticketId: 1 } });
    const state = store.getState();
    assert(state.ui.notification !== null, "enterTicketDetail ERROR: notifikace je nastavena");
    assert(state.ui.notification.type === "ERROR", "enterTicketDetail ERROR: notifikace je typu ERROR");
}

// --------------------------------------------------
// enterTicketList (IR03 + Ticket entita)
// --------------------------------------------------

console.log("\n── enterTicketList ──");

{
    const store = makeStore({
        tickets: [{ TicketID: 99 }],
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.LISTING_LIST,
            selectedListing: null,
            selectedTicket: null,
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null, allSubCategories: [] },
            errorMessage: null,
            notification: null,
        },
    });

    await enterTicketList({ store, api, payload: {} });

    const state = store.getState();
    assert(state.ui.mode === UI_MODE.TICKET_LIST, "enterTicketList SUCCESS: ui.mode je TICKET_LIST");
    assert(state.ui.status === UI_STATUS.RDY, "enterTicketList SUCCESS: ui.status je RDY");
    assert(Array.isArray(state.tickets), "enterTicketList SUCCESS: tickets je pole");
}

{
    const store = makeStore({ tickets: [{ TicketID: 99 }] });
    await enterTicketList({ store, api: errorApi, payload: {} });
    const state = store.getState();
    assert(state.ui.mode === UI_MODE.TICKET_LIST, "enterTicketList ERROR: naviguje na TICKET_LIST i při chybě");
    assert(state.tickets.length === 1, "enterTicketList ERROR: tickets se nezmění při chybě API");
}

// --------------------------------------------------
// contactSeller (IR03 + Ticket entita)
// --------------------------------------------------

console.log("\n── contactSeller ──");

{
    const dispatchCalls = [];
    const mockDispatch = async (action) => dispatchCalls.push(action);
    const store = makeStore();

    await contactSeller({ store, api, dispatch: mockDispatch, payload: { listingId: 1, message: "mám zájem" } });

    assert(dispatchCalls.length === 1, "contactSeller SUCCESS: dispatch byl zavolán");
    assert(dispatchCalls[0].type === ACTION_TYPE.ENTER_TICKET_DETAIL, "contactSeller SUCCESS: type je ENTER_TICKET_DETAIL");
    assert(dispatchCalls[0].payload.ticketId !== undefined, "contactSeller SUCCESS: payload obsahuje ticketId");
}

{
    const dispatchCalls = [];
    const mockDispatch = async (action) => dispatchCalls.push(action);
    const store = makeStore();

    await contactSeller({ store, api: errorApi, dispatch: mockDispatch, payload: { listingId: 1, message: "mám zájem" } });

    const state = store.getState();
    assert(dispatchCalls.length === 0, "contactSeller ERROR: dispatch nebyl zavolán");
    assert(state.ui.notification !== null, "contactSeller ERROR: notifikace je nastavena");
    assert(state.ui.notification.type === "ERROR", "contactSeller ERROR: notifikace je typu ERROR");
}

// --------------------------------------------------
// enterListingDetail – chybový stav (IR03, Blok 7)
// --------------------------------------------------

console.log("\n── enterListingDetail – chybový stav ──");

{
    const store = makeStore();
    await enterListingDetail({ store, api: errorApi, payload: { listingId: 1 } });
    const state = store.getState();
    assert(
        state.ui.status === UI_STATUS.ERR,
        "enterListingDetail ERROR: ui.status je ERR",
    );
    assert(
        state.ui.errorMessage !== null,
        "enterListingDetail ERROR: ui.errorMessage je nastaven",
    );
}

// --------------------------------------------------
// enterListingList – chybový stav (IR03, Blok 7)
// --------------------------------------------------

console.log("\n── enterListingList – chybový stav ──");

{
    const store = makeStore();
    await enterListingList({ store, api: errorApi, payload: {} });
    const state = store.getState();
    assert(
        state.ui.status === UI_STATUS.ERR,
        "enterListingList ERROR: ui.status je ERR",
    );
    assert(
        state.ui.errorMessage !== null,
        "enterListingList ERROR: ui.errorMessage je nastaven",
    );
}

total();
