//Imports
const { Router } = require("express");
const { Inventory, Book, Author } = require("../../schema");
const { Op, Sequelize } = require("sequelize");
const yup = require("yup");
const logger = require("../../modules/logManager");

const router = Router();

const validateAuthorForm = async (req, res, next) => {
  const authorForm = yup.object().shape({
    name: yup
      .string()
      .min(4, "Name must be at least 4 characters")
      .max(100, "Name must be at most 100 characters")
      .required("Name is required"),
    photo: yup.string().max(255, "Photo must be at most 255 characters"),
    birthDate: yup.date().required("Birth date is required"),
    deathDate: yup.date().nullable(),
  });
  try {
    await authorForm.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                          ANYONE | GET AUTHOR BY ID                         */
/* -------------------------------------------------------------------------- */
router.get("/id/:id", async (req, res) => {
  const authorID = req.params.id;

  if (!authorID) {
    return res.status(400).send({ error: "Author ID is required" });
  }

  const author = await Author.findOne({
    where: {
      authorID: authorID,
    },
    include: [
      {
        model: Book,
        attributes: ["bookID", "title", "releaseDate", "slug"],
      },
    ],
  });
  const object = {
    authorID: author?.authorID,
    name: author?.name,
    birthDate: author?.birthDate,
    deathDate: author?.deathDate,
    photo: author?.photo,
    books: author?.Books.map((book) => {
      return {
        bookID: book?.bookID,
        slug: book?.slug,
        title: book?.title,
        releaseDate: book?.releaseDate,
      };
    }),
  };

  if (author) {
    return res.send(object);
  } else {
    return res.status(404).send({ error: "Author not found" });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ANYONE | GET RANDOM AUTHOR                         */
/* -------------------------------------------------------------------------- */
router.get("/random", async (req, res) => {
  const author = await Author.findOne({
    order: Sequelize.literal("RAND()"),
    limit: 1,
    include: [
      {
        model: Book,
        attributes: ["bookID", "title", "releaseDate", "slug"],
      },
    ],
  });
  const object = {
    authorID: author?.authorID,
    name: author?.name,
    birthDate: author?.birthDate,
    deathDate: author?.deathDate,
    photo: author?.photo,
    books: author?.Books.map((book) => {
      return {
        bookID: book?.bookID,
        slug: book?.slug,
        title: book?.title,
        releaseDate: book?.releaseDate,
      };
    }),
  };

  if (author) {
    return res.send(object);
  } else {
    return res.status(404).send({ error: "Author not found" });
  }
});

/* -------------------------------------------------------------------------- */
/*                     ANYONE | GET TOP AUTHORS BY RENTALS                    */
/* -------------------------------------------------------------------------- */
router.get("/top", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const authors = await Author.findAll({
    include: [
      {
        model: Book,
        include: [
          {
            model: Inventory,
            where: {
              status: 0,
            },
          },
        ],
      },
    ],
  });

  const object = authors
    .map((author) => {
      return {
        authorID: author.authorID,
        name: author.name,
        rentals: author.Books.reduce((acc, book) => {
          return acc + book.Inventories.length;
        }, 0),
      };
    })
    .sort((a, b) => b.rentals - a.rentals)
    .slice(0, limit);

  return res.send(object);
});

/* -------------------------------------------------------------------------- */
/*                         ADMIN | POST CREATE AUTHOR                         */
/* -------------------------------------------------------------------------- */
router.post(
  "/",
  require("../../middleware/librarian"),
  validateAuthorForm,
  async (req, res) => {
    const { name, photo, birthDate, deathDate } = req.body;

    const author = await Author.create({
      name,
      photo,
      birthDate,
      deathDate,
    });

    author.save();

    logger.log(
      "db",
      `New author created: ${author.name} by ${req?.user?.email}`
    );

    return res.send({
      status: "Success",
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                         ADMIN | PUT UPDATE AUTHOR                          */
/* -------------------------------------------------------------------------- */

router.put(
  "/id/:id",
  require("../../middleware/librarian"),
  validateAuthorForm,
  async (req, res) => {
    const authorID = req.params.id;

    if (!authorID) {
      return res.status(400).send({ error: "Author ID is required" });
    }

    const author = await Author.findOne({
      where: {
        authorID: authorID,
      },
    });

    if (!author) {
      return res.status(404).send({ error: "Author not found" });
    }

    const { name, photo, birthDate, deathDate } = req.body;

    if (name) {
      author.name = name;
    }

    if (photo) {
      author.photo = photo;
    }

    if (birthDate) {
      author.birthDate = birthDate;
    }

    if (deathDate) {
      author.deathDate = deathDate;
    }

    await author.save();

    logger.log("db", `Author updated: ${author.name} by ${req?.user?.email}`);
    return res.send({
      status: "Success",
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                         ADMIN | GET ALL AUTHORS                            */
/* -------------------------------------------------------------------------- */
router.get("/", require("../../middleware/librarian"), async (req, res) => {
  const authors = await Author.findAll({
    order: [["name", "ASC"]],
  });

  const object = authors.map((author) => {
    return {
      authorID: author.authorID,
      name: author.name,
      photo: author.photo,
      birthDate: author.birthDate,
      deathDate: author.deathDate,
    };
  });

  return res.send(object);
});

/* -------------------------------------------------------------------------- */
/*                         ADMIN | DELETE AUTHOR                              */
/* -------------------------------------------------------------------------- */

router.delete(
  "/id/:id",
  require("../../middleware/librarian"),
  async (req, res) => {
    const authorID = req.params.id;

    if (!authorID) {
      return res.status(400).send({ error: "Author ID is required" });
    }

    const author = await Author.findOne({
      where: {
        authorID: authorID,
      },
    });

    if (!author) {
      return res.status(404).send({ error: "Author not found" });
    }

    await author.destroy();

    logger.log("db", `Author deleted: ${author.name} by ${req?.user?.email}`);
    return res.send({
      status: "Success",
    });
  }
);
module.exports = router;
