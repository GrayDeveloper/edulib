//Imports
const { Router } = require("express");
const { Inventory, Book, Author } = require("../../schema");

const router = Router();

/* -------------------------------------------------------------------------- */
/*                           ADMIN | GET ALL INVENTORY                        */
/* -------------------------------------------------------------------------- */
router.get("/", require("../../middleware/librarian"), async (req, res) => {
  const inventories = await Inventory.findAll({
    include: [
      {
        model: Book,
        attributes: ["slug", "title", "bookID"],
        include: [
          {
            model: Author,
            attributes: ["name"],
          },
        ],
      },
    ],
  });
  return res.send(
    inventories?.map((i) => {
      return {
        inventoryID: i.inventoryID,
        size: i.size,
        status: i.status,
        book: {
          author: i.Book.Author.name,
          title: i.Book.title,
          slug: i.Book.slug,
          bookID: i.Book.bookID,
        },
      };
    })
  );
});

/* -------------------------------------------------------------------------- */
/*                           ADMIN | NEW INVENTORY                            */
/* -------------------------------------------------------------------------- */

router.post("/", require("../../middleware/librarian"), async (req, res) => {
  const { status, bookID } = req.body;
  if (!status || !bookID) {
    return res.status(400).send({ status: "Status and bookID are required." });
  }

  try {
    const inventory = await Inventory.create({
      bookID: bookID,
      status: status,
      intake: new Date(),
      size: "medium",
    });
    return res.send(inventory);
  } catch (error) {
    return res.status(500).send({ status: "Error creating inventory." });
  }
});

/* -------------------------------------------------------------------------- */
/*                           ADMIN | UPDATE INVENTORY STATUS                  */
/* -------------------------------------------------------------------------- */

router.put("/", require("../../middleware/librarian"), async (req, res) => {
  const { inventoryID, status } = req.body;
  if (!inventoryID || !status) {
    return res
      .status(400)
      .send({ status: "Status and inventoryID are required." });
  }
  const inventory = await Inventory.findOne({
    where: {
      inventoryID,
    },
  });
  if (!inventory) {
    return res.status(404).send("Inventory not found.");
  }

  try {
    await Inventory.update(
      {
        status,
        intake: new Date(),
      },
      {
        where: {
          inventoryID,
        },
      }
    );
    return res.send({ status: "Inventory status updated." });
  } catch (error) {
    return res.status(500).send({ status: "Error creating inventory." });
  }
});

module.exports = router;
