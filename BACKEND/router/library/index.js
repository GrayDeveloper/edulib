//Imports
const { Router } = require("express");
const {
  Book,
  Rental,
  User,
  Inventory,
  Author,
  sequelize,
} = require("../../schema");
const { Op } = require("sequelize");
const logger = require("../../modules/logManager");

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

/* -------------------------------------------------------------------------- */
/*                       ADMIN | DOWNLOAD BACKUP                              */
/* -------------------------------------------------------------------------- */
router.post("/backup", require("../../middleware/admin"), async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).send({ error: "Key is required" });
  }

  if (key !== process.env.APP_BACKUP_KEY) {
    return res.status(400).send({ error: "Key is invalid" });
  }

  try {
    const data = await Promise.all(
      Object.entries(sequelize.models).map(async ([name, model]) => {
        const rows = await model.findAll();
        return { [name]: rows.map((r) => r.toJSON()) };
      })
    );

    const result = Object.assign({}, ...data);

    res.setHeader("Content-Disposition", "attachment; filename=db-dump.json");
    res.setHeader("Content-Type", "application/json");
    res.json(result);

    logger.log("db", "Database backup downloaded by: " + req.user?.email);
  } catch (error) {
    res.status(500).json({ error: "Failed to create backup" });
  }
});

/* -------------------------------------------------------------------------- */
/*                       ADMIN | UPLOAD BACKUP                                */
/* -------------------------------------------------------------------------- */

router.post("/restore", require("../../middleware/admin"), async (req, res) => {
  if (!key) {
    return res.status(400).send({ error: "Key is required" });
  }

  if (key !== process.env.APP_BACKUP_KEY) {
    return res.status(400).send({ error: "Key is invalid" });
  }

  if (!req.body) {
    return res.status(400).send({ error: "No data provided" });
  }

  try {
    const data = req.body;

    await sequelize.transaction(async (transaction) => {
      for (const [modelName, rows] of Object.entries(data)) {
        const model = sequelize.models[modelName];
        if (model) {
          await model.destroy({ where: {}, transaction });
          await model.bulkCreate(rows, { transaction });
        }
      }
    });

    res.status(200).json({ message: "Database restored successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to restore database" });
  }
});
module.exports = router;
