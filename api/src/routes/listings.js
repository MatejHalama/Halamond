const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `listing-${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Povoleny jsou pouze obrázky"));
  },
});

router.get("/my", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const listings = await prisma.listing.findMany({
      where: { author: userId },
      include: {
        pictures: true,
        category: true,
      },
      orderBy: { Createdat: "desc" },
    });
    return res.json({ status: "SUCCESS", listings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

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
    if (!isNaN(categoryId)) {
      const subCategories = await prisma.getAllSubcategories(categoryId);
      if (subCategories.length > 0) {
        where.AND.push({ belongsTo: { in: subCategories.map(item => item.CategoryID) } });
      }
    }

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
      where: {
        ListingID: id,
        State: "active",
        user: { path: ["State"], equals: "active" },
      },
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
  const role = req.user.role;

  try {
    const listing = await prisma.listingDetail.findUnique({
      where: {
        ListingID: id,
        OR: [
          { State: "active", user: { path: ["State"], equals: "active" } },
          { author: userId },
          { ...((await prisma.isBuyer(id, userId)) && { ListingID: id }) },
          { ...((role === "admin") && { ListingID: id }) },
        ],
      },
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
    if (await prisma.isBlocked(userId)) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen, uživatel je zablokován" });
    }

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
    if (await prisma.isBlocked(userId)) {
      return res
          .status(403)
          .json({ status: "ERROR", reason: "Přístup odepřen, uživatel je zablokován" });
    }

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
        ...(categoryId && { belongsTo: parseInt(categoryId) }),
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
    if (await prisma.isBlocked(userId)) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen, uživatel je zablokován" });
    }

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
      return res.status(403).json({
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
    if (await prisma.isBlocked(userId)) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen, uživatel je zablokován" });
    }

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
      return res.status(403).json({
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
    if (await prisma.isBlocked(userId)) {
      return res
          .status(403)
          .json({ status: "ERROR", reason: "Přístup odepřen, uživatel je zablokován" });
    }

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
      return res.status(403).json({
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
      return res.status(403).json({
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

    if (listing.State !== "blocked") {
      return res.status(403).json({
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

router.post(
  "/:id/pictures",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    if (!req.file)
      return res.status(400).json({ status: "ERROR", reason: "Žádný soubor" });

    try {
      const listing = await prisma.listing.findUnique({
        where: { ListingID: id },
      });
      if (!listing)
        return res
          .status(404)
          .json({ status: "ERROR", reason: "Inzerát nenalezen" });
      if (listing.author !== userId)
        return res
          .status(403)
          .json({ status: "ERROR", reason: "Přístup odepřen" });

      const picture = await prisma.picture.create({
        data: { Path: `/uploads/${req.file.filename}`, listing: id },
      });

      return res.status(201).json({ status: "SUCCESS", picture });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
    }
  },
);

router.delete("/:id/pictures/:picId", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const picId = parseInt(req.params.picId);
  const userId = req.user.userId;

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: id },
    });
    if (!listing || listing.author !== userId)
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });

    const pic = await prisma.picture.findUnique({
      where: { PictureID: picId },
    });
    if (!pic)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Obrázek nenalezen" });

    const filePath = path.join(uploadDir, path.basename(pic.Path));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.picture.delete({ where: { PictureID: picId } });
    return res.json({ status: "SUCCESS" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
