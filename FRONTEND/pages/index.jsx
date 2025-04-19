//Imports

import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import {
  BookBookmark,
  MagnifyingGlass,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

//Custom modules

//HomePage
const HomePage = ({ user, genres, error }) => {
  //Router
  const router = useRouter();

  //Hooks
  const [SearchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(SearchTerm, 400);
  const [SearchResults, setSearchResults] = useState([]);
  const [GenreFilter, setGenreFilter] = useState(null);

  const [doodle] = useState(
    () =>
      ["MeditatingDoodle.svg", "LovingDoodle.svg", "ReadingDoodle.svg"][
        Math.floor(Math.random() * 3)
      ]
  );

  useEffect(() => {
    if (debouncedSearchTerm) {
      search();
    }
  }, [debouncedSearchTerm, GenreFilter]);

  //Functions
  const search = async () => {
    if (SearchTerm.length < 3) return;
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/api/library/search?term=${SearchTerm}${
        GenreFilter ? `&genreID=${GenreFilter}` : ""
      }`
    );
    const data = await res.json();

    setSearchResults([]);
    if (res.status === 200) {
      setSearchResults(data);
    }
  };

  const randomBook = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/books/random`
    );
    const data = await res.json();

    if (res?.ok && data?.slug) {
      router.push(`/books/${data?.slug}`);
    }
  };

  //if (error) return <ErrorHandler statusCode={error} />;
  return (
    <Layout>
      <MetaData title="Kezdőlap" />
      <Menu user={user?.userID ? user : { permission: -1 }} absolute />

      <div className="flex flex-col items-center justify-center gap-10 md:gap-10 h-full">
        <img src={`/doodles/${doodle}`} className="w-1/2 md:w-1/5"></img>

        <div className="flex flex-wrap gap-2.5 w-3/4 md:w-1/2 justify-center">
          {genres
            ?.sort((a, b) => a?.name.localeCompare(b?.name))
            ?.map((item) => {
              return (
                <button
                  title={item?.name + " szűrő beállítása"}
                  key={item?.genreID}
                  onClick={() => {
                    if (GenreFilter === item?.genreID) setGenreFilter(null);
                    else setGenreFilter(item?.genreID);
                  }}
                  className={`transition-all font-semibold tag-3 px-4 py-2 ${
                    GenreFilter === item?.genreID
                      ? "bg-mint text-white border-transparent scale-105 "
                      : "text-charcoal border-charcoal"
                  }`}
                >
                  {item?.name}
                </button>
              );
            })}
        </div>

        <div className=" w-3/4 md:w-1/2 outline-0 outline-mint rounded-2xl">
          <div className="flex items-center gap-5 px-5 py-3 rounded-2xl outline-0 outline-mint bg-gray-100  ">
            <MagnifyingGlass
              size={25}
              weight="bold"
              className="text-black/90"
            />
            <input
              id="search"
              value={SearchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") search();
              }}
              autoComplete="off"
              placeholder={"Apám szerint..."}
              className="text-xl font-medium focus:ring-0 outline-none w-full text-charcoal placeholder:text-charcoal/70 "
            />
          </div>
          {SearchResults.length > 0 && SearchTerm.length > 0 && (
            <div className="flex flex-col gap-5 my-5  px-5">
              {SearchResults?.map((item) => {
                return (
                  <Link
                    key={item?.id}
                    href={
                      item?.type === "author"
                        ? `/authors/${item?.id}`
                        : `/books/${item?.slug}`
                    }
                    className="flex items-center"
                  >
                    {item?.type === "author" ? (
                      <User size={24} weight="bold" className="text-mint/50" />
                    ) : (
                      <BookBookmark
                        size={24}
                        weight="bold"
                        className="text-mint/50"
                      />
                    )}
                    <h1 className="text-lg ml-5">
                      <span className="font-semibold">
                        {item.title} {item.name}
                      </span>{" "}
                      {item?.author && (
                        <span className="text-charcoal/70">
                          ({item?.author})
                        </span>
                      )}
                    </h1>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {SearchResults?.length === 0 && SearchTerm.length >= 3 && (
          <span className="my-5 font-semibold">Nincs találat!</span>
        )}
        {SearchTerm.length > 0 &&
          SearchTerm.length < 3 &&
          SearchResults.length == 0 && (
            <span className="my-5 font-semibold">
              Legalább 3 karaktert adj meg!
            </span>
          )}

        <button
          className="button-2 "
          title="Lepj meg!"
          onClick={() => {
            randomBook();
          }}
        >
          Lepj meg!
        </button>
      </div>
    </Layout>
  );
};

export default HomePage;

export async function getServerSideProps(ctx) {
  try {
    const res = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: { cookie: ctx.req.headers?.cookie },
    });

    if (!res.ok) throw new Error(res.status);

    const res2 = await fetch(`${process.env.SERVER_URL}/api/genres`, {});

    const user = await res.json();
    const genres = await res2.json();
    return { props: { user, genres, error: false } };
  } catch (error) {
    return { props: { user: null, error: error.message } };
  }
}
