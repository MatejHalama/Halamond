const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
    const q = req.query.q;
    const categoryId = parseInt(req.query.categoryId);
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const where = { AND: [] };

    // only ACTIVE listings
    where.AND.push(
        { State: "active" }
    );

    if (q)
        where.AND.push(
            { OR: [
                    { Title: { contains: q }},
                    { Description: { contains: q }},
                ]}
        );

    if (!isNaN(categoryId))
        where.AND.push(
            { belongsTo: categoryId }
        );

    if (!isNaN(minPrice))
        where.AND.push(
            { Price: { gte: minPrice }},
        );

    if (!isNaN(maxPrice))
        where.AND.push(
            { Price: { lte: maxPrice }},
        );

    const take = (!isNaN(limit)) ? limit : 20;
    const skip = (!isNaN(page)) ? (page - 1) * take : 0;

    try {
        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where: where,
                skip: skip,
                take: take
            }),
            prisma.listing.count({
                where: where
            })
        ])

        return res.json({ status: "SUCCESS", listings, total });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
    }
});



module.exports = router;