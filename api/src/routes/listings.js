const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireAdmin} = require("../middleware/auth");

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
  where.AND.push({ State: "active" });

  if (q)
    where.AND.push({
      OR: [{ Title: { contains: q } }, { Description: { contains: q } }],
    });

  if (!isNaN(categoryId)) where.AND.push({ belongsTo: categoryId });

  if (!isNaN(minPrice)) where.AND.push({ Price: { gte: minPrice } });

  if (!isNaN(maxPrice)) where.AND.push({ Price: { lte: maxPrice } });

  const take = !isNaN(limit) ? limit : 20;
  const skip = !isNaN(page) ? (page - 1) * take : 0;

  try {
    const [listings, total] = await Promise.all([
      prisma.activeListing.findMany({
        where: where,
        skip: skip,
        take: take,
        orderBy: { Createdat: "desc" },
      }),
      prisma.activeListing.count({
        where: where,
      }),
    ]);

    return res.json({ status: "SUCCESS", listings, total });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const listing = await prisma.listingDetail.findUnique({
      where: { ListingID: id, State: "active", user: { path: ["State"], equals: "active" } },
    });

    if (!listing)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    return res.json({ status: "SUCCESS", listing });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/:id/auth", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const listing = await prisma.listingDetail.findUnique({
      where: { ListingID: id, OR: [
          { State: "active", user: { path: ["State"], equals: "active" } },
          { author: userId },
          { ...(await prisma.isBuyer(id, userId) && { ListingID: id }) },
        ] },
    });

    if (!listing)
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    return res.json({ status: "SUCCESS", listing });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { title, price, categoryId, description = "" } = req.body;
  const userId = req.user.userId;

  if (!title || !price) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí název nebo cena inzerátu" });
  }

  try {
    // TODO: check user status
    const listing = await prisma.listing.create({
      data: {
        Title: title,
        Price: parseInt(price),
        Description: description,
        belongsTo: categoryId ? parseInt(categoryId) : null,
        author: userId,
        State: "draft",
      },
    });
    return res.status(201).json({ status: "SUCCESS", listing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const { title, price, description = "", categoryId } = req.body;
  const userId = req.user.userId;

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });

    if (!listing)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    if (listing.author !== userId) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });
    }

    const updated = await prisma.listing.update({
      where: { ListingID: id },
      data: {
        ...(title && { Title: title }),
        ...(price && { Price: parseInt(price) }),
        ...(description && { Description: description }),
        ...(categoryId && { belongsTo: parseInt(price) }),
      },
    });

    return res.json({ status: "SUCCESS", listing: updated });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/activate", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });

    if (!listing)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    if (listing.author !== userId) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });
    }

    if (listing.State !== "draft" && listing.State !== "sold") {
      return res
        .status(403)
        .json({
          status: "ERROR",
          reason: "Inzerát nelze označit jako aktivní",
        });
    }

    const updated = await prisma.listing.update({
      where: { ListingID: id },
      data: {
        State: "active",
      },
    });

    return res.json({ status: "SUCCESS", listing: updated });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/sell", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });

    if (!listing)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    if (listing.author !== userId) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });
    }

    if (listing.State !== "active") {
      return res
        .status(403)
        .json({
          status: "ERROR",
          reason: "Inzerát nelze označit jako prodaný",
        });
    }

    const updated = await prisma.listing.update({
      where: { ListingID: id },
      data: {
        State: "sold",
      },
    });

    return res.json({ status: "SUCCESS", listing: updated });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/delete", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });

    if (!listing)
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    if (listing.author !== userId) {
      return res
          .status(403)
          .json({ status: "ERROR", reason: "Přístup odepřen" });
    }

    if (listing.State !== "active") {
      return res
          .status(403)
          .json({
            status: "ERROR",
            reason: "Inzerát nelze označit jako smazaný",
          });
    }

    const updated = await prisma.listing.update({
      where: { ListingID: id },
      data: {
        State: "deleted",
      },
    });

    return res.json({ status: "SUCCESS", listing: updated });
  } catch (err) {
    if (err.code === "P2025")
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/block", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });

    if (!listing)
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    if (listing.State !== "active" && listing.State !== "sold") {
      return res
          .status(403)
          .json({
            status: "ERROR",
            reason: "Inzerát nelze označit jako zablokovaný",
          });
    }

    const updated = await prisma.listing.update({
      where: { ListingID: id },
      data: {
        State: "blocked",
      },
    });

    return res.json({ status: "SUCCESS", listing: updated });
  } catch (err) {
    if (err.code === "P2025")
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/unblock", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });

    if (!listing)
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });

    if (listing.State !== "block") {
      return res
          .status(403)
          .json({
            status: "ERROR",
            reason: "Inzerát nelze označit jako aktivní",
          });
    }

    const updated = await prisma.listing.update({
      where: { ListingID: id },
      data: {
        State: "draft",
      },
    });

    return res.json({ status: "SUCCESS", listing: updated });
  } catch (err) {
    if (err.code === "P2025")
      return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
