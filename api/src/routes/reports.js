const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { text, reportedListingId, reportedUserId } = req.body;
  const reporterId = req.user.userId;

  if (!text)
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí text hlášení" });
  if (!reportedListingId && !reportedUserId) {
    return res.status(400).json({
      status: "ERROR",
      reason: "Musí být zadán reportedListingId nebo reportedUserId",
    });
  }

  try {
    const report = await prisma.report.create({
      data: {
        Text: text,
        reporter: reporterId,
        reportedListing: reportedListingId ? parseInt(reportedListingId) : null,
        reportedUser: reportedUserId ? parseInt(reportedUserId) : null,
      },
    });

    return res.status(201).json({ status: "SUCCESS", report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        include: {
          reporterUser: { select: { UserID: true, Username: true } },
          reportedUserRel: { select: { UserID: true, Username: true } },
          reportedListingRel: { select: { ListingID: true, Title: true } },
        },
        orderBy: { Createdat: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.report.count(),
    ]);

    return res.json({ status: "SUCCESS", reports, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    await prisma.report.delete({ where: { ReportID: id } });
    return res.json({ status: "SUCCESS" });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Hlášení nenalezeno" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
