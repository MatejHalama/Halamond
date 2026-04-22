CREATE FUNCTION "updated_now"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."Updatedat" := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER "listing_updated_now"
BEFORE UPDATE ON "Listing"
FOR EACH ROW
EXECUTE FUNCTION updated_now();

-- Prevents inserting a message into a closed or non-existent ticket at the DB level.
CREATE FUNCTION prevent_message_on_closed_ticket()
RETURNS TRIGGER AS $$
DECLARE
    v_state TEXT;
BEGIN
    SELECT "State"::TEXT INTO v_state
    FROM "Ticket"
    WHERE "TicketID" = NEW."ticket";

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket % does not exist', NEW."ticket";
    END IF;

    IF v_state = 'closed' THEN
        RAISE EXCEPTION 'Cannot add message to closed ticket %', NEW."ticket";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "message_ticket_open_check"
BEFORE INSERT ON "Message"
FOR EACH ROW
EXECUTE FUNCTION prevent_message_on_closed_ticket();


CREATE FUNCTION close_tickets_on_listing_end()
RETURNS TRIGGER AS $$
DECLARE
    v_ticket_id INTEGER;
BEGIN
    IF NEW."State" IN ('sold', 'deleted') AND OLD."State" NOT IN ('sold', 'deleted') THEN
        FOR v_ticket_id IN
            SELECT "TicketID"
            FROM "Ticket"
            WHERE "subjectListing" = NEW."ListingID" AND "State" = 'open'
        LOOP
            CALL close_ticket(v_ticket_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "listing_tickets_close"
AFTER UPDATE OF "State" ON "Listing"
FOR EACH ROW
EXECUTE FUNCTION close_tickets_on_listing_end();
