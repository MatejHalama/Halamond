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


CREATE FUNCTION is_blocked(UserID "User"."UserID"%TYPE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM "User" u
        WHERE u."UserID" = UserID AND u."State" = 'blocked'
    );
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION get_unread_notification_count(p_user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM "Notification"
        WHERE "recipient" = p_user_id AND "Read" = FALSE
    );
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION is_ticket_participant(p_ticket_id INTEGER, p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_buyer  INTEGER;
    v_seller INTEGER;
BEGIN
    SELECT t."buyer", l."author"
    INTO v_buyer, v_seller
    FROM "Ticket" t
    LEFT JOIN "Listing" l ON t."subjectListing" = l."ListingID"
    WHERE t."TicketID" = p_ticket_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN v_buyer = p_user_id OR v_seller = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- Returns average rating for a user, or NULL if no ratings exist.
-- STABLE: reads DB but does not modify it; result is consistent within one transaction.
CREATE FUNCTION get_user_avg_rating(p_user_id INTEGER)
RETURNS NUMERIC(3,2) STABLE AS $$
DECLARE
    v_avg NUMERIC(3,2);
    v_count INTEGER;
BEGIN
    SELECT COUNT(*), AVG("Rating")::NUMERIC(3,2)
    INTO v_count, v_avg
    FROM "Rating"
    WHERE "reviewed" = p_user_id;

    IF v_count = 0 THEN
        RETURN NULL;
    END IF;

    RETURN v_avg;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_subcategories(CategoryID "Category"."CategoryID"%TYPE)
RETURNS TABLE (
    "CategoryID" integer,
    "Name" varchar,
    "parentCategory" integer
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE CategoryTree AS (
        SELECT c."CategoryID", c."Name", c."parentCategory"
        FROM "Category" c
        WHERE c."CategoryID" = CategoryID

        UNION ALL

        SELECT c."CategoryID", c."Name", c."parentCategory"
        FROM "Category" c
        JOIN CategoryTree ct ON c."parentCategory" = ct."CategoryID"
    )
    SELECT * FROM CategoryTree;
END;
$$ LANGUAGE plpgsql;
