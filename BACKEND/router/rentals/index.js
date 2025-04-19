//Imports
const { Router } = require("express");
const { Book, Author, Rental, Inventory, User } = require("../../schema");
const { Op } = require("sequelize");

const router = Router();

/* -------------------------------------------------------------------------- */
/*                            ADMIN | GET ALL RENTAL                          */
/* -------------------------------------------------------------------------- */
router.get("/", require("../../middleware/librarian"), async (req, res) => {
  const rentals = await Rental.findAll({
    where: {
      /*       [Op.not]: {
        status: "ended",
      }, */
    },
    include: [
      {
        model: User,
        attributes: ["userID", "name", "email"],
      },
      {
        model: Inventory,
        include: [
          {
            model: Book,
            include: [
              {
                model: Author,
                attributes: ["name"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (rentals?.length > 0) {
    const array = rentals?.map((rental) => {
      return {
        rentalID: rental.rentalID,
        status: rental.status,
        rentalStart: rental.rentalStart,
        rentalEnd: rental.rentalEnd,
        user: {
          userID: rental.User?.userID,
          name: rental.User?.name,
          email: rental.User?.email,
        },
        inventoryID: rental?.inventoryID,
        book: {
          bookID: rental?.Inventory?.Book?.bookID,
          title: rental?.Inventory?.Book?.title,
          slug: rental?.Inventory?.Book?.slug,
        },
      };
    });
    return res.send(array);
  } else {
    return res.send([]);
  }
});

/* -------------------------------------------------------------------------- */
/*                            USER | GET MY RENTALS                           */
/* -------------------------------------------------------------------------- */
router.get("/my", require("../../middleware/user"), async (req, res) => {
  const rentals = await Rental.findAll({
    where: {
      userID: req?.user?.userID,
      status: {
        [Op.not]: "ended",
      },
    },

    include: [
      {
        model: Inventory,
        include: [
          {
            model: Book,
            attributes: ["bookID", "title", "slug", "cover"],
          },
        ],
      },
    ],
  });

  if (rentals?.length > 0) {
    const array = rentals?.map((rental) => {
      return {
        inventoryID: rental.inventoryID,
        rentalID: rental.rentalID,
        status: rental.status,
        rentalStart: rental.rentalStart,
        rentalEnd: rental.rentalEnd,
        book: {
          bookID: rental?.Inventory?.Book?.bookID,
          title: rental?.Inventory?.Book?.title,
          slug: rental?.Inventory?.Book?.slug,
          cover: rental?.Inventory?.Book?.cover,
        },
      };
    });
    return res.send({
      list: array,
      limit: parseInt(process.env.APP_RENTAL_LIMIT),
    });
  } else {
    return res.send({
      list: [],
      limit: parseInt(process.env.APP_RENTAL_LIMIT),
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                          USER | POST EXTEND RENTAL                         */
/* -------------------------------------------------------------------------- */
router.post(
  "/:id/extend",
  require("../../middleware/user"),
  async (req, res) => {
    const rentalID = req.params.id;
    const rental = await Rental.findOne({
      where: {
        rentalID: rentalID,
      },
    });

    if (!rental) {
      return res.status(404).send({ error: "Rental not found" });
    }

    if (rental.userID !== req?.user?.userID) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    if (rental.status !== "active") {
      return res.status(400).send({ error: "Rental cannot be extended" });
    }

    const newEnd = new Date(rental.rentalEnd);
    newEnd.setDate(newEnd.getDate() + 7);

    rental.rentalEnd = newEnd;
    await rental.save();

    return res.send({
      rentalID: rental.rentalID,
      status: rental.status,
      rentalStart: rental.rentalStart,
      rentalEnd: rental.rentalEnd,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                    ADMIN | GET LIST ALL OVERDUE RENTALS                    */
/* -------------------------------------------------------------------------- */
router.get("/task", require("../../middleware/librarian"), async (req, res) => {
  const rentals = await Rental.findAll({
    where: {
      [Op.or]: [
        {
          status: "late",
        },
        {
          status: "missing",
        },
        {
          status: "pickup",
        },
      ],
    },

    include: [
      {
        model: User,
        attributes: ["userID", "name", "email"],
      },

      {
        model: Inventory,
        include: [
          {
            model: Book,
            attributes: ["bookID", "title", "slug"],
          },
        ],
      },
    ],
  });

  if (rentals?.length > 0) {
    const array = rentals?.map((rental) => {
      return {
        rentalID: rental.rentalID,
        status: rental.status,
        rentalStart: rental.rentalStart,
        rentalEnd: rental.rentalEnd,
        user: {
          userID: rental.User?.userID,
          name: rental.User?.name,
          email: rental.User?.email,
        },
        book: {
          bookID: rental?.Inventory?.Book?.bookID,
          title: rental?.Inventory?.Book?.title,
          slug: rental?.Inventory?.Book?.slug,
        },
      };
    });
    return res.send(array);
  } else {
    return res.send([]);
  }
});

/* -------------------------------------------------------------------------- */
/*                      ADMIN | PUT UPDATE RENTAL STATUS                      */
/* -------------------------------------------------------------------------- */
router.put(
  "/:id/mark",
  require("../../middleware/librarian"),
  async (req, res) => {
    const rentalID = req.params.id;
    const { status } = req.body;
    const statusList = ["active", "ended", "missing", "late", "pickup"];
    if (!status) {
      return res.status(400).send({ error: "Status is required" });
    }

    if (!statusList.includes(status)) {
      return res.status(400).send({ error: "Invalid status" });
    }

    const rental = await Rental.findOne({
      where: {
        rentalID: rentalID,
      },
    });

    if (!rental) {
      return res.status(404).send({ error: "Rental not found" });
    }

    rental.status = status;

    if (status === "ended") {
      rental.rentalEnd = new Date();
    }

    await rental.save();

    switch (status) {
      case "ended":
        await Inventory.update(
          {
            status: "available",
          },
          {
            where: {
              inventoryID: rental.inventoryID,
            },
          }
        );

        break;

      case "missing":
        await Inventory.update(
          {
            status: "missing",
          },
          {
            where: {
              inventoryID: rental.inventoryID,
            },
          }
        );

        break;

      case "late":
        await Inventory.update(
          {
            status: "pending",
          },
          {
            where: {
              inventoryID: rental.inventoryID,
            },
          }
        );

        break;
      default:
        break;
    }
    return res.send({
      rentalID: rental.rentalID,
      status: rental.status,
      rentalStart: rental.rentalStart,
      rentalEnd: rental.rentalEnd,
    });
  }
);

module.exports = router;
