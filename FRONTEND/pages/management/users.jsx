//Imports

import ErrorHandler from "@/components/Error";
import Layout from "@/components/Layout";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import EditUserModal from "@/components/modals/EditUserModal";
import { Pencil, X } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

//Custom modules

//UsersManagmentPage
const UsersManagmentPage = ({ users, user, error }) => {
  //Router
  const router = useRouter();

  //Hooks
  const [userData, setUserData] = useState(null);

  //Objects
  const permissionTable = ["Felhasználó", "Könyvtáros", "Adminisztrátor"];
  const statusTable = {
    suspended: "Felfüggesztett",
    active: "Aktív",
    deleted: "Törölve",
  };

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const updateUser = (values) => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/id/${values?.userID}`,
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
          setUserData(null);
          toast.success("Sikeres módosítás!");
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
      <EditUserModal
        onClose={() => {
          setUserData(null);
        }}
        onSubmit={(data) => {
          updateUser(data);
        }}
        userData={userData}
      />

      <Layout>
        <MetaData title="Felhasználók" />
        <Menu user={user?.userID ? user : { permission: -1 }} />
        <div className="flex flex-col gap-10 mx-10">
          <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mt-10 text-center md:text-left">
            Felhasználók
          </h1>
          <div className="flex flex-col overflow-x-scroll min-h-screen">
            <div className="flex justify-center bg-gray-100 font-semibold px-4 py-2 rounded-lg min-w-[700px]">
              <div className="flex-[1] text-left pr-4 ">Név</div>
              <div className="flex-[2] text-left px-2 ">Email</div>
              <div className="flex-[1] text-left px-2 ">Jogosultság</div>
              <div className="flex-[1] text-left px-2 ">Státusz</div>
              <div className="flex-[1] text-center px-2 ">Funkciók</div>
            </div>

            {users?.map((u) => {
              return (
                <div
                  className="min-w-[700px] flex justify-center items-center px-4 py-2 my-1"
                  key={u?.userID}
                >
                  <div className="flex-[1]  font-medium pr-4 ">{u?.name}</div>
                  <div className="flex-[2]  font-medium px-2 ">{u?.email}</div>
                  <div className="flex-[1]  font-medium px-2 ">
                    {u?.permission > 2
                      ? permissionTable[2]
                      : permissionTable.at(u?.permission)}
                  </div>

                  <div className="flex-[1]  font-medium px-2 ">
                    {statusTable[u?.status]}
                  </div>

                  <div className="flex-[1] flex px-2 gap-2.5 justify-center">
                    {u?.permission < 2 && u?.status != "deleted" && (
                      <button
                        title="Szerkesztés"
                        className="bg-black text-white p-2 rounded-xl"
                        onClick={() => {
                          setUserData(u);
                        }}
                      >
                        <Pencil size={20} weight="bold" />
                      </button>
                    )}

                    {u?.permission < 2 && u?.status != "deleted" && (
                      <button
                        title="Törlés"
                        className="bg-warmcoal text-white p-2 rounded-xl"
                        onClick={() => {
                          updateUser({
                            ...u,
                            status: "deleted",
                          });
                        }}
                      >
                        <X size={20} weight="bold" />
                      </button>
                    )}
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

export default UsersManagmentPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const dataRes = await fetch(`${process.env.SERVER_URL}/api/users`, {
    headers: { cookie },
  });
  const data = dataRes.ok ? await dataRes.json() : null;

  return {
    props: {
      user: userData,
      users: data,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
        protected: dataRes.status !== 200 ? dataRes.status : null,
      },
    },
  };
}
