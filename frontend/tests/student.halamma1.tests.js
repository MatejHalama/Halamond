import { assert, total } from "./support/assert.js";
import { fakeApi, fakeErrorApi } from "./support/fake.js";
import { createDispatcher } from "../src/app/dispatch.js";
import { createStore } from "../src/infra/store/createStore.js";
import { parseUrl, stateToUrl, urlToAction } from "../src/infra/router/router.js";
import { createListing } from "../src/app/actions/createListing.js";
import { updateListing } from "../src/app/actions/updateListing.js";
import { deleteListing } from "../src/app/actions/deleteListing.js";
import { activateListing } from "../src/app/actions/activateListing.js";
import { sellListing } from "../src/app/actions/sellListing.js";
import { blockListing } from "../src/app/actions/blockListing.js";
import { uploadPicture } from "../src/app/actions/uploadPicture.js";
import { deletePicture } from "../src/app/actions/deletePicture.js";
import { setFilters } from "../src/app/actions/setFilters.js";
import { submitLogin } from "../src/app/actions/submitLogin.js";
import { submitRegister } from "../src/app/actions/submitRegister.js";
import { logout } from "../src/app/actions/logout.js";
import { enterAdmin } from "../src/app/actions/enterAdmin.js";
import { enterCreateListing } from "../src/app/actions/enterCreateListing.js";
import { enterListingAdministration } from "../src/app/actions/enterListingAdministration.js";
import { enterListingDetail } from "../src/app/actions/enterListingDetail.js";
import { enterListingList } from "../src/app/actions/enterListingList.js";
import { enterLogin } from "../src/app/actions/enterLogin.js";
import { enterRegister } from "../src/app/actions/enterRegister.js";
import { enterUserProfile } from "../src/app/actions/enterUserProfile.js";

import * as ACTION_TYPE from "../src/constants/actionType.js";
import * as ROLE from "../src/constants/role.js";
import * as UI_MODE from "../src/constants/uiMode.js";
import * as UI_STATUS from "../src/statuses/uiStatus.js";
import * as URLS from "../src/constants/urls.js";

const api = await fakeApi();
const errorApi = await fakeErrorApi();

function makeStore(overrides = {}) {
    return createStore({
        listings: [],
        myListings: [],
        categories: [],
        tickets: [],
        notifications: [],
        reports: [],
        profileUser: null,
        auth: { role: ROLE.USER, userId: "1", username: "user 1" },
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.LISTING_LIST,
            selectedListing: null,
            selectedTicket: null,
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
            errorMessage: null,
            notification: null,
        },
        ...overrides,
    });
}

// --------------------------------------------------
// Navigační akce – ověřujeme změnu ui.mode
// --------------------------------------------------

console.log("\n── Navigační akce ──");

async function navigationActionTest(action, expected, overrides = {}) {
    const store = makeStore(overrides);
    const dispatch = createDispatcher(store, api);

    await dispatch({
        type: action,
        payload: { listingId: 1 },
    });

    const state = store.getState();
    assert(
        state.ui.mode === expected,
        `${action}: ui.mode je ${expected}`,
    );
}

{
    await navigationActionTest(
        ACTION_TYPE.ENTER_ADMIN,
        UI_MODE.ADMIN
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_CREATE_LISTING,
        UI_MODE.CREATE_LISTING
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_LISTING_ADMINISTRATION,
        UI_MODE.LISTING_ADMINISTRATION
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_LISTING_DETAIL,
        UI_MODE.LISTING_DETAIL
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_LISTING_LIST,
        UI_MODE.LISTING_LIST
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_LOGIN,
        UI_MODE.PROFILE
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_LOGIN,
        UI_MODE.LOGIN,
        {
            auth: {
                role: ROLE.ANON,
                userId: null,
                Username: null,
            }
        }
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_REGISTER,
        UI_MODE.PROFILE
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_REGISTER,
        UI_MODE.REGISTER,
        {
            auth: {
                role: ROLE.ANON,
                userId: null,
                Username: null,
            }
        }
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_TICKET_DETAIL,
        UI_MODE.TICKET_DETAIL
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_TICKET_LIST,
        UI_MODE.TICKET_LIST
    );

    await navigationActionTest(
        ACTION_TYPE.ENTER_PROFILE,
        UI_MODE.PROFILE
    );
}

// --------------------------------------------------
// Systémové akce
// --------------------------------------------------

console.log("\n── Systémové akce ──");

{
    const store = makeStore();
    const dispatch = createDispatcher(store, api);
    const stateBefore = store.getState();

    await dispatch({
        type: ACTION_TYPE.SET_FILTERS,
        api,
        payload: {
            q: "word",
            categoryId: 1,
            minPrice: 0,
            maxPrice: 100,
        }
    });

    const state = store.getState();

    assert(state.ui.mode === stateBefore.ui.mode, "SET_FILTERS: stav se nezmění");
    assert(JSON.stringify(state.ui.filters) === JSON.stringify({
            q: "word",
            categoryId: 1,
            minPrice: 0,
            maxPrice: 100,
            allSubCategories: [{ CategoryID: 1 }],
        }), "SET_FILTERS: správná akce nastaví filter"
    );
}

// --------------------------------------------------
// Doménové akce – ověřujeme, že dispatcher předá záměr správné akci.
// Používáme API, které vrátí SUCCESS, a ověříme změnu stavu.
// --------------------------------------------------

console.log("\n── Doménové akce – listing ──");

async function listingActionTest(action, expected, uiMode = UI_MODE.LISTING_DETAIL, payload = { listingId: 1 }, overrides = {
    ui: {
        status: UI_STATUS.RDY,
        mode: uiMode,
        selectedListing: {},
        selectedTicket: null,
        filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
        errorMessage: null,
        notification: null,
    },
}) {
    const store = makeStore(overrides);
    const dispatch = createDispatcher(store, api);

    await dispatch({
        type: action,
        payload: payload,
    });

    const state = store.getState();
    assert(
        state.ui.mode === expected,
        `${action}: ui.mode je ${expected}`,
    );
}

{
    await listingActionTest(ACTION_TYPE.CREATE_LISTING, UI_MODE.LISTING_DETAIL, UI_MODE.CREATE_LISTING, { listingId: 1, title: "chair", price: 1 });
    await listingActionTest(ACTION_TYPE.UPDATE_LISTING, UI_MODE.LISTING_ADMINISTRATION, UI_MODE.LISTING_ADMINISTRATION, { listingId: 1, title: "chair", price: 1 });
    await listingActionTest(ACTION_TYPE.DELETE_LISTING, UI_MODE.LISTING_DETAIL);
    await listingActionTest(ACTION_TYPE.ACTIVATE_LISTING, UI_MODE.LISTING_DETAIL);
    await listingActionTest(ACTION_TYPE.SELL_LISTING, UI_MODE.LISTING_DETAIL);
    await listingActionTest(ACTION_TYPE.BLOCK_LISTING, UI_MODE.LISTING_DETAIL);
    await listingActionTest(ACTION_TYPE.UPLOAD_PICTURE, UI_MODE.LISTING_ADMINISTRATION, UI_MODE.LISTING_ADMINISTRATION);
    await listingActionTest(ACTION_TYPE.DELETE_PICTURE, UI_MODE.LISTING_ADMINISTRATION, UI_MODE.LISTING_ADMINISTRATION);
}

console.log("\n── Doménové akce – ticket ──");

async function ticketActionTest(action, expected, uiMode = UI_MODE.TICKET_DETAIL, payload = { ticketId: 1 }, overrides = {
    ui: {
        status: UI_STATUS.RDY,
        mode: uiMode,
        selectedListing: {},
        selectedTicket: null,
        filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
        errorMessage: null,
        notification: null,
    },
}) {
    const store = makeStore(overrides);
    const dispatch = createDispatcher(store, api);

    await dispatch({
        type: action,
        payload: payload,
    });

    const state = store.getState();
    assert(
        state.ui.mode === expected,
        `${action}: ui.mode je ${expected}`,
    );
}

{
    await ticketActionTest(ACTION_TYPE.CLOSE_TICKET, UI_MODE.TICKET_DETAIL);
    await ticketActionTest(ACTION_TYPE.CONTACT_SELLER, UI_MODE.TICKET_DETAIL, UI_MODE.LISTING_DETAIL);
    await ticketActionTest(ACTION_TYPE.SEND_MESSAGE, UI_MODE.TICKET_DETAIL);
}

// --------------------------------------------------
// Doménové akce – autentizace
// --------------------------------------------------

console.log("\n── Doménové akce – autentizace ──");

{
    const store = makeStore({auth: {
        role: ROLE.ANON,
        userId: null,
        Username: null,
    }});
    const dispatch = createDispatcher(store, api);

    await dispatch({
        type: ACTION_TYPE.SUBMIT_LOGIN,
        payload: { email: "email", password: "password" },
    });

    const state = store.getState();
    assert(state.auth.role === ROLE.USER, "SUBMIT_LOGIN: správná akce nastaví roli");
    assert(state.auth.userId === 1, "SUBMIT_LOGIN: správná akce nastaví userId");
}

{
    const store = makeStore({auth: {
            role: ROLE.ANON,
            userId: null,
            Username: null,
        }});
    const dispatch = createDispatcher(store, api);

    await dispatch({
        type: ACTION_TYPE.SUBMIT_REGISTER,
        payload: { email: "email", password: "password", username: "username" },
    });

    const state = store.getState();
    assert(
        state.ui.notification !== null,
        "SUBMIT_REGISTER: správná akce nastaví notification",
    );
    assert(
        state.ui.notification.type === "SUCCESS",
        "SUBMIT_REGISTER: notification je SUCCESS",
    );
}

{
    const store = makeStore();
    const dispatch = createDispatcher(store, api);

    await dispatch({
        type: ACTION_TYPE.LOGOUT,
    });

    const state = store.getState();
    assert(state.auth.userId === null, "LOGOUT: správná akce vymaže userId");
    assert(
        state.auth.role === ROLE.ANON,
        "LOGOUT: správná akce nastaví roli na ANONYMOUS",
    );
}

// --------------------------------------------------
// Neznámý typ akce – varování, stav se nezmění
// --------------------------------------------------

console.log("\n── Neznámý typ akce ──");

{
    const store = makeStore();
    const dispatch = createDispatcher(store, api);
    const stateBefore = store.getState();

    await dispatch({ type: "NEEXISTUJICI_AKCE" });

    const stateAfter = store.getState();
    assert(
        stateAfter.ui.mode === stateBefore.ui.mode,
        "Neznámý typ: stav se nezmění",
    );
}

// --------------------------------------------------
// parseUrl
// --------------------------------------------------

console.log("\n── parseUrl ──");

function parseUrlTest(url, expected) {
    const route = parseUrl(url);
    assert(
        route.context === expected,
        `parseUrl ${url}: context je ${expected}`,
    );

    if (route.listingId)
        assert(route.listingId === "1", `parseUrl ${url}: listingId je ${route.listingId}`);
    if (route.ticketId)
        assert(route.ticketId === 1, `parseUrl ${url}: ticketId je ${route.ticketId}`);
}

{
    parseUrlTest(URLS.LOGIN, UI_MODE.LOGIN);
    parseUrlTest(URLS.REGISTER, UI_MODE.REGISTER);
    parseUrlTest(URLS.PROFILE, UI_MODE.PROFILE);

    parseUrlTest(URLS.LISTING_LIST, UI_MODE.LISTING_LIST);
    parseUrlTest(URLS.LISTING_DETAIL + "/1", UI_MODE.LISTING_DETAIL);
    parseUrlTest(URLS.LISTING_ADMINISTRATION + "/1", UI_MODE.LISTING_ADMINISTRATION);
    parseUrlTest(`${URLS.LISTING_LIST}/${URLS.CREATE_LISTING}`, UI_MODE.CREATE_LISTING);

    parseUrlTest(URLS.TICKET_LIST, UI_MODE.TICKET_LIST);
    parseUrlTest(URLS.TICKET_DETAIL + "/1", UI_MODE.TICKET_DETAIL);

    parseUrlTest(URLS.ADMIN, UI_MODE.ADMIN);
}

// --------------------------------------------------
// urlToAction
// --------------------------------------------------

console.log("\n── urlToAction ──");

function urlToActionTest(url, expected) {
    const action = urlToAction(`http://localhost:5500/#/${url}`);
    assert(
        action.type === expected,
        `urlToAction #/${url}: type je ${expected}`,
    );

    if (action.payload?.listingId)
        assert(
            action.payload.listingId === "1",
            `urlToAction #/${url}: payload.listingId je ${action.payload.listingId}`,
        );
    if (action.payload?.ticketId)
        assert(
            action.payload.ticketId === 1,
            `urlToAction #/${url}: payload.ticketId je ${action.payload.ticketId}`,
        );
}

{
    urlToActionTest(URLS.LOGIN, ACTION_TYPE.ENTER_LOGIN);
    urlToActionTest(URLS.REGISTER, ACTION_TYPE.ENTER_REGISTER);
    urlToActionTest(URLS.PROFILE, ACTION_TYPE.ENTER_PROFILE);

    urlToActionTest(URLS.LISTING_LIST, ACTION_TYPE.ENTER_LISTING_LIST);
    urlToActionTest(URLS.LISTING_DETAIL + "/1", ACTION_TYPE.ENTER_LISTING_DETAIL);
    urlToActionTest(URLS.LISTING_ADMINISTRATION + "/1", ACTION_TYPE.ENTER_LISTING_ADMINISTRATION);
    urlToActionTest(`${URLS.LISTING_LIST}/${URLS.CREATE_LISTING}`, ACTION_TYPE.ENTER_CREATE_LISTING);

    urlToActionTest(URLS.TICKET_LIST, ACTION_TYPE.ENTER_TICKET_LIST);
    urlToActionTest(URLS.TICKET_DETAIL + "/1", ACTION_TYPE.ENTER_TICKET_DETAIL);

    urlToActionTest(URLS.ADMIN, ACTION_TYPE.ENTER_ADMIN);

    urlToActionTest("unknown", ACTION_TYPE.ENTER_LISTING_LIST);
}

// --------------------------------------------------
// stateToUrl
// --------------------------------------------------

console.log("\n── stateToUrl ──");

function stateToUrlTest(state, expected) {
    const url = stateToUrl(state);
    assert(
        url === `#/${expected}`,
        `stateToUrl ${state.ui.mode}: url je #/${expected}`,
    );
}

{
    stateToUrlTest({ ui: { mode: UI_MODE.LOGIN } }, URLS.LOGIN);
    stateToUrlTest({ ui: { mode: UI_MODE.REGISTER } }, URLS.REGISTER);
    stateToUrlTest({ ui: { mode: UI_MODE.PROFILE } }, URLS.PROFILE);

    stateToUrlTest({ ui: { mode: UI_MODE.LISTING_LIST } }, URLS.LISTING_LIST);
    stateToUrlTest({ ui: { mode: UI_MODE.LISTING_DETAIL, selectedListing: { ListingID: 1 } } },
        URLS.LISTING_DETAIL + "/1");
    stateToUrlTest({ ui: { mode: UI_MODE.LISTING_ADMINISTRATION, selectedListing: { ListingID: 1 } } },
        URLS.LISTING_ADMINISTRATION + "/1");
    stateToUrlTest({ ui: { mode: UI_MODE.CREATE_LISTING } }, `${URLS.LISTING_LIST}/${URLS.CREATE_LISTING}`);

    stateToUrlTest({ ui: { mode: UI_MODE.TICKET_LIST } }, URLS.TICKET_LIST);
    stateToUrlTest({ ui: { mode: UI_MODE.TICKET_DETAIL, selectedTicket: { TicketID: 1 } } },
        URLS.TICKET_DETAIL + "/1");

    stateToUrlTest({ ui: { mode: UI_MODE.ADMIN } }, URLS.ADMIN)
}


// --------------------------------------------------
//
// ACTIONS
//
// --------------------------------------------------


async function actionSuccessTest(action, payload, store, tests, nextUi = store.getState().ui.mode, notification = true) {
    await action({ store, api, payload });

    const state = store.getState();
    assert(
        state.ui.status === UI_STATUS.RDY,
        `${action.name} SUCCESS: ui.status je ${UI_STATUS.RDY}`,
    );
    assert(
        state.ui.mode === nextUi,
        `${action.name} SUCCESS: ui.mode je ${nextUi}`,
    );
    if (notification) {
        assert(
            state.ui.notification !== null,
            `${action.name} SUCCESS: notification je nastavena`,
        );
        assert(
            state.ui.notification.type === "SUCCESS",
            `${action.name} SUCCESS: notification je typu SUCCESS`,
        );
    }

    tests(state);
}

async function actionErrorTest(action, payload, store, tests, nextUi = store.getState().ui.mode, notification = true) {
    await action({ store, api: errorApi, payload });

    const state = store.getState();
    assert(
        state.ui.status === UI_STATUS.RDY,
        `${action.name} ERROR: ui.status je ${UI_STATUS.RDY}`,
    );
    assert(
        state.ui.mode === nextUi,
        `${action.name} ERROR: ui.mode je ${nextUi}`,
    );
    if (notification) {
        assert(
            state.ui.notification !== null,
            `${action.name} ERROR: notification je nastavena`,
        );
        assert(
            state.ui.notification.type === "ERROR",
            `${action.name} ERROR: notification je typu ERROR`,
        );
    }

    tests(state);
}

async function navigationActionSuccessTest(action, payload, expectedListing, expectedTicket, nextUi = undefined, overrides =
        {
            ui: {
                status: UI_STATUS.RDY,
                mode: UI_MODE.INIT,
                selectedListing: null,
                selectedTicket: null,
                filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
                errorMessage: null,
                notification: null,
            },
        }
) {
    const store = makeStore(overrides);

    await actionSuccessTest(
        action,
        payload,
        store,
        (state) => {
            assert(
                state.ui.mode === nextUi,
                `${action.name} SUCCESS: ui.mode je ${nextUi}`,
            );
            assert(
                state.ui.selectedListing?.ListingID === expectedListing?.ListingID,
                `${action.name} SUCCESS: vybraný inzerát má id ${expectedListing?.ListingID}`,
            );
            assert(
                state.ui.selectedTicket?.TicketID === expectedTicket?.TicketID,
                `${action.name} SUCCESS: vybraný ticket má id ${expectedTicket?.TicketID}`,
            );
        },
        nextUi,
        false
    );
}

async function navigationActionErrorTest(action, payload, expectedListing, expectedTicket, nextUi = undefined) {
    const overrides =
        {
            ui: {
                status: UI_STATUS.RDY,
                mode: UI_MODE.INIT,
                selectedListing: null,
                selectedTicket: null,
                filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
                errorMessage: null,
                notification: null,
            },
        };

    const store = makeStore(overrides);

    await action({ store, api: errorApi, payload });

    const state = store.getState();
    assert(
        state.ui.status === UI_STATUS.ERR,
        `${action.name} ERROR: ui.status je ${UI_STATUS.RDY}`,
    );
    assert(
        state.ui.errorMessage !== null,
        `${action.name} ERROR: errorMessage je nastavena`,
    );
    assert(
        state.ui.mode === nextUi,
        `${action.name} ERROR: ui.mode je ${nextUi}`,
    );

    assert(
        state.ui.mode === nextUi,
        `${action.name} ERROR: ui.mode je ${nextUi}`,
    );
    assert(
        state.ui.selectedListing?.ListingID === expectedListing?.ListingID,
        `${action.name} ERROR: vybraný inzerát má id ${expectedListing?.ListingID}`,
    );
    assert(
        state.ui.selectedTicket?.TicketID === expectedTicket?.TicketID,
        `${action.name} ERROR: vybraný ticket má id ${expectedTicket?.TicketID}`,
    );
}

// --------------------------------------------------
// enterAdmin
// --------------------------------------------------

console.log("\n── enterAdmin ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterAdmin, {}, null, null, UI_MODE.ADMIN);

// --------------------------------------------------
// enterCreateListing
// --------------------------------------------------

console.log("\n── enterCreateListing ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterCreateListing, {}, null, null, UI_MODE.CREATE_LISTING);

// --------------------------------------------------
// enterListingAdministration
// --------------------------------------------------

console.log("\n── enterListingAdministration ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterListingAdministration, { listingId: 1 }, { ListingID: 1 }, null, UI_MODE.LISTING_ADMINISTRATION);

// ERROR – stav se nemění, errorMessage je nastavena
await navigationActionErrorTest(enterListingAdministration, { listingId: 1 }, null, null, UI_MODE.INIT);

// --------------------------------------------------
// enterListingDetail
// --------------------------------------------------

console.log("\n── enterListingDetail ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterListingDetail, { listingId: 1 }, { ListingID: 1 }, null, UI_MODE.LISTING_DETAIL);

// ERROR – stav se nemění, errorMessage je nastavena
await navigationActionErrorTest(enterListingDetail, { listingId: 1 }, null, null, UI_MODE.INIT);

// --------------------------------------------------
// enterListingList
// --------------------------------------------------

console.log("\n── enterListingList ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterListingList, {}, null, null, UI_MODE.LISTING_LIST);

// ERROR – stav se nemění, errorMessage je nastavena
await navigationActionErrorTest(enterListingList, {}, null, null, UI_MODE.INIT);

// --------------------------------------------------
// enterUserProfile
// --------------------------------------------------

console.log("\n── enterUserProfile ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterUserProfile, {}, null, null, UI_MODE.PROFILE);

// ERROR – stav se nemění, errorMessage je nastavena
await navigationActionErrorTest(enterUserProfile, {}, null, null, UI_MODE.INIT);

// --------------------------------------------------
// enterLogin
// --------------------------------------------------

console.log("\n── enterLogin ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterLogin, {}, null, null, UI_MODE.LOGIN, {
    auth: { userId: null, username: null, role: ROLE.ANON },
    ui: {
        status: UI_STATUS.RDY,
        mode: UI_MODE.INIT,
        selectedListing: null,
        selectedTicket: null,
        filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
        errorMessage: null,
        notification: null,
    },
});

// WARNING – nastaví mode profile
await navigationActionSuccessTest(enterLogin, {}, null, null, UI_MODE.PROFILE);

// --------------------------------------------------
// enterRegister
// --------------------------------------------------

console.log("\n── enterRegister ──");

// SUCCESS – nastaví mode
await navigationActionSuccessTest(enterRegister, {}, null, null, UI_MODE.REGISTER, {
    auth: { userId: null, username: null, role: ROLE.ANON },
    ui: {
        status: UI_STATUS.RDY,
        mode: UI_MODE.INIT,
        selectedListing: null,
        selectedTicket: null,
        filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
        errorMessage: null,
        notification: null,
    },
});

// WARNING – nastaví mode profile
await navigationActionSuccessTest(enterRegister, {}, null, null, UI_MODE.PROFILE);



async function listingActionSuccessTest(action, payload, expectedListing, selectedListing, nextUi = undefined) {
    const overrides = selectedListing ?
        {
            ui: {
                status: UI_STATUS.RDY,
                mode: UI_MODE.LISTING_DETAIL,
                selectedListing: selectedListing,
                selectedTicket: null,
                filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
                errorMessage: null,
                notification: null,
            },
        }
        : {};
    const store = makeStore(overrides);

    await actionSuccessTest(
        action,
        payload,
        store,
        (state) => {
            assert(
                state.ui.selectedListing.State === expectedListing.State,
                `${action.name} SUCCESS: vybraný inzerát má state ${expectedListing.State}`,
            );
            assert(
                state.ui.selectedListing.Title === expectedListing.Title,
                `${action.name} SUCCESS: vybraný inzerát má název ${expectedListing.Title}`,
            );
            assert(
                state.ui.selectedListing?.Price === expectedListing?.Price,
                `${action.name} SUCCESS: vybraný inzerát má cenu ${expectedListing?.Price}`,
            );
            assert(
                state.ui.selectedListing?.belongsTo === expectedListing?.belongsTo,
                `${action.name} SUCCESS: vybraný inzerát má categoryId ${expectedListing?.belongsTo}`,
            );
        },
        nextUi
    );
}

async function listingActionErrorTest(action, payload, expectedListing, selectedListing) {
    const overrides = selectedListing ?
        {
            ui: {
                status: UI_STATUS.RDY,
                mode: UI_MODE.LISTING_DETAIL,
                selectedListing: selectedListing,
                selectedTicket: null,
                filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
                errorMessage: null,
                notification: null,
            },
        }
        : {};

    const store = makeStore(overrides);

    await actionErrorTest(
        action,
        payload,
        store,
        (state) => {
            assert(
                state.ui.selectedListing?.State === expectedListing?.State,
                `${action.name} ERROR: vybraný inzerát má state ${expectedListing?.State}`,
            );
            assert(
                state.ui.selectedListing?.Title === expectedListing?.Title,
                `${action.name} ERROR: vybraný inzerát má název ${expectedListing?.Title}`,
            );
            assert(
                state.ui.selectedListing?.Price === expectedListing?.Price,
                `${action.name} ERROR: vybraný inzerát má cenu ${expectedListing?.Price}`,
            );
            assert(
                state.ui.selectedListing?.belongsTo === expectedListing?.belongsTo,
                `${action.name} ERROR: vybraný inzerát má categoryId ${expectedListing?.belongsTo}`,
            );
        }
    );
}

// --------------------------------------------------
// createListing
// --------------------------------------------------

console.log("\n── createListing ──");

// SUCCESS – nový inzerát je vybrán
await listingActionSuccessTest(createListing, { title: "chair", price: 10, categoryId: 1 }, { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 }, null, UI_MODE.LISTING_DETAIL);

// ERROR – stav se nemění, notification je nastavena
await listingActionErrorTest(createListing, { title: "chair", price: 10 }, null, null);

// --------------------------------------------------
// updateListing
// --------------------------------------------------

console.log("\n── updateListing ──");

// SUCCESS – vybraný inzerát je aktualizován
await listingActionSuccessTest(updateListing, { listingId: 1, title: "chair", price: 10, categoryId: 1 }, { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "draft", Title: "printer", Price: 5, belongsTo: 3 });

// ERROR – stav se nemění, notification je nastavena
await listingActionErrorTest(updateListing, { listingId: 1, title: "chair", price: 10, categoryId: 1 }, { ListingID: 1, State: "draft", Title: "printer", Price: 5, belongsTo: 3 }, { ListingID: 1, State: "draft", Title: "printer", Price: 5, belongsTo: 3 });

// --------------------------------------------------
// deleteListing
// --------------------------------------------------

console.log("\n── deleteListing ──");

// SUCCESS – stav vybraného inzerátu je změněn na smazaný
await listingActionSuccessTest(deleteListing, { listingId: 1 }, { ListingID: 1, State: "deleted", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 });

// ERROR – stav se nemění, notification je nastavena
await listingActionErrorTest(deleteListing, { listingId: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 });

// --------------------------------------------------
// activateListing
// --------------------------------------------------

console.log("\n── activateListing ──");

// SUCCESS – stav vybraného inzerátu je změněn na aktivní
await listingActionSuccessTest(activateListing, { listingId: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 });

// ERROR – stav se nemění, notification je nastavena
await listingActionErrorTest(activateListing, { listingId: 1 }, { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "draft", Title: "chair", Price: 10, belongsTo: 1 });

// --------------------------------------------------
// sellListing
// --------------------------------------------------

console.log("\n── sellListing ──");

// SUCCESS – stav vybraného inzerátu je změněn na prodaný
await listingActionSuccessTest(sellListing, { listingId: 1 }, { ListingID: 1, State: "sold", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 });

// ERROR – stav se nemění, notification je nastavena
await listingActionErrorTest(sellListing, { listingId: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 });

// --------------------------------------------------
// blockListing
// --------------------------------------------------

console.log("\n── blockListing ──");

// SUCCESS – stav vybraného inzerátu je změněn na zablokovaný
await listingActionSuccessTest(blockListing, { listingId: 1 }, { ListingID: 1, State: "blocked", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 });

// ERROR – stav se nemění, notification je nastavena
await listingActionErrorTest(blockListing, { listingId: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 }, { ListingID: 1, State: "active", Title: "chair", Price: 10, belongsTo: 1 });


async function pictureActionSuccessTest(action, payload, expectedDiff) {
    const store = makeStore({
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.LISTING_LIST,
            selectedListing: {
                ListingID: 1,
                pictures: [{ PictureID: 2 }],
            },
            selectedTicket: null,
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
            errorMessage: null,
            notification: null,
        },
    });
    const stateBefore = store.getState();

    await actionSuccessTest(
        action,
        payload,
        store,
        (state) => {
            assert(
                state.ui.selectedListing.pictures.length === stateBefore.ui.selectedListing.pictures.length + expectedDiff,
                `${action.name} SUCCESS: počet obrázků se změnil o ${expectedDiff}`,
            );
        }
    );
}

async function pictureActionErrorTest(action, payload, expectedDiff) {
    const store = makeStore({
        ui: {
            status: UI_STATUS.RDY,
            mode: UI_MODE.LISTING_LIST,
            selectedListing: {
                ListingID: 1,
                pictures: [{ PictureID: 2 }],
            },
            selectedTicket: null,
            filters: { q: "", categoryId: null, minPrice: null, maxPrice: null },
            errorMessage: null,
            notification: null,
        },
    });
    const stateBefore = store.getState();

    await actionErrorTest(
        action,
        payload,
        store,
        (state) => {
            assert(
                state.ui.selectedListing.pictures.length === stateBefore.ui.selectedListing.pictures.length + expectedDiff,
                `${action.name} ERROR: počet obrázků se změnil o ${expectedDiff}`,
            );
        }
    );
}

// --------------------------------------------------
// uploadPicture
// --------------------------------------------------

console.log("\n── uploadPicture ──");

// SUCCESS – počet obrázků se zvýší o 1
await pictureActionSuccessTest(uploadPicture, { listingId: 1, file: "file" }, 1);

// ERROR – stav se nemění, notification je nastavena
await pictureActionErrorTest(uploadPicture, { listingId: 1, file: "file" }, 0);

// --------------------------------------------------
// deletePicture
// --------------------------------------------------

console.log("\n── deletePicture ──");

// SUCCESS – počet obrázků se sníží o 1
await pictureActionSuccessTest(deletePicture, { listingId: 1, picId: 2 }, -1);

// ERROR – stav se nemění, notification je nastavena
await pictureActionErrorTest(deletePicture, { listingId: 1, picId: 2 }, 0);

// --------------------------------------------------
// submitLogin
// --------------------------------------------------

console.log("\n── submitLogin ──");

// SUCCESS – auth je aktualizován ve stavu
{
    const store = makeStore({ auth: { role: ROLE.ANON, userId: null, name: null } });
    await actionSuccessTest(
        submitLogin,
        { email: "email", password: "password" },
        store,
        (state) => {
            assert(
                state.auth.role === ROLE.USER,
                `${submitLogin.name} SUCCESS: role je ${ROLE.USER}`
            );
            assert(
                state.auth.userId === 1,
                `${submitLogin.name} SUCCESS: userId je 1`
            );
        },
        UI_MODE.LISTING_LIST
    );
}

// ERROR – stav se nemění, notification je nastavena
{
    const store = makeStore({ auth: { role: ROLE.ANON, userId: null, name: null } });
    await actionErrorTest(
        submitLogin,
        { email: "email", password: "password" },
        store,
        (state) => {
            assert(
                state.auth.role === ROLE.ANON,
                `${submitLogin.name} ERROR: role je ${ROLE.ANON}`
            );
            assert(
                state.auth.userId === null,
                `${submitLogin.name} ERROR: userId je null`
            );
        }
    );
}

// --------------------------------------------------
// submitRegister
// --------------------------------------------------

console.log("\n── submitRegister ──");

// SUCCESS – notifikace je nastavena
{
    const store = makeStore({ auth: { role: ROLE.ANON, userId: null, name: null } });
    await actionSuccessTest(
        submitRegister,
        {},
        store,
        () => {},
        UI_MODE.LOGIN
    );
}

// ERROR – stav se nemění, notification je nastavena
{
    const store = makeStore({ auth: { role: ROLE.ANON, userId: null, name: null } });
    await actionErrorTest(
        submitRegister,
        {},
        store,
        () => {}
    );
}

// --------------------------------------------------
// logout
// --------------------------------------------------

console.log("\n── logout ──");

// SUCCESS – auth je aktualizován ve stavu
{
    const store = makeStore();
    await actionSuccessTest(
        logout,
        {},
        store,
        (state) => {
            assert(
                state.auth.role === ROLE.ANON,
                `${logout.name} SUCCESS: role je ${ROLE.ANON}`
            );
            assert(
                state.auth.userId === null,
                `${logout.name} SUCCESS: userId null`
            );
        },
        UI_MODE.LOGIN
    );
}

// ERROR – stav se nemění, notification je nastavena
{
    const store = makeStore();
    await actionErrorTest(
        logout,
        {},
        store,
        (state) => {
            assert(
                state.auth.role === ROLE.ANON,
                `${logout.name} ERROR: role je ${ROLE.ANON}`
            );
            assert(
                state.auth.userId === null,
                `${logout.name} ERROR: userId null`
            );
        },
        UI_MODE.LOGIN
    );
}


// --------------------------------------------------
// setFilters
// --------------------------------------------------

console.log("\n── setFilters ──");

// filtry jsou nastaveny
{
    const store = makeStore();

    await setFilters({ store, api, payload: { q: "search", categoryId: 1, minPrice: 10, maxPrice: 100 } });

    const state = store.getState();
    assert(
        state.ui.filters.q === "search",
        `${setFilters.name}: filter query je search`,
    );
    assert(
        state.ui.filters.categoryId === 1,
        `${setFilters.name}: filter categoryId je 1`,
    );
    assert(
        state.ui.filters.minPrice === 10,
        `${setFilters.name}: filter minPrice je 10`,
    );
    assert(
        state.ui.filters.maxPrice === 100,
        `${setFilters.name}: filter maxPrice je 100`,
    );
    assert(
        JSON.stringify(state.ui.filters.allSubCategories) === JSON.stringify([{ CategoryID: 1 }]),
        `${setFilters.name}: filter allSubCategories je ${JSON.stringify([{ CategoryID: 1 }])}`,
    );
}

total();
