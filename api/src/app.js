require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const listingsRoutes = require("./routes/listings");
const ticketsRoutes = require("./routes/tickets");
// const usersRoutes = require("./routes/users");
// const categoriesRoutes = require("./routes/categories");
// const ratingsRoutes = require("./routes/ratings");
// const reportsRoutes = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5500",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/tickets", ticketsRoutes);
// app.use("/api/users", usersRoutes);
// app.use("/api/categories", categoriesRoutes);
// app.use("/api/ratings", ratingsRoutes);
// app.use("/api/reports", reportsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
