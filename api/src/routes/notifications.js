const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [notifications, countRow] = await Promise.all([
      prisma.notification.findMany({
        where: { recipient: userId },
        orderBy: { Createdat: "desc" },
        take: 30,
      }),
      prisma.$queryRaw`
        SELECT get_unread_notification_count(${userId}::integer) AS count
      `,
    ]);

    return res.json({
      status: "SUCCESS",
      notifications,
      unreadCount: Number(countRow[0].count),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const notification = await prisma.notification.findUnique({
      where: { NotificationID: id },
    });

    if (!notification)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Notifikace nenalezena" });

    if (notification.recipient !== userId)
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });

    const updated = await prisma.notification.update({
      where: { NotificationID: id },
      data: { Read: true },
    });

    return res.json({ status: "SUCCESS", notification: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/read-all", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    await prisma.notification.updateMany({
      where: { recipient: userId, Read: false },
      data: { Read: true },
    });

    return res.json({ status: "SUCCESS" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
