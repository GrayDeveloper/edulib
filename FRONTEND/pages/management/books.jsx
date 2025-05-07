//Imports

import ErrorHandler from "@/components/Error";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import EditBookModal from "@/components/modals/EditBookModal";
import { MagnifyingGlass, Pencil, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

//BooksManagementPage
const BooksManagementPage = ({ books, user, genres, error }) => {
  //Router
  const router = useRouter();

  //Hooks
  const [bookData, setBookData] = useState(null);
  const [Filter, setFilter] = useState({
    authorID: null,
  });

  //Objects
  const authors = Array.from(
    new Map(
      books?.map(({ author, authorID }) => [authorID, { author, authorID }])
    ).values()
  );

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const createBook = (values) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/books/`, {
      method: "POST",
      redirect: "follow",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }).then((res) => {
      refreshData();

      switch (res.status) {
        case 200:
          refreshData();
          setBookData(null);
          toast.success("Sikeres feltöltés!");
          break;
        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  const updateBook = (values) => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/books/id/${values?.bookID}/`,
      {
        method: "PUT",
        redirect: "follow",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    ).then((res) => {
      refreshData();

      switch (res.status) {
        case 200:
          refreshData();
          setBookData(null);
          toast.success("Sikeres frissítés!");
          break;

        case 400:
          toast.error("Hiányos adatok!");
          break;
        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  if (error?.protected) {
    return <ErrorHandler statusCode={error?.protected} />;
  }

  if (error?.user) {
    return <ErrorHandler statusCode={error?.user} />;
  }

  return (
    <>
      <EditBookModal
        onClose={() => {
          setBookData(null);
        }}
        onSubmit={(data) => {
          if (data?.bookID) {
            updateBook(data);
          } else {
            createBook(data);
          }
        }}
        bookData={bookData}
        authors={authors}
        genres={genres}
      />
      <div className="min-h-screen w-screen bg-white flex flex-col">
        <MetaData title="Könyvtár" />
        <Menu user={user?.userID ? user : { permission: -1 }} />
        <div className="flex flex-col gap-10 mx-10">
          <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mt-10 text-center md:text-left">
            Könyvek
          </h1>

          <div className="flex items-center gap-5 flex-wrap justify-center">
            <select
              as="select"
              name="status"
              className="text-input-3 w-fit"
              onChange={(event) => {
                setFilter({
                  authorID: parseInt(event.currentTarget.value),
                });
              }}
            >
              <option disabled selected>
                A szüréshez válassz szerzőt!
              </option>
              {authors
                ?.sort((a, b) => a?.author.localeCompare(b?.author))
                ?.map((author, i) => {
                  return (
                    <option value={author?.authorID} key={i}>
                      {author?.author}
                    </option>
                  );
                })}
            </select>

            <button
              title="Új könyv"
              className="button-2 flex items-center gap-2.5"
              onClick={() => {
                setBookData({});
              }}
            >
              <Plus weight="bold" size={20} className="" />
              Új könyv
            </button>
          </div>

          <div className="flex flex-col overflow-x-scroll min-h-screen">
            <div className="flex justify-center bg-gray-100 font-semibold px-4 py-2 rounded-lg min-w-[700px] ">
              <div className="flex-[0.5] text-left pr-4 ">Azonosító</div>
              <div className="flex-[3] text-left px-2 ">Cím</div>
              <div className="flex-[2] text-left px-2 ">Szerző</div>
              <div className="flex-[1] text-left px-2 ">ISBN</div>
              <div className="flex-[2] text-left px-2 ">Leltár</div>
              <div className="flex-[1] text-center px-2 ">Funkciók</div>
            </div>

            {books
              ?.filter((i) =>
                Filter.authorID ? Filter.authorID === i.authorID : i.authorID
              )

              /*      ?.filter((i) =>
                Filter.title ? i.title?.includes(Filter.title) : i.title
              ) */
              ?.map((book) => {
                return (
                  <div className="min-w-[700px] flex justify-center items-center px-4 py-2 my-1">
                    <div className="flex-[0.5] text-gray-500 pr-4 ">
                      {book?.bookID}
                    </div>
                    <Link
                      href={"/books/" + book?.slug}
                      target="  _blank"
                      className="flex-[3]  font-medium px-2 "
                    >
                      {book?.title}
                    </Link>
                    <Link
                      href={`/authors/${book?.authorID}`}
                      className={`flex-[2] text-left text-gray-600 px-2 truncate w-fit `}
                    >
                      {book?.author}
                    </Link>
                    <div className="flex-[1]  font-medium px-2 ">
                      {book?.ISBN}
                    </div>
                    <div className="flex-[2] px-2 flex gap-5 items-center">
                      <button
                        title="Megtekintés"
                        className="bg-black text-white p-2 rounded-xl"
                        onClick={() => {
                          router.push(
                            `/management/inventory?filter=${book?.bookID}`
                          );
                        }}
                      >
                        <MagnifyingGlass size={20} weight="bold" />
                      </button>

                      {/*             {book?.inventory?.map((i) => {
                        return (
                          <Link
                            className="font-semibold"
                            href={`/management/inventory?id=${i?.inventoryID}`}
                          >
                            {i?.inventoryID}
                          </Link>
                        );
                      })} */}

                      {book?.inventory?.length > 0 && (
                        <span className="italic">{`(${book?.inventory?.length} db)`}</span>
                      )}
                    </div>
                    <div className="flex-[1] flex px-2 gap-2.5 justify-center">
                      <button
                        title="Szerkesztés"
                        className="bg-black text-white p-2 rounded-xl"
                        onClick={() => {
                          setBookData(book);
                        }}
                      >
                        <Pencil size={20} weight="bold" />
                      </button>

                      <Link
                        className="bg-black text-white p-2 rounded-xl"
                        title="Új példány"
                        href={`/management/inventory?id=new&bookID=${book?.bookID}`}
                      >
                        <Plus size={20} weight="bold" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default BooksManagementPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const dataRes = await fetch(`${process.env.SERVER_URL}/api/books`, {
    headers: { cookie },
  });
  const data = dataRes.ok ? await dataRes.json() : null;

  const dataRes2 = await fetch(`${process.env.SERVER_URL}/api/genres`, {
    headers: { cookie },
  });
  const data2 = dataRes2.ok ? await dataRes2.json() : null;

  return {
    props: {
      user: userData,
      books: data,
      genres: data2,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
        genres: dataRes2.status !== 200 ? dataRes2.status : null,
        protected: dataRes.status !== 200 ? dataRes.status : null,
      },
    },
  };
}
