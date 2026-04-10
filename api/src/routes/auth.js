const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí povinná pole" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { Email: email, Username: username, Password: hashedPassword },
    });

    return res.status(201).json({ status: "SUCCESS", userId: user.UserID });
  } catch (err) {
    // prisma error kod pro unique constraint violation
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "ERROR",
        reason: "Email nebo uživatelské jméno již existuje",
      });
    }
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "ERROR", reason: "Chybí email nebo heslo" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { Email: email } });

    if (!user || !(await bcrypt.compare(password, user.Password))) {
      return res
        .status(401)
        .json({ status: "ERROR", reason: "Nesprávné přihlašovací údaje" });
    }

    if (user.State === "blocked") {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Účet byl zablokován" });
    }

    const token = jwt.sign(
      { userId: user.UserID, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      status: "SUCCESS",
      user: { userId: user.UserID, username: user.Username, role: user.Role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: "SUCCESS" });
});

router.get("/whoami", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { UserID: req.user.userId },
      select: {
        UserID: true,
        Username: true,
        Email: true,
        Role: true,
        State: true,
        Createdat: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "ERROR", reason: "Uživatel nenalezen" });
    }

    return res.json({ status: "SUCCESS", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "ERROR", reason: "Chyba serveru" });
  }
});

module.exports = router;
