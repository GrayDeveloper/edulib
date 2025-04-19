//Imports
const { Router } = require("express");
const { User, Rental } = require("../../schema");

const router = Router();

/* -------------------------------------------------------------------------- */
/*                                  ADMIN | GET ALL USERS                     */
/* -------------------------------------------------------------------------- */
router.get("/", require("../../middleware/librarian"), async (req, res) => {
  const users = await User.findAll();

  if (!users) {
    return res.status(404).send({ error: "No users found" });
  }
  const array = users?.map((user) => {
    return {
      userID: user.userID,
      permission: user.permission,
      name: user.name,
      email: user.email,
      pfp: user.pfp,
      status: user.status,
    };
  });

  return res.send(array);
});

/* -------------------------------------------------------------------------- */
/*                                  GET USER                                  */
/* -------------------------------------------------------------------------- */
router.get("/me", require("../../middleware/user"), async (req, res) => {
  const user = await User.findOne({
    where: {
      userID: req?.user?.userID,
    },
  });

  const { userID, permission, name, email, pfp, createdAt } = user;
  return res.send({
    userID,
    permission,
    name,
    email,
    pfp,
    createdAt,
  });
});

/* -------------------------------------------------------------------------- */
/*                           ADMIN | GET USER BY ID                           */
/* -------------------------------------------------------------------------- */
router.get(
  "/id/:id",
  require("../../middleware/librarian"),
  async (req, res) => {
    const userID = req.params.id;

    if (!userID) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const user = await User.findOne({
      where: {
        userID: userID,
      },
    });

    const rentals = await Rental.findAll({
      where: {
        userID: userID,
      },
    });

    if (user) {
      return res.send({
        user: {
          userID: user.userID,
          permission: user.permission,
          name: user.name,
          email: user.email,
          pfp: user.pfp,
          status: user.status,
        },
        rentals: rentals,
      });
    } else {
      return res.status(404).send({ error: "User not found" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                           ADMIN | UPDATE USER INFO                         */
/* -------------------------------------------------------------------------- */
router.put(
  "/id/:id",
  require("../../middleware/librarian"),
  async (req, res) => {
    const userID = req.params.id;

    if (!userID) {
      return res.status(400).send({ error: "User ID is required" });
    }

    if (!req.body) {
      return res.status(400).send({ error: "No fields to update" });
    }

    const user = await User.findOne({
      where: {
        userID: userID,
      },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.permission > 1) {
      return res.status(403).send({ error: "Cannot update an admin" });
    }

    const { name, email, permission, status } = req.body;

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    if (permission) {
      user.permission = permission;
    }

    if (req.body.status) {
      user.status = req.body.status;
    }

    await user.save();

    return res.send({
      status: "Success",
    });
  }
);

module.exports = router;
