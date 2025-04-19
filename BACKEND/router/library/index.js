//Imports
const { Router } = require("express");
const { Book, Rental, User, Inventory, Author } = require("../../schema");
const { Op } = require("sequelize");

const router = Router();

/* -------------------------------------------------------------------------- */
/*                             ANYONE | GET SEARCH                            */
/* -------------------------------------------------------------------------- */
router.get("/search", async (req, res) => {
  const { term, genreID } = req.query;

  if (!term) {
    return res.status(400).send({ error: "Search term is required" });
  }

  const books = await Book.findAll({
    where: {
      genreID: genreID ? genreID : { [Op.ne]: null },
      [Op.or]: [
        {
          title: {
            [Op.substring]: term,
          },
        },
        {
          "$Author.name$": {
            [Op.substring]: term,
          },
        },
        {
          ISBN: {
            [Op.substring]: term,
          },
        },
      ],
    },

    limit: 16,
    include: [
      {
        model: Author,
        attributes: ["name"],
      },
    ],
  });

  const array = books?.map((book) => {
    return {
      bookID: book.bookID,
      title: book.title,
      slug: book.slug,
      author: book.Author?.name,
    };
  });
  return res.send(array);
});

/* -------------------------------------------------------------------------- */
/*                       ADMIN | GET LIBRARY STATISTICS                       */
/* -------------------------------------------------------------------------- */
router.get(
  "/stats",
  require("../../middleware/librarian"),
  async (req, res) => {
    const inventory = await Inventory.findAll();
    const totalBooks = inventory?.length;
    const availableBooks = inventory?.filter(
      (book) => book.status != "rented" || book.status != "missing"
    ).length;
    const unavailableBooks = inventory?.filter(
      (book) => book.status == "rented" || book.status == "missing"
    ).length;

    const users = await User.findAll();
    const totalUsers = users?.length;

    const rentals = await Rental.findAll();
    const totalRentals = rentals?.length;
    const activeRentals = rentals?.filter(
      (rental) => rental.status == "active"
    ).length;

    return res.send({
      totalBooks,
      availableBooks,
      unavailableBooks,
      totalUsers,
      totalRentals,
      activeRentals,
    });
  }
);

module.exports = router;
