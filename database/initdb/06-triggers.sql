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

-- TODO: triggre pro vytváření notifikací
