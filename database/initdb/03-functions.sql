CREATE FUNCTION is_buyer(ListingID "Listing"."ListingID"%TYPE, UserID "User"."UserID"%TYPE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM "Ticket"
        WHERE "subjectListing" = ListingID AND buyer = UserID
    );
END;
$$ LANGUAGE plpgsql;
