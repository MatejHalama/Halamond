const { PrismaClient } = require("../../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter }).$extends({
  name: "isBuyer",
  client: {
    async isBuyer(listingId, userId) {
      const [result] =
        await prisma.$queryRaw`SELECT is_buyer(${listingId}::integer, ${userId}::integer)`;
      return result.is_buyer;
    },
    async isBlocked(userId) {
      const [result] =
        await prisma.$queryRaw`SELECT is_blocked(${userId}::integer)`;
      return result.is_blocked;
    },
    async getAllSubcategories(categoryId) {
      return prisma.$queryRaw`SELECT * FROM get_all_subcategories(${categoryId}::integer)`;
    },
  },
});

module.exports = prisma;
