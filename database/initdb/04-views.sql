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


CREATE VIEW "ListingDetail" AS
SELECT
    l.*,
    to_jsonb(ca.*) as "category",
    to_jsonb((SELECT _ FROM (SELECT u."UserID", u."Username", u."State") _)) as "user",
    COALESCE(
        jsonb_agg(p.*) FILTER ( WHERE p."PictureID" IS NOT NULL ),
        '[]'
    ) as "pictures",
    COALESCE(
        jsonb_agg(co.*) FILTER ( WHERE co."CommentID" IS NOT NULL ),
        '[]'
    ) as "comments"
FROM
    "Listing" l
LEFT JOIN
    "Category" ca ON l."belongsTo" = ca."CategoryID"
LEFT JOIN
    "User" u ON l.author = u."UserID"
LEFT JOIN
    "Picture" p ON l."ListingID" = p.listing
LEFT JOIN
    "Comment" co ON l."ListingID" = co.listing
GROUP BY
    l."ListingID", ca."CategoryID", u."UserID";