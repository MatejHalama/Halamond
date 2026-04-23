import * as API_STATUS from "../../statuses/apiStatus.js";

export async function submitRating({ api, payload }) {
  const { reviewedId, rating } = payload;
  return api.ratings.submitRating(reviewedId, rating);
}
