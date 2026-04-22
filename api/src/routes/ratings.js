const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { reviewedId, rating } = req.body;
  const reviewerId = req.user.userId;

  if (!reviewedId || rating === undefined) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí reviewedId nebo rating" });
  }
  const ratingValue = parseInt(rating);
  if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Hodnocení musí být číslo 1 až 5" });
  }
  if (reviewerId === parseInt(reviewedId)) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Nelze hodnotit sebe sama" });
  }

  try {
    const reviewed = await prisma.user.findUnique({
      where: { UserID: parseInt(reviewedId) },
    });
    if (!reviewed)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Hodnocený uživatel nenalezen" });

    const existing = await prisma.rating.findFirst({
      where: { reviewer: reviewerId, reviewed: parseInt(reviewedId) },
    });
    if (existing)
      return res
        .status(409)
        .json({
          status: "ERROR",
          reason: "Tohoto uživatele jste již hodnotili",
        });

    const newRating = await prisma.rating.create({
      data: {
        Rating: ratingValue,
        reviewed: parseInt(reviewedId),
        reviewer: reviewerId,
      },
      include: {
        reviewedUser: { select: { UserID: true, Username: true } },
        reviewerUser: { select: { UserID: true, Username: true } },
      },
    });

    return res.status(201).json({ status: "SUCCESS", rating: newRating });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const rating = await prisma.rating.findUnique({ where: { RatingID: id } });
    if (!rating)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Hodnocení nenalezeno" });

    const isOwner = rating.reviewer === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Nedostatečná oprávnění" });
    }

    await prisma.rating.delete({ where: { RatingID: id } });
    return res.json({ status: "SUCCESS" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
