//Imports

import Layout from "@/components/Layout";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import EditAuthorModal from "@/components/modals/EditAuthorModal";
import { Pencil, Plus, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

//Custom modules

//AuthorsManagmentPage
const AuthorsManagmentPage = ({ user, authors, error }) => {
  //Router
  const router = useRouter();

  //Hooks
  const [authorData, setAuthorData] = useState(null);

  //Objects

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const createAuthor = (values) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/authors/`, {
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
          setAuthorData(null);
          toast.success("Sikeres létrehozás!");
          break;
        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  const updateAuthor = (values) => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/authors/id/${values?.authorID}`,
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
          setAuthorData(null);
          toast.success("Sikeres módosítás!");
          break;
        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };
  return (
    <>
      <EditAuthorModal
        authorData={authorData}
        onClose={() => {
          setAuthorData(null);
        }}
        onSubmit={(data) => {
          if (data?.authorID) {
            updateAuthor({
              authorID: authorData?.authorID,
              name: data?.name,
              birthDate: new Date(data?.birthDate + ".01.01"),
              deathDate:
                data?.deathDate && data?.deathDate !== ""
                  ? new Date(data?.deathDate + ".01.01")
                  : null,
            });
          } else {
            createAuthor({
              name: data?.name,
              birthDate: new Date(data?.birthDate + ".01.01"),
              deathDate:
                data?.deathDate && data?.deathDate !== ""
                  ? new Date(data?.deathDate + ".01.01")
                  : null,
            });
          }
        }}
      />

      <Layout>
        <MetaData title="Szerzők" />
        <Menu user={user?.userID ? user : { permission: -1 }} />

        <div className="flex flex-col gap-5  mx-10">
          <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mt-10 text-center md:text-left">
            Szerzők
          </h1>

          <button
            title="Új szerző "
            className="button-2 flex items-center gap-2.5 w-fit"
            onClick={() => {
              setAuthorData({
                authorID: null,
                name: "",
                birthDate: new Date().getFullYear(),
                deathDate: null,
              });
            }}
          >
            <Plus weight="bold" size={20} className="" />
            Új szerző
          </button>

          <div className="flex flex-col overflow-x-scroll min-h-screen">
            <div className="flex justify-center bg-gray-100 font-semibold px-4 py-2 rounded-lg min-w-[700px] ">
              <div className="flex-[0.5] text-left pr-4 ">Azonosító</div>
              <div className="flex-[3] text-left px-2 ">Név</div>
              <div className="flex-[1] text-left px-2 ">Születés</div>
              <div className="flex-[1] text-left px-2 ">Halál</div>
              <div className="flex-[1] text-center px-2 ">Funkciók</div>
            </div>

            {authors?.map((a) => {
              return (
                <div className="min-w-[700px] flex justify-center items-center px-4 py-2 my-1">
                  <div className="flex-[0.5] text-gray-500 pr-4 ">
                    {a?.authorID}
                  </div>

                  <Link
                    href={`/authors/${a?.authorID}`}
                    className={`flex-[3] text-left text-gray-600 px-2 truncate w-fit `}
                  >
                    {a?.name}
                  </Link>
                  <div className="flex-[1] text-gray-500 px-2 ">
                    {new Date(a?.birthDate).getFullYear()}
                  </div>

                  <div className="flex-[1] text-gray-500 px-2 ">
                    {a?.deathDate && new Date(a?.deathDate).getFullYear()}
                  </div>

                  <div className="flex-[1] flex px-2 gap-2.5 justify-center">
                    <button
                      title="Szerkesztés"
                      className="bg-black text-white p-2 rounded-xl"
                      onClick={() => {
                        setAuthorData({
                          authorID: a?.authorID,
                          name: a?.name,
                          birthDate: new Date(a?.birthDate).getFullYear(),
                          deathDate: new Date(a?.deathDate).getFullYear(),
                        });
                      }}
                    >
                      <Pencil size={20} weight="bold" />
                    </button>

                    {/*  <button
                      className="bg-black text-white p-2 rounded-xl"
                      title="Törlés"
                    >
                      <X size={20} weight="bold" />
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AuthorsManagmentPage;

export async function getServerSideProps(ctx) {
  try {
    const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const userData = await userRes.json();

    const authorRes = await fetch(`${process.env.SERVER_URL}/api/authors`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const authorData = await authorRes.json();

    return {
      props: {
        user: userData,
        authors: authorData,
        error: userRes?.status || rentalsRes?.status,
      },
    };
  } catch (error) {
    return {
      props: {
        error: 503,
      },
    };
  }
}
