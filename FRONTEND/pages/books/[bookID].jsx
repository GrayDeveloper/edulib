//Imports

import ErrorHandler from "@/components/Error";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import {
  CalendarDots,
  ClockCounterClockwise,
} from "@phosphor-icons/react/dist/ssr";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import Barcode from "react-barcode";
import toast from "react-hot-toast";

//Custom modules

//BookPage
const BookPage = ({ book, rentals, user, error }) => {
  //Router
  const router = useRouter();

  //Objects
  const rental = rentals?.list?.find((r) => r?.book?.bookID == book?.bookID);

  //Hook

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const rent = () => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/books/${book?.bookID}/rent`,
      {
        method: "POST",
        redirect: "follow",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookID: book.bookID,
        }),
      }
    ).then((res) => {
      refreshData();

      switch (res.status) {
        case 200:
          toast.success("Sikeres kölcsönzés, kérlek vedd át a könyvet!");
          break;

        case 409:
          toast.error("Nincs elérhető példány!");
          break;

        case 422:
          toast.error(
            "Kölcsönzési limit, új kölcsönzés előtt vigyél vissza egy könyvet!"
          );
          break;

        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  const extend = (rentalID) => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/rentals/${rentalID}/extend/`,
      {
        method: "POST",
        redirect: "follow",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((res) => {
      refreshData();

      switch (res.status) {
        case 200:
          toast.success("Sikeres meghosszabbítás!");
          break;

        case 409:
          toast.error("Nem lehetséges!");
          break;

        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  if (error) return <ErrorHandler statusCode={error} />;

  if (!book?.bookID) {
    return <ErrorHandler statusCode={404} />;
  }

  return (
    <div className="min-h-screen md:h-screen w-screen bg-white flex flex-col">
      <MetaData title={book?.title} />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col md:flex-row h-full">
        <div className=" w-3/4 md:w-fit md:h-full aspect-[1/1.414] self-center p-5 md:p-10 md:pt-5">
          <img
            src={
              book?.cover
                ? book?.cover
                : "https://placehold.co/248x350/709e87/FFF?font=playfair-display&text=" +
                  book?.title
            }
            className="bg-mint w-full h-full rounded-3xl "
          />
        </div>

        <div className="flex flex-col m-10 mt-5 gap-5">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-charcoal font-semibold md:w-3/4 font-serif">
            {book?.title}
          </h1>

          <a
            href={"/authors/" + book?.author?.authorID}
            className="text-lg md:text-xl text-charcoal/90"
          >
            {book?.author?.name},{" "}
            {new Date(book?.releaseDate)?.getFullYear() || ""}
          </a>

          <p className="text-lg md:text-xl text-charcoal/90 font-light w-3/4">
            {book?.description}
          </p>

          <div className="mt-auto flex flex-col gap-5 w-full  ">
            <h2 className="text-lg md:text-2xl text-charcoal/90 font-semibold">
              Kölcsönzés
            </h2>

            {!user?.name && (
              <p className="text-wrap w-3/4">
                A kölcsönzéshez kérlek{" "}
                <Link href="/login" className="font-semibold italic">
                  jelentkezz be!
                </Link>
              </p>
            )}

            {book?.inventory?.available > 0 ? (
              <div className="tag-2 font-semibold w-fit">
                {book?.inventory?.available} / {book?.inventory?.all?.length}{" "}
                példány elérhető
              </div>
            ) : (
              <button
                className="button-1 w-fit"
                disabled
                title="Nincs elérhető példány"
              >
                Nincs elérhető példány
              </button>
            )}

            {book?.inventory?.all?.some((i) =>
              rentals?.list?.some((r) => r?.inventoryID == i?.inventoryID)
            ) ? (
              <>
                {rental?.status == "active" && (
                  <div className="flex flex-col gap-5">
                    <p>Egy példányt épp te kölcsönzöd.</p>
                    <div className="flex flex-row gap-2.5 items-center">
                      <CalendarDots
                        size={30}
                        className="text-mint"
                        weight="bold"
                      />{" "}
                      <p>
                        <span className="font-semibold">felvétel: </span>

                        {new Date(rental?.rentalStart)?.toLocaleDateString(
                          "hu-HU"
                        )}
                      </p>
                    </div>
                    <div className="flex flex-row gap-2.5 items-center">
                      <ClockCounterClockwise
                        size={30}
                        className="text-mint"
                        weight="bold"
                      />{" "}
                      <p>
                        <span className="font-semibold">leadás: </span>

                        {new Date(rental?.rentalEnd)?.toLocaleDateString(
                          "hu-HU"
                        )}
                      </p>
                    </div>

                    <p className="text-wrap w-3/4">
                      A könyvet kérem jutassa vissza a leadási határidőig vagy
                      hosszabbítsa a kölcsénzését! A gyorsabb visszajuttatás
                      érdekében mutatta az alábbi kódot a könyvtárosnak.
                    </p>
                    {moment(rental?.rentalEnd).diff(
                      moment(rental?.rentalStart),
                      "days"
                    ) < 3 ? (
                      <button
                        title="Kölcsönzés meghosszabbítása"
                        className="button-1 w-fit"
                        onClick={() => {
                          extend(rental?.rentalID);
                        }}
                      >
                        Hosszabbítás
                      </button>
                    ) : (
                      <p className="text-wrap w-3/4">
                        A hosszabbítást a határidő előtt 2 nappal igényelheted.
                      </p>
                    )}

                    <div className="w-fit overflow-hidden rounded-xl">
                      <Barcode
                        value={"ECR:" + rental?.rentalID}
                        displayValue={false}
                        margin={0}
                        className="m-0 p-0"
                      />
                    </div>
                  </div>
                )}

                {rental?.status == "pickup" && (
                  <div className="flex flex-col gap-5">
                    <p>
                      Egy példányt te igényelted, kérlek vedd átt a
                      könyvtárosnál!
                    </p>

                    <p className="text-wrap w-3/4">
                      A gyorsabb átvétel érdekében mutatta az alábbi kódot a
                      könyvtárosnak.
                    </p>

                    <div className="w-fit overflow-hidden rounded-xl">
                      <Barcode
                        value={"EPR:" + rental?.rentalID}
                        displayValue={false}
                        margin={0}
                        className="m-0 p-0"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-row gap-5">
                {user?.name && book?.inventory?.available > 0 && (
                  <button
                    title="Kölcsönzés"
                    className="button-3"
                    onClick={() => {
                      rent();
                    }}
                  >
                    Kölcsönzés
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;

export async function getServerSideProps(ctx) {
  try {
    const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const userData = await userRes.json();

    const bookRes = await fetch(
      `${process.env.SERVER_URL}/api/books/slug/${ctx.params?.bookID}`,
      {
        headers: {
          cookie: ctx.req.headers?.cookie,
        },
      }
    );
    const bookData = await bookRes.json();

    if (userData?.userID) {
      const rentalRes = await fetch(
        `${process.env.SERVER_URL}/api/rentals/my`,
        {
          headers: {
            cookie: ctx.req.headers?.cookie,
          },
        }
      );

      const rentalData = await rentalRes.json();

      return {
        props: {
          book: bookData,
          user: userData,
          rentals: rentalData,
        },
      };
    }

    return {
      props: {
        book: bookData,
      },
    };
  } catch (error) {
    return {
      props: {
        user: null,
        rentals: null,
        error: 503,
      },
    };
  }
}
