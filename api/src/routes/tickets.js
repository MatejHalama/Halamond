const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [{ buyer: userId }, { listing: { author: userId } }],
      },
      include: {
        listing: {
          select: { ListingID: true, Title: true, State: true, author: true },
        },
        buyerUser: { select: { UserID: true, Username: true } },
        messages: {
          orderBy: { Createdat: "desc" },
          take: 1,
        },
      },
      orderBy: { Updatedat: "desc" },
    });

    return res.json({ status: "SUCCESS", tickets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { TicketID: id },
      include: {
        listing: {
          select: { ListingID: true, Title: true, State: true, author: true },
        },
        buyerUser: { select: { UserID: true, Username: true } },
        messages: {
          include: { senderUser: { select: { UserID: true, Username: true } } },
          orderBy: { Createdat: "asc" },
        },
      },
    });

    if (!ticket)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Ticket nenalezen" });

    const isBuyer = ticket.buyer === userId;
    const isSeller = ticket.listing?.author === userId;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });
    }

    return res.json({ status: "SUCCESS", ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { listingId, message } = req.body;
  const userId = req.user.userId;

  if (!listingId || !message) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí listingId nebo zpráva" });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { ListingID: parseInt(listingId) },
    });
    if (!listing)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Inzerát nenalezen" });
    if (listing.State !== "active") {
      return res
        .status(400)
        .json({ status: "ERROR", reason: "Inzerát není aktivní" });
    }
    if (listing.author === userId) {
      return res
        .status(400)
        .json({ status: "ERROR", reason: "Nelze kontaktovat sebe sama" });
    }

    const existing = await prisma.ticket.findFirst({
      where: {
        subjectListing: parseInt(listingId),
        buyer: userId,
        State: "open",
      },
    });
    if (existing) {
      return res.status(409).json({
        status: "ERROR",
        reason: "Aktivní ticket pro tento inzerát již existuje",
        ticketId: existing.TicketID,
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subjectListing: parseInt(listingId),
        buyer: userId,
        messages: {
          create: { Text: message, sender: userId },
        },
      },
      include: {
        messages: true,
      },
    });

    if (listing.author) {
      await prisma.notification.create({
        data: {
          recipient: listing.author,
          ticket: ticket.TicketID,
          Text: `Nová zpráva k inzerátu "${listing.Title}"`,
          Link: `/tickets/${ticket.TicketID}`,
        },
      });
    }

    return res.status(201).json({ status: "SUCCESS", ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.post("/:id/messages", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const { message } = req.body;
  if (!message)
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí text zprávy" });

  const userId = req.user.userId;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { TicketID: id },
      include: { listing: { select: { author: true } } },
    });

    if (!ticket)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Ticket nenalezen" });

    const isBuyer = ticket.buyer === userId;
    const isSeller = ticket.listing?.author === userId;

    if (!isBuyer && !isSeller) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });
    }
    if (ticket.State === "closed") {
      return res
        .status(400)
        .json({ status: "ERROR", reason: "Ticket je uzavřen" });
    }

    const [msg] = await prisma.$transaction([
      prisma.message.create({
        data: { Text: message, sender: userId, ticket: id },
        include: { senderUser: { select: { UserID: true, Username: true } } },
      }),
      prisma.ticket.update({
        where: { TicketID: id },
        data: { Updatedat: new Date() },
      }),
    ]);

    const recipientId = isBuyer ? ticket.listing?.author : ticket.buyer;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          recipient: recipientId,
          ticket: id,
          Text: "Nová zpráva v konverzaci",
          Link: `/tickets/${id}`,
        },
      });
    }

    return res.status(201).json({ status: "SUCCESS", message: msg });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id/close", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const userId = req.user.userId;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { TicketID: id },
      include: { listing: { select: { author: true } } },
    });

    if (!ticket)
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Ticket nenalezen" });

    const isBuyer = ticket.buyer === userId;
    const isSeller = ticket.listing?.author === userId;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Přístup odepřen" });
    }
    if (ticket.State === "closed") {
      return res
        .status(400)
        .json({ status: "ERROR", reason: "Ticket je již uzavřen" });
    }

    const updated = await prisma.ticket.update({
      where: { TicketID: id },
      data: { State: "closed" },
    });

    return res.json({ status: "SUCCESS", ticket: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
