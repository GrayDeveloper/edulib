const cron = require("node-cron");
const { User, Rental, Inventory, Book } = require("../schema");
const { Op } = require("sequelize");
const logger = require("./logManager");

const rentalCheck = cron.schedule("0 * * * *", async () => {
  const rentals = await Rental.findAll({
    where: {
      status: "active",
      rentalEnd: {
        [Op.lt]: new Date(),
      },
    },

    include: [
      {
        model: Inventory,
        attributes: ["inventoryID"],
      },
    ],
  });

  rentals?.map(async (rental) => {
    await Rental.update(
      {
        status: "late",
      },
      {
        where: {
          rentalID: rental.rentalID,
        },
      }
    );

    await Inventory.update(
      {
        status: "rented",
      },
      {
        where: {
          inventoryID: rental.Inventory.inventoryID,
        },
      }
    );
  });

  if (rentals?.length > 0) {
    logger.cron(`${rentals.length} rentals expired, updated to late`);
  }
});

rentalCheck.now();
rentalCheck.start();
