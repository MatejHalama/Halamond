const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          UserID: true,
          Username: true,
          Email: true,
          Role: true,
          State: true,
          Createdat: true,
        },
        orderBy: { Createdat: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.user.count(),
    ]);

    return res.json({ status: "SUCCESS", users, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const user = await prisma.user.findUnique({
      where: { UserID: id },
      select: {
        UserID: true,
        Username: true,
        Createdat: true,
        State: true,
        listings: {
          where: { State: "active" },
          include: {
            pictures: { take: 1 },
            category: { select: { CategoryID: true, Name: true } },
          },
          orderBy: { Createdat: "desc" },
        },
        receivedRatings: {
          include: {
            reviewerUser: { select: { UserID: true, Username: true } },
          },
          orderBy: { Createdat: "desc" },
        },
      },
    });

    if (!user)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Uživatel nenalezen" });

    const [ratingRow] = await prisma.$queryRaw`
      SELECT get_user_avg_rating(${id}::integer) AS avg
    `;
    const avgRating = ratingRow.avg !== null ? Number(ratingRow.avg) : null;

    return res.json({ status: "SUCCESS", user: { ...user, avgRating } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/:id/listings", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const isSelf = req.user.userId === id;
  const isAdmin = req.user.role === "admin";

  const where = {
    author: id,
    ...(!isSelf && !isAdmin ? { State: "active" } : {}),
  };

  try {
    const listings = await prisma.listing.findMany({
      where,
      include: {
        pictures: { take: 1 },
        category: { select: { CategoryID: true, Name: true } },
      },
      orderBy: { Createdat: "desc" },
    });

    return res.json({ status: "SUCCESS", listings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/block", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const user = await prisma.user.update({
      where: { UserID: id },
      data: { State: "blocked" },
      select: { UserID: true, Username: true, State: true },
    });
    return res.json({ status: "SUCCESS", user });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Uživatel nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/unblock", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const user = await prisma.user.update({
      where: { UserID: id },
      data: { State: "active" },
      select: { UserID: true, Username: true, State: true },
    });
    return res.json({ status: "SUCCESS", user });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Uživatel nenalezen" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
