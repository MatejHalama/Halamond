CREATE VIEW "ActiveListing" AS
SELECT
    l.*,
    to_jsonb(ca.*) as "category",
    COALESCE(
        jsonb_agg(p.*) FILTER ( WHERE p."PictureID" IS NOT NULL ),
        '[]'
    ) as "pictures"
FROM
    "Listing" l
LEFT JOIN
    "Category" ca ON l."belongsTo" = ca."CategoryID"
LEFT JOIN
    "User" u ON l.author = u."UserID"
LEFT JOIN
    "Picture" p ON l."ListingID" = p.listing
WHERE
    l."State" = 'active' AND
    u."State" = 'active'
GROUP BY
    l."ListingID", ca."CategoryID", u."UserID";


CREATE VIEW "TicketOverview" AS
SELECT
    t."TicketID",
    t."State",
    t."Createdat",
    t."Updatedat",
    t."buyer",
    t."subjectListing",
    l."author" AS "listingAuthor",
    to_jsonb((SELECT row FROM (
        SELECT l."ListingID", l."Title", l."State", l."author"
    ) AS row)) AS "listing",
    to_jsonb((SELECT row FROM (
        SELECT u."UserID", u."Username"
    ) AS row)) AS "buyerUser",
    COALESCE(
        (SELECT jsonb_agg(msg_sub) FROM (
            SELECT m."MessageID", m."Text", m."sender", m."Createdat"
            FROM "Message" m
            WHERE m."ticket" = t."TicketID"
            ORDER BY m."Createdat" DESC
            LIMIT 1
        ) AS msg_sub),
        '[]'::jsonb
    ) AS "messages"
FROM "Ticket" t
LEFT JOIN "Listing" l ON t."subjectListing" = l."ListingID"
LEFT JOIN "User" u ON t."buyer" = u."UserID";


CREATE VIEW "ListingDetail" AS
SELECT
    l.*,
    to_jsonb(ca.*) as "category",
    to_jsonb((SELECT _ FROM (SELECT u."UserID", u."Username", u."State") _)) as "user",
    COALESCE(
        jsonb_agg(p.*) FILTER ( WHERE p."PictureID" IS NOT NULL ),
        '[]'
    ) as "pictures",
    --COALESCE(
    --    jsonb_agg(co.*) FILTER ( WHERE co."CommentID" IS NOT NULL ),
    --    '[]'
    --) as "comments"
    (SELECT fn_result FROM get_comments_with_replies(null, l."ListingID") fn_result) as "comments"
FROM
    "Listing" l
LEFT JOIN
    "Category" ca ON l."belongsTo" = ca."CategoryID"
LEFT JOIN
    "User" u ON l.author = u."UserID"
LEFT JOIN
    "Picture" p ON l."ListingID" = p.listing
GROUP BY
    l."ListingID", ca."CategoryID", u."UserID";
