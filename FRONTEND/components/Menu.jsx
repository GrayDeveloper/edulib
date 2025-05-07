const { CaretDown } = require("@phosphor-icons/react/dist/ssr");
const { default: Link } = require("next/link");
const { useRouter } = require("next/router");
const { useState } = require("react");

const menuList = [
  {
    url: "/",
    name: "Kezdőlap",
    permission: -1,
  },

  {
    url: "/rentals",
    name: "Kölcsönzött",
    permission: 0,
  },
  {
    url: "/my",
    name: "Profilom",
    permission: 0,
  },
  {
    url: "/management",
    name: "Könyvtár",
    permission: 1,
  },
];

const MenuItem = ({ name, url, selected }) => {
  return (
    <Link className="text-2xl md:text-lg" href={url}>
      • <span className={selected && "underline"}>{name}</span>
    </Link>
  );
};

const Menu = ({ user, absolute }) => {
  const router = useRouter();
  const [Open, setOpen] = useState(false);
  const { pfp, permission, userID } = user;

  if (Open) {
    /* Mobile menu */
    return (
      <nav
        className={`flex flex-col items-center h-full w-full absolute bg-softmint border-b-[12px] border-mint overflow-hidden z-10`}
      >
        <div className="absolute top-4 flex items-center justify-between w-full px-4 z-10">
          <Link href="/">
            <img src="/logo.svg" className="w-20" />
          </Link>
          <CaretDown
            size={32}
            className={Open ? "rotate-0" : "rotate-180"}
            onClick={() => {
              setOpen(!Open);
            }}
          />
          {userID ? (
            <Link href="/my">
              <img
                className="h-12 w-12 rounded-full bg-gray-300"
                src={
                  "https://ui-avatars.com/api/?name=" +
                  user?.name +
                  "&background=d1d5dc"
                }
              />
            </Link>
          ) : (
            <Link href="/login">
              <img
                className="h-12 w-12 rounded-full bg-gray-300"
                src="/avatars/a01.png"
              />
            </Link>
          )}
        </div>
        <div className="flex flex-col justify-around h-1/2 text-lg font-semibold items-center my-auto">
          {menuList
            .filter((i) => i.permission <= permission)
            .map((item) => {
              return (
                <MenuItem
                  key={item.url}
                  name={item.name}
                  url={item.url}
                  selected={router.pathname == item.url}
                />
              );
            })}
          <img
            src="/doodles/ReadingSideDoodle.svg"
            className="absolute -bottom-12 left-10 w-64"
          />
        </div>
      </nav>
    );
  } else {
    /* Wide menu */
    return (
      <div
        className={`flex items-center justify-between w-full p-4 ${
          absolute && "absolute"
        } top-0 `}
      >
        <Link href="/">
          <img src="/logo.svg" className="w-20" />
        </Link>
        <CaretDown
          size={32}
          className={`md:hidden ${Open ? "rotate-0" : "rotate-180"}`}
          onClick={() => {
            setOpen(!Open);
          }}
        />
        <div className="hidden md:flex flex-row justify-around gap-10 flex-wrap font-semibold text-charcoal items-center ">
          {menuList
            .filter((i) => i.permission <= permission)
            .map((item) => {
              return (
                <MenuItem
                  key={item.url}
                  name={item.name}
                  url={item.url}
                  selected={router.pathname == item.url}
                />
              );
            })}
        </div>

        {userID ? (
          <Link href="/my">
            <img
              className="h-12 w-12 rounded-full bg-gray-300"
              src={
                "https://ui-avatars.com/api/?name=" +
                user?.name +
                "&background=d1d5dc"
              }
            />
          </Link>
        ) : (
          <Link href="/login">
            <img
              className="h-12 w-12 rounded-full bg-gray-300"
              src="/avatars/a01.png"
            />
          </Link>
        )}
      </div>
    );
  }
};

module.exports = {
  Menu,
};
