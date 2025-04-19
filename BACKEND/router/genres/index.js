//Imports
const { Router } = require("express");
const { Genre } = require("../../schema");

const router = Router();

/* -------------------------------------------------------------------------- */
/*                                  GET GENRE                                 */
/* -------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  const genres = await Genre.findAll({
    attributes: ["genreID", "name"],
  });

  if (!genres) {
    return res.status(400).send({ error: "Genres not found" });
  }

  return res.send(genres);
});

module.exports = router;
