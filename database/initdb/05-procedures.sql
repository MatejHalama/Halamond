-- Insert a notification record
CREATE PROCEDURE create_notification(
    p_recipient INTEGER,
    p_ticket    INTEGER,
    p_text      VARCHAR,
    p_link      VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "Notification" ("recipient", "ticket", "Text", "Link")
    VALUES (p_recipient, p_ticket, p_text, p_link);
END;
$$;


-- Close a single ticket and notify both participants
CREATE PROCEDURE close_ticket(p_ticket_id INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_buyer  INTEGER;
    v_seller INTEGER;
BEGIN
    SELECT t."buyer", l."author"
    INTO v_buyer, v_seller
    FROM "Ticket" t
    LEFT JOIN "Listing" l ON t."subjectListing" = l."ListingID"
    WHERE t."TicketID" = p_ticket_id AND t."State" = 'open';

    IF NOT FOUND THEN
        RETURN;
    END IF;

    UPDATE "Ticket"
    SET "State" = 'closed'
    WHERE "TicketID" = p_ticket_id;

    IF v_buyer IS NOT NULL THEN
        CALL create_notification(
            v_buyer, p_ticket_id,
            'Konverzace byla uzavřena',
            '/tickets/' || p_ticket_id
        );
    END IF;

    IF v_seller IS NOT NULL THEN
        CALL create_notification(
            v_seller, p_ticket_id,
            'Konverzace byla uzavřena',
            '/tickets/' || p_ticket_id
        );
    END IF;
END;
$$;


-- Send a message in a ticket
CREATE PROCEDURE send_ticket_message(
    p_ticket_id INTEGER,
    p_sender_id INTEGER,
    p_text      TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_buyer  INTEGER;
    v_seller INTEGER;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "Ticket"
        WHERE "TicketID" = p_ticket_id AND "State" = 'open'
    ) THEN
        RAISE EXCEPTION 'Ticket % is not open', p_ticket_id;
    END IF;

    INSERT INTO "Message" ("Text", "sender", "ticket")
    VALUES (p_text, p_sender_id, p_ticket_id);

    UPDATE "Ticket"
    SET "Updatedat" = now()
    WHERE "TicketID" = p_ticket_id;

    SELECT t."buyer", l."author"
    INTO v_buyer, v_seller
    FROM "Ticket" t
    LEFT JOIN "Listing" l ON t."subjectListing" = l."ListingID"
    WHERE t."TicketID" = p_ticket_id;

    IF p_sender_id = v_buyer AND v_seller IS NOT NULL THEN
        CALL create_notification(
            v_seller, p_ticket_id,
            'Nová zpráva v konverzaci',
            '/tickets/' || p_ticket_id
        );
    ELSIF v_buyer IS NOT NULL THEN
        CALL create_notification(
            v_buyer, p_ticket_id,
            'Nová zpráva v konverzaci',
            '/tickets/' || p_ticket_id
        );
    END IF;
END;
$$;
