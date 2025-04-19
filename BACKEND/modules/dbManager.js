const { sequelize } = require("../schema");
const { User, Genre, Author, Book, Inventory } = require("../schema");
const { default: convert } = require("url-slug");

const logger = require("./logManager");

sequelize
  .authenticate()
  .then(() => logger.log("db", "Database connection established."))
  .catch((error) => logger.log("error", `Database connection error: ${error}`));

sequelize
  .sync({
    force: process.env.SERVER_DEV_MODE ? process.env.SERVER_DEV_MODE : false,
    alter: true,
  })
  .then(() => {
    if (process.env.SERVER_DEV_MODE) {
      logger.log(
        "db",
        "Database synchronized in development mode. All data has been wiped!"
      );
    } else {
      logger.log("db", "Database synchronized in production mode.");

      User.count().then((count) => {
        if (count === 0) {
          logger.log("user", `No users found. Creating admin user...`);
          User.create({
            email: process.env.ADMIN_EMAIL,
            password: "x",
            permission: 10,
            name: process.env.ADMIN_NAME,
          })
            .then((u) => {
              u.createPassword(process.env.ADMIN_PASSWORD);
              logger.log(
                "user",
                `Admin user created with email: ${process.env.ADMIN_EMAIL}`
              );
            })
            .catch((error) =>
              logger.log("error", `Error creating admin user: ${error}`)
            );

          loadExampleData();
        }
      });
    }
  })
  .catch((error) =>
    logger.log("error", `Database synchronization error: ${error}`)
  );

const loadExampleData = async () => {
  Genre.bulkCreate([
    {
      genreID: 1,
      name: "Klasszikus",
    },
    {
      genreID: 2,
      name: "Kortárs",
    },
    {
      genreID: 3,
      name: "Tudományos",
    },
    {
      genreID: 4,
      name: "Utazás",
    },
    {
      genreID: 5,
      name: "Mesék",
    },
    {
      genreID: 6,
      name: "Vallás",
    },
    {
      genreID: 7,
      name: "Tankönyvek",
    },
  ]).then(() => logger.log("db", `Default genres loaded.`));

  Author.bulkCreate([
    {
      authorID: 1,
      name: "Petőfi Sándor",
      birthDate: "1823.01.01",
      deathDate: "1849.07.31",
    },
    {
      authorID: 2,
      name: "Arany János",
      birthDate: "1817.03.02",
      deathDate: "1882.10.22",
    },
    {
      authorID: 3,
      name: "József Attila",
      birthDate: "1905.04.11",
      deathDate: "1937.12.03",
    },
    {
      authorID: 4,
      name: "Ady Endre",
      birthDate: "1877.11.22",
      deathDate: "1919.01.27",
    },
    {
      authorID: 5,
      name: "Radnóti Miklós",
      birthDate: "1909.05.05",
      deathDate: "1944.11.09",
    },
    {
      authorID: 6,
      name: "Móricz Zsigmond",
      birthDate: "1879.06.29",
      deathDate: "1942.09.05",
    },
    {
      authorID: 7,
      name: "Móra Ferenc",
      birthDate: "1879.07.19",
      deathDate: "1934.02.08",
    },
    {
      authorID: 8,
      name: "Gárdonyi Géza",
      birthDate: "1863.08.03",
      deathDate: "1922.10.30",
    },
    {
      authorID: 9,
      name: "Mikszáth Kálmán",
      birthDate: "1847.01.16",
      deathDate: "1910.05.28",
    },
    {
      authorID: 10,
      name: "Karinthy Frigyes",
      birthDate: "1887.06.25",
      deathDate: "1938.08.29",
    },
    {
      authorID: 11,
      name: "Weöres Sándor",
      birthDate: "1913.06.22",
      deathDate: "1989.01.22",
    },
    {
      authorID: 12,
      name: "Kosztolányi Dezső",
      birthDate: "1885.03.29",
      deathDate: "1936.11.03",
    },
    {
      authorID: 13,
      name: "Babits Mihály",
      birthDate: "1883.11.26",
      deathDate: "1941.08.04",
    },
    {
      authorID: 14,
      name: "Szabó Magda",
      birthDate: "1917.10.05",
      deathDate: "2007.11.19",
    },
    {
      authorID: 15,
      name: "Lázár Ervin",
      birthDate: "1936.05.05",
      deathDate: "2006.12.22",
    },
  ]).then(() => logger.log("db", `Default authors loaded.`));

  const books = [
    {
      authorID: 1,
      title: "János vitéz",
      description:
        "Elbeszélő költemény, Petőfi legismertebb mesés kalandregénye versformában.",
      releaseDate: "1845.01.01",
      genreID: 1,
    },
    {
      authorID: 2,
      title: "Toldi",
      description: "Elbeszélő költemény egy parasztfiú hőssé válásáról.",
      releaseDate: "1846.01.01",
      genreID: 1,
    },
    {
      authorID: 2,
      title: "Toldi estéje",
      description:
        "A hős Toldi életének utolsó szakaszát bemutató verses elbeszélés.",
      releaseDate: "1848.01.01",
      genreID: 1,
    },
    {
      authorID: 3,
      title: "József Attila összes versei",
      description: "József Attila életműve verseskötetbe rendezve.",
      releaseDate: "1944.01.01",
      genreID: 1,
    },
    {
      authorID: 4,
      title: "Új versek",
      description: "A magyar modern költészet indulását jelölő verseskötet.",
      releaseDate: "1906.01.01",
      genreID: 1,
    },
    {
      authorID: 5,
      title: "Radnóti Miklós összes versei és versfordításai",
      description: "Radnóti életműve verseskötet formájában.",
      releaseDate: "1948.01.01",
      genreID: 1,
    },
    {
      authorID: 6,
      title: "Légy jó mindhalálig",
      description: "Egy nyírségi diák küzdelmes, tiszta életének története.",
      releaseDate: "1920.01.01",
      genreID: 1,
    },
    {
      authorID: 6,
      title: "Rokonok",
      description: "Egy kisvárosi ügyész a korrupció hálójában.",
      releaseDate: "1930.01.01",
      genreID: 1,
    },
    {
      authorID: 7,
      title: "Kincskereső kisködmön",
      description: "Gyermekregény a szegénységről, becsületről és reményről.",
      releaseDate: "1918.01.01",
      genreID: 5,
    },
    {
      authorID: 8,
      title: "Egri csillagok",
      description:
        "A törökellenes harc hőseinek regénye Gárdonyi Géza tollából.",
      releaseDate: "1901.01.01",
      genreID: 1,
    },
    {
      authorID: 8,
      title: "A láthatatlan ember",
      description: "Történelmi regény a hunok világából.",
      releaseDate: "1902.01.01",
      genreID: 1,
    },
    {
      authorID: 9,
      title: "Szent Péter esernyője",
      description:
        "Egy különleges ernyő köré szőtt humoros, romantikus történet.",
      releaseDate: "1895.01.01",
      genreID: 1,
    },
    {
      authorID: 9,
      title: "A fekete város",
      description: "Politikai és szerelmi összeesküvés egy felvidéki városban.",
      releaseDate: "1910.01.01",
      genreID: 1,
    },
    {
      authorID: 10,
      title: "Tanár úr kérem",
      description: "Humoros jelenetek diákokról és iskolai életről.",
      releaseDate: "1916.01.01",
      genreID: 1,
    },
    {
      authorID: 10,
      title: "Utazás a koponyám körül",
      description:
        "Karinthy Ferenc agyműtétének szellemes és filozofikus leírása.",
      releaseDate: "1937.01.01",
      genreID: 4,
    },
    {
      authorID: 11,
      title: "Bóbita",
      description: "Lírai és játékos gyermekversek gyűjteménye.",
      releaseDate: "1955.01.01",
      genreID: 5,
    },
    {
      authorID: 11,
      title: "Psyché",
      description:
        "Költött női költő élettörténete vers- és naplórészletekkel.",
      releaseDate: "1972.01.01",
      genreID: 1,
    },
    {
      authorID: 12,
      title: "Édes Anna",
      description: "Egy cselédlány tragikus sorsát bemutató társadalmi regény.",
      releaseDate: "1926.01.01",
      genreID: 1,
    },
    {
      authorID: 12,
      title: "Esti Kornél",
      description:
        "Esti Kornél utazásai és gondolatainak filozofikus történetei.",
      releaseDate: "1933.01.01",
      genreID: 1,
    },
    {
      authorID: 13,
      title: "A gólyakalifa",
      description: "Két világban élő fiatal elmejátékos története.",
      releaseDate: "1916.01.01",
      genreID: 1,
    },
    {
      authorID: 13,
      title: "Halálfiai",
      description: "Egy polgári család hanyatlásának regénye.",
      releaseDate: "1927.01.01",
      genreID: 1,
    },
    {
      authorID: 14,
      title: "Abigél",
      description:
        "Egy református lányiskolába zárt lány sorsa a háború idején.",
      releaseDate: "1970.01.01",
      genreID: 2,
    },
    {
      authorID: 14,
      title: "Az ajtó",
      description: "Az írónő és házvezetőnője közti mély kapcsolat története.",
      releaseDate: "1987.01.01",
      genreID: 2,
    },
    {
      authorID: 15,
      title: "A Négyszögletű Kerek Erdő",
      description: "Különleges szereplők kalandjai egy varázslatos erdőben.",
      releaseDate: "1985.01.01",
      genreID: 5,
    },
    {
      authorID: 15,
      title: "Berzsián és Dideki",
      description: "Mesés történet két furcsa lakóról egy költői faluban.",
      releaseDate: "1979.01.01",
      genreID: 5,
    },
  ];

  books?.map(async (b) => {
    await Book.create({
      title: b.title,
      description: b.description,
      releaseDate: b.releaseDate,
      authorID: b.authorID,
      genreID: b.genreID,
      slug: convert(b.title),
    });
  });

  logger.log("db", `Default books loaded.`);

  Book.findAll({}).then((books) => {
    books.forEach((book) => {
      const stock = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < stock; i++) {
        Inventory.create({
          bookID: book.bookID,
          intake: new Date(),
          size: "medium",
          status: "available",
        });
      }
    });
  });

  logger.log("db", `Example inventory loaded.`);

  logger.log("db", `Example data loaded.`);
};
