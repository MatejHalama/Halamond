import * as VIEW_STATE_TYPE from "../../constants/viewStateType.js";
import * as UI_MODE from "../../constants/uiMode.js";
import * as UI_STATUS from "../../statuses/uiStatus.js";
import * as ROLE from "../../constants/role.js";

/* ****************************************** */
/*
 *  rozhodování o capabilities
 *
 */
/* ****************************************** */

export function canCreateListing(state) {
  // TODO: check if user is not blocked
  const { role } = state.auth;
  return role === ROLE.USER || role === ROLE.ADMIN;
}

export function canUpdateListing(state) {
  const { role, userId } = state.auth;
  if (role !== ROLE.USER && role !== ROLE.ADMIN) return false;

  const listing = state.ui.selectedListing ?? null;
  if (!listing) return false;

  if (listing.author !== userId) return false;

  return listing.State === "draft" || listing.State === "active";
}

export function canActivateListing(state) {
  const { role, userId } = state.auth;
  if (role !== ROLE.USER && role !== ROLE.ADMIN) return false;

  const listing = state.ui.selectedListing ?? null;
  if (!listing) return false;

  if (listing.author !== userId) return false;

  return listing.State === "draft" || listing.State === "sold";
}

export function canSellListing(state) {
  const { role, userId } = state.auth;
  if (role !== ROLE.USER && role !== ROLE.ADMIN) return false;

  const listing = state.ui.selectedListing ?? null;
  if (!listing) return false;

  if (listing.author !== userId) return false;

  return listing.State === "active";
}

export function canDeleteListing(state) {
  const { role, userId } = state.auth;
  if (role !== ROLE.USER && role !== ROLE.ADMIN) return false;

  const listing = state.ui.selectedListing ?? null;
  if (!listing) return false;

  if (listing.author !== userId) return false;

  return listing.State === "active" || listing.State === "sold";
}

export function canEnterAdministration(state) {
  const { role, userId } = state.auth;
  if (role !== ROLE.USER && role !== ROLE.ADMIN) return false;

  const listing = state.ui.selectedListing ?? null;
  if (!listing) return false;

  if (listing.author !== userId) return false;

  return listing.State === "active" || listing.State === "draft";
}

/**/

export function canContactSeller(state) {
  const { role, userId } = state.auth;
  if (role === ROLE.ANON) return false;

  const listing = state.ui.selectedListing ?? null;
  if (!listing) return false;
  if (listing.State !== "active") return false;
  if (listing.author === userId) return false;

  return true;
}

export function canSendMessage(state) {
  const ticket = state.ui.selectedTicket ?? null;
  if (!ticket) return false;
  if (ticket.State !== "open") return false;

  const { userId } = state.auth;
  return ticket.buyer === userId || ticket.listing?.author === userId;
}

export function canRateSeller(state) {
  const ticket = state.ui.selectedTicket ?? null;
  if (!ticket) return false;
  const { userId } = state.auth;
  return ticket.buyer === userId;
}

export function canCloseTicket(state) {
  const ticket = state.ui.selectedTicket ?? null;
  if (!ticket) return false;
  if (ticket.State !== "open") return false;

  const { userId } = state.auth;
  return ticket.buyer === userId || ticket.listing?.author === userId;
}

export function selectUnreadCount(state) {
  const { userId } = state.auth;
  if (!userId) return 0;

  return (state.tickets ?? []).filter((t) => {
    if (t.State !== "open") return false;
    const lastMessage = t.messages?.[0];
    if (!lastMessage) return false;
    return lastMessage.sender !== userId;
  }).length;
}

export function selectUnreadNotificationCount(state) {
  return (state.notifications ?? []).filter((n) => !n.Read).length;
}

export function selectListings(state) {
  return state.listings ?? [];
}

export function selectFilteredListings(state) {
  const listings = selectListings(state);
  const { q, categoryId, minPrice, maxPrice } = state.ui.filters ?? {};

  return listings.filter((l) => {
    if (q) {
      const needle = q.toLowerCase();
      const inTitle = l.Title?.toLowerCase().includes(needle);
      const inDesc = l.Description?.toLowerCase().includes(needle);
      if (!inTitle && !inDesc) return false;
    }
    if (categoryId != null && l.belongsTo !== categoryId) return false;
    if (minPrice != null && Number(l.Price) < Number(minPrice)) return false;
    if (maxPrice != null && Number(l.Price) > Number(maxPrice)) return false;
    return true;
  });
}

export function selectLoginView(state) {
  return {
    type: VIEW_STATE_TYPE.LOGIN,
    capabilities: {},
  };
}

export function selectRegisterView(state) {
  return {
    type: VIEW_STATE_TYPE.REGISTER,
    capabilities: {},
  };
}

export function selectListingListView(state) {
  return {
    type: VIEW_STATE_TYPE.LISTING_LIST,
    listings: selectFilteredListings(state),
    categories: state.categories ?? [],
    filters: state.ui.filters,
    auth: state.auth,
    notifications: state.notifications ?? [],
    unreadCount: selectUnreadCount(state),
    notificationCount: selectUnreadNotificationCount(state),
    capabilities: {
      canEnterDetail: true,
      canCreateListing: canCreateListing(state),
    },
  };
}

export function selectListingDetailView(state) {
  const listing = state.ui.selectedListing ?? null;
  const sellerId = listing?.user?.UserID ?? listing?.author ?? null;
  const canViewSellerProfile = !!sellerId && sellerId !== state.auth.userId;
  const canReportListing =
    state.auth.role !== ROLE.ANON &&
    !!listing &&
    listing.author !== state.auth.userId;
  const isAdmin = state.auth.role === ROLE.ADMIN;
  const canBlockListing =
    isAdmin &&
    !!listing &&
    !["blocked", "deleted"].includes(listing.State);

  return {
    type: VIEW_STATE_TYPE.LISTING_DETAIL,
    listing,
    auth: state.auth,
    capabilities: {
      canBackToList: true,
      canContactSeller: canContactSeller(state),
      canActivateListing: canActivateListing(state),
      canSellListing: canSellListing(state),
      canDeleteListing: canDeleteListing(state),
      canEnterAdministration: canEnterAdministration(state),
      canViewSellerProfile,
      canReportListing,
      canBlockListing,
    },
  };
}

export function selectListingAdministrationView(state) {
  return {
    type: VIEW_STATE_TYPE.LISTING_ADMINISTRATION,
    listing: state.ui.selectedListing ?? null,
    auth: state.auth,
    capabilities: {
      canBackToList: true,
      canUpdateListing: canUpdateListing(state),
    },
  };
}

export function selectTicketListView(state) {
  return {
    type: VIEW_STATE_TYPE.TICKET_LIST,
    tickets: state.tickets ?? [],
    auth: state.auth,
    unreadCount: selectUnreadCount(state),
    capabilities: {
      canEnterDetail: true,
    },
  };
}

export function selectTicketDetailView(state) {
  return {
    type: VIEW_STATE_TYPE.TICKET_DETAIL,
    ticket: state.ui.selectedTicket ?? null,
    auth: state.auth,
    capabilities: {
      canSendMessage: canSendMessage(state),
      canCloseTicket: canCloseTicket(state),
      canRateSeller: canRateSeller(state),
    },
  };
}

export function selectProfileView(state) {
  const isOwnProfile = state.profileUser?.UserID === state.auth.userId;
  const isAdmin = state.auth.role === ROLE.ADMIN;
  const canReportUser = !isOwnProfile && state.auth.role !== ROLE.ANON && !!state.profileUser;
  const canBlockUser = isAdmin && !isOwnProfile && !!state.profileUser && state.profileUser.State === "active";
  const canUnblockUser = isAdmin && !isOwnProfile && !!state.profileUser && state.profileUser.State === "blocked";
  return {
    type: VIEW_STATE_TYPE.PROFILE,
    auth: state.auth,
    profileUser: state.profileUser,
    capabilities: {
      canBackToList: true,
      canLogout: isOwnProfile,
      canReportUser,
      canBlockUser,
      canUnblockUser,
    },
  };
}

/*
 ** vrací objekt ve tvaru
 ** {
 **   type: 'LOADING' | 'ERROR' | EXAM_TERM_LIST | 'EXAM_TERM_DETAIL' | 'EXAM_TERM_ADMINISTRATION',
 **   message?: string ,
 **   exam?: ExamTerm,
 **   exams?: ExamTerm[],
 **   capabilities?: {
 **     canEnterDetail: boolean,
 **     canEnterAdministration: boolean,
 **     canBackToList: boolean,
 **     canCreateExam: boolean,
 **     canRegister: boolean,
 **     canUnregister: boolean,
 **     canPublish: boolean,
 **     canUnpublish: boolean,
 **     canCancel: boolean,
 **     canDelete: boolean,
 **     canUpdateCapacity: boolean,
 **     canUpdate: boolean
 **   },
 ** }
 */
export function selectViewState(state) {
  if (state.ui.status === UI_STATUS.LOAD) {
    return { type: VIEW_STATE_TYPE.LOADING };
  }

  if (state.ui.status === UI_STATUS.ERR) {
    return {
      type: VIEW_STATE_TYPE.ERROR,
      message: state.ui.errorMessage ?? "error.",
    };
  }

  switch (state.ui.mode) {
    case UI_MODE.LOGIN:
      return selectLoginView(state);
    case UI_MODE.REGISTER:
      return selectRegisterView(state);
    case UI_MODE.PROFILE:
      return selectProfileView(state);
    case UI_MODE.LISTING_LIST:
      return selectListingListView(state);
    case UI_MODE.LISTING_DETAIL:
      return selectListingDetailView(state);
    case UI_MODE.LISTING_ADMINISTRATION:
      return selectListingAdministrationView(state);
    case UI_MODE.TICKET_LIST:
      return selectTicketListView(state);
    case UI_MODE.TICKET_DETAIL:
      return selectTicketDetailView(state);
    default:
      return {
        type: VIEW_STATE_TYPE.ERROR,
        message: "not known view.",
      };
  }
}
