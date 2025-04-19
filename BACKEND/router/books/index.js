//Imports
const { Router } = require("express");
const {
  Inventory,
  Book,
  Author,
  Rental,
  User,
  Genre,
} = require("../../schema");
const { Op, Sequelize } = require("sequelize");
const yup = require("yup");
const { default: convert } = require("url-slug");
const logger = require("../../modules/logManager");

const router = Router();

const validateBookForm = async (req, res, next) => {
  const bookForm = yup.object().shape({
    title: yup
      .string()
      .min(4, "Title must be at least 4 characters")
      .max(45, "Title must be at most 45 characters")
      .required("Title is required"),
    description: yup
      .string()
      .min(4, "Description must be at least 4 characters")
      .max(255, "Description must be at most 255 characters")
      .required("Description is required"),
    releaseDate: yup.date().notRequired(),
    cover: yup.string().notRequired(),
    ISBN: yup
      .string()
      .min(10, "ISBN must be at least 10 characters")
      .max(13, "ISBN must be at most 13 characters"),
    genreID: yup.number().required("Genre ID is required"),
    authorID: yup.number().required("Author ID is required"),
  });
  try {
    await bookForm.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                            ADMIN | GET ALL BOOK                            */
/* -------------------------------------------------------------------------- */
router.get("/", require("../../middleware/librarian"), async (req, res) => {
  const books = await Book.findAll({
    include: [
      {
        model: Author,
        attributes: ["authorID", "name"],
      },

      {
        model: Inventory,
        attributes: ["inventoryID", "status", "intake"],
      },
    ],
  });

  if (books?.length > 0) {
    const array = books?.map((book) => {
      return {
        bookID: book.bookID,
        title: book.title,
        author: book.Author?.name,
        authorID: book.Author?.authorID,
        slug: book.slug,
        releaseDate: book.releaseDate,
        ISBN: book.ISBN,
        genreID: book.genreID,
        description: book.description,
        cover: book.cover,

        inventory: book?.Inventories,
      };
    });
    return res.send(array);
  }
});

/* -------------------------------------------------------------------------- */
/*                           ANYONE | GET RANDOM BOOK                         */
/* -------------------------------------------------------------------------- */
router.get("/random", async (req, res) => {
  const book = await Book.findOne({
    order: Sequelize.literal("RAND()"),
    limit: 1,
  });

  if (!book) {
    return res.status(404).send({ error: "Book not found" });
  }

  return res.send(book);
});

/* -------------------------------------------------------------------------- */
/*                           ANYONE | GET BOOK BY ID                          */
/* -------------------------------------------------------------------------- */
router.get("/id/:id", async (req, res) => {
  const bookID = req.params.id;

  if (!bookID) {
    return res.status(400).send({ error: "Book ID is required" });
  }

  const book = await Book.findOne({
    where: {
      bookID: bookID,
    },

    include: [
      {
        model: Author,
        attributes: ["authorID", "name"],
      },
    ],
  });

  const inventory = await Inventory.findAll({
    where: {
      bookID: bookID,
    },
  });

  const object = {
    bookID: book?.bookID,
    title: book?.title,
    description: book?.description,
    releaseDate: book?.releaseDate,
    cover: book?.cover,
    ISBN: book?.ISBN,
    genreID: book?.genreID,

    author: {
      authorID: book?.Author?.authorID,
      name: book?.Author?.name,
    },

    inventory: {
      total: inventory?.length,
      available: inventory?.map((item) => {
        if (item.status === "available") {
          return item.inventoryID;
        }
      }),
    },
  };

  if (book) {
    return res.send(object);
  } else {
    return res.status(404).send({ error: "Book not found" });
  }
});

/* -------------------------------------------------------------------------- */
/*                           ANYONE | GET BOOK BY SLUG                        */
/* -------------------------------------------------------------------------- */
router.get("/slug/:id", async (req, res) => {
  const bookSlug = req.params.id;

  if (!bookSlug) {
    return res.status(400).send({ error: "Book ID is required" });
  }

  const book = await Book.findOne({
    where: {
      slug: bookSlug,
    },

    include: [
      {
        model: Author,
        attributes: ["authorID", "name"],
      },
    ],
  });

  if (!book) {
    return res.status(404).send({ error: "Book not found" });
  }

  const inventory = await Inventory.findAll({
    where: {
      bookID: book?.bookID,
    },
  });

  const object = {
    bookID: book?.bookID,
    title: book?.title,
    description: book?.description,
    releaseDate: book?.releaseDate,
    cover: book?.cover,
    ISBN: book?.ISBN,
    genreID: book?.genreID,

    author: {
      authorID: book?.Author?.authorID,
      name: book?.Author?.name,
    },

    inventory: {
      total: inventory?.length,
      available: inventory
        ?.filter((i) => i?.status == "available")
        ?.map((item) => {
          return {
            inventoryID: item?.inventoryID,
            status: item?.status,
          };
        })?.length,
      all: inventory?.map((item) => {
        return {
          inventoryID: item?.inventoryID,
          status: item?.status,
        };
      }),
    },
  };

  if (book) {
    return res.send(object);
  } else {
    return res.status(404).send({ error: "Book not found" });
  }
});

/* -------------------------------------------------------------------------- */
/*                              USER | RENT BOOK                              */
/* -------------------------------------------------------------------------- */
router.post("/:id/rent", require("../../middleware/user"), async (req, res) => {
  const { bookID } = req.body;

  const user = await User.findOne({
    where: {
      userID: req?.user?.userID,
    },
  });
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  if (!bookID) {
    return res.status(400).send({ error: "Book ID is required" });
  }

  const rentalCount = await Rental.count({
    where: {
      userID: user?.userID,
      status: {
        [Op.not]: "ended",
      },
    },
  });

  if (rentalCount >= parseInt(process.env.APP_RENTAL_LIMIT)) {
    return res.status(422).send({
      error: `You have reached the maximum rental limit of ${process.env.APP_RENTAL_LIMIT} books`,
    });
  }

  const inventory = await Inventory.findOne({
    where: {
      bookID: bookID,
      status: "available",
    },
  });

  if (!inventory) {
    return res.status(404).send({ error: "Book not available" });
  }

  const rental = await Rental.create({
    userID: user?.userID,
    inventoryID: inventory?.inventoryID,
    status: "pickup",
    rentalStart: new Date(),
    rentalEnd: new Date(
      new Date().setDate(
        new Date().getDate() + parseInt(process.env.APP_RENTAL_PERIOD)
      )
    ),
  });

  if (rental) {
    inventory.update({
      status: "pending",
    });
    logger.log("rent", `New rental: ${rental.rentalID} by ${user.email}`);
    return res.send({ rentalID: rental.rentalID });
  } else {
    return res.status(500).send({ error: "Rental failed" });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ADMIN | POST RENT FOR USER                         */
/* -------------------------------------------------------------------------- */
router.post(
  "/rent",
  require("../../middleware/librarian"),
  async (req, res) => {
    const { bookID, userID } = req.body;

    if (!bookID) {
      return res.status(400).send({ error: "Book ID is required" });
    }

    if (!userID) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const user = await User.findOne({
      where: {
        userID: userID,
      },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const inventory = await Inventory.findOne({
      where: {
        bookID: bookID,
        status: "available",
      },
    });

    if (!inventory) {
      return res.status(404).send({ error: "Book not available" });
    }

    const rental = await Rental.create({
      userID: user?.userID,
      inventoryID: inventory?.inventoryID,
      status: "active",
      rentalStart: new Date(),
      rentalEnd: new Date(
        new Date().setDate(new Date().getDate() + process.env.APP_RENTAL_PERIOD)
      ),
    });

    if (rental) {
      inventory.update({
        status: "rented",
      });
      logger.log(
        "rent",
        `New rental: ${rental.rentalID} by ${req?.user?.email} for ${user?.email}`
      );
      return res.send({ rentalID: rental.rentalID });
    } else {
      return res.status(500).send({ error: "Rental failed" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                          ADMIN | POST CREATE BOOK                          */
/* -------------------------------------------------------------------------- */
router.post(
  "/",
  require("../../middleware/librarian"),
  validateBookForm,
  async (req, res) => {
    const { title, description, releaseDate, cover, ISBN, genreID, authorID } =
      req.body;

    const slug = convert(title);

    const genre = await Genre.findOne({
      where: {
        genreID: genreID,
      },
    });

    if (!genre) {
      return res.status(404).send({ error: "Genre not found" });
    }

    const [book, created] = await Book.findOrCreate({
      where: {
        slug: slug,
      },
      defaults: {
        slug: slug,
        title: title,
        description: description,
        releaseDate: releaseDate,
        cover: cover,
        ISBN: ISBN,
        genreID: genre?.genreID,
        authorID: authorID,
      },
    });

    if (created) {
      logger.log(
        "inventory",
        `New book: ${book?.title} by ${req?.user?.email}`
      );
      return res.send({ bookID: book?.bookID });
    } else {
      return res.status(500).send({ error: "Book creation failed" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                          ADMIN | PUT UPDATE BOOK                           */
/* -------------------------------------------------------------------------- */
router.put(
  "/id/:id",
  require("../../middleware/librarian"),
  validateBookForm,
  async (req, res) => {
    const bookID = req.params.id;

    if (!bookID) {
      return res.status(400).send({ error: "Book ID is required" });
    }

    const book = await Book.findOne({
      where: {
        bookID: bookID,
      },
    });

    if (!book) {
      return res.status(404).send({ error: "Book not found" });
    }

    const { title, description, releaseDate, cover, ISBN, genreID, authorID } =
      req.body;

    if (title) {
      book.title = title;
    }

    if (description) {
      book.description = description;
    }

    if (releaseDate) {
      book.releaseDate = releaseDate;
    }

    if (cover) {
      book.cover = cover;
    }

    if (ISBN) {
      book.ISBN = ISBN;
    }

    if (genreID) {
      book.genreID = genreID;
    }

    if (authorID) {
      book.authorID = authorID;
    }

    if (book) {
      book.save();
      logger.log(
        "inventory",
        `Updated book: ${book?.title} by ${req?.user?.email}`
      );
      return res.send({ bookID: book.bookID });
    } else {
      return res.status(500).send({ error: "Book update failed" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                          ADMIN | POST ADD NEW INVENOTRY                    */
/* -------------------------------------------------------------------------- */
router.post(
  "/inventory",
  require("../../middleware/librarian"),
  async (req, res) => {
    const { bookID, status } = req.body;

    if (!bookID) {
      return res.status(400).send({ error: "Book ID is required" });
    }

    if (!status) {
      return res.status(400).send({ error: "Status is required" });
    }
    const book = await Book?.findOne({
      where: {
        bookID: bookID,
      },
    });

    if (!book) {
      return res.status(404).send({ error: "Book not found" });
    }

    const inventory = await Inventory.create({
      bookID: book?.bookID,
      status: status,
    });

    if (inventory) {
      logger.log(
        "inventory",
        `New inventory for a book ${book?.title} by ${req?.user?.email}`
      );
      return res.send({ inventoryID: inventory.inventoryID });
    } else {
      return res.status(500).send({ error: "Inventory creation failed" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                          ADMIN | PUT UPDATE INVENTORY                      */
/* -------------------------------------------------------------------------- */

router.put(
  "/inventory/:id",
  require("../../middleware/librarian"),
  async (req, res) => {
    const inventoryID = req.params.id;

    if (!inventoryID) {
      return res.status(400).send({ error: "Inventory ID is required" });
    }

    const inventory = await Inventory.findOne({
      where: {
        inventoryID: inventoryID,
      },
    });

    if (!inventory) {
      return res.status(404).send({ error: "Inventory not found" });
    }

    const { status } = req.body;

    if (status) {
      inventory.status = status;
    }

    inventory.save();
    logger.log(
      "inventory",
      `Updated inventory: ${inventory?.inventoryID} by ${req?.user?.email}`
    );
    return res.send({ status: "Success" });
  }
);

module.exports = router;
