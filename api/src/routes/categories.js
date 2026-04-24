const express = require("express");
const prisma = require("../lib/prisma");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentCategory: null },
      include: {
        subcategories: {
          include: { subcategories: true },
        },
      },
      orderBy: { Name: "asc" },
    });

    return res.json({ status: "SUCCESS", categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/flat", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { Name: "asc" },
    });
    return res.json({ status: "SUCCESS", categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.get("/allSubCategories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const categories = await prisma.getAllSubcategories(id);

    return res.json({ status: "SUCCESS", categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, parentId } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí název kategorie" });

  try {
    const category = await prisma.category.create({
      data: {
        Name: name,
        parentCategory: parentId ? parseInt(parentId) : null,
      },
    });
    return res.status(201).json({ status: "SUCCESS", category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  const { name, parentId } = req.body;

  try {
    const category = await prisma.category.update({
      where: { CategoryID: id },
      data: {
        ...(name && { Name: name }),
        ...(parentId !== undefined && {
          parentCategory: parentId ? parseInt(parentId) : null,
        }),
      },
    });
    return res.json({ status: "SUCCESS", category });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Kategorie nenalezena" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ status: "ERROR", reason: "Neplatné ID" });

  try {
    const [childCount, listingCount] = await Promise.all([
      prisma.category.count({ where: { parentCategory: id } }),
      prisma.listing.count({ where: { belongsTo: id } }),
    ]);

    if (childCount > 0)
      return res.status(409).json({
        status: "ERROR",
        reason: `Kategorie má ${childCount} podkategori${childCount === 1 ? "i" : "í"} - nejdřív je smažte`,
      });

    if (listingCount > 0)
      return res.status(409).json({
        status: "ERROR",
        reason: `Kategorie obsahuje ${listingCount} inzerát${listingCount === 1 ? "" : listingCount < 5 ? "y" : "ů"} - nelze smazat`,
      });

    await prisma.category.delete({ where: { CategoryID: id } });
    return res.json({ status: "SUCCESS" });
  } catch (err) {
    if (err.code === "P2025")
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Kategorie nenalezena" });
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
