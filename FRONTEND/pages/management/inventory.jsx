//Imports
import ErrorHandler from "@/components/Error";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import EditInventoryModal from "@/components/modals/EditInventoryModal";
import { Funnel, Pencil, Plus, X } from "@phosphor-icons/react/dist/ssr";
import moment from "moment";
import "moment/locale/hu";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

//Custom modules

//InventoryManagementPage
const InventoryManagementPage = ({ user, inventory, error }) => {
  moment().locale("hu");

  //Router
  const router = useRouter();

  const inventoryID = router.query?.id;
  const bookID = router.query?.bookID;

  const filter = router.query?.filter;

  //Hooks
  const [inventoryData, setInventoryData] = useState(null);

  useEffect(() => {
    if (inventoryID) {
      if (inventoryID === "new") {
        setInventoryData({
          book: {
            bookID: bookID,
          },
        });
      } else {
        const selectedInventory = inventory?.find(
          (i) => i?.inventoryID === parseInt(inventoryID)
        );
        setInventoryData(selectedInventory);
      }
    }
  }, [inventoryID, inventory]);

  //Objects

  const statusTable = {
    pending: {
      text: "Átvételre vár",
      style: "bg-warmcoal text-white font-semibold",
    },
    available: {
      text: "Elérhető",
      style: "bg-gray-200 font-semibold",
    },
    missing: {
      text: "Hiányzó",
      style: "bg-warmcoal text-white font-semibold",
    },

    damaged: {
      text: "Sérült",
      style: "bg-deepteal text-white font-semibold",
    },
    rented: {
      text: "Kölcsönzött",
      style: "bg-mint text-white font-semibold",
    },
  };

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const createInventory = (values) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/inventory/`, {
      method: "POST",
      redirect: "follow",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: values?.status,
        bookID: values?.book?.bookID,
      }),
    }).then((res) => {
      switch (res.status) {
        case 200:
          router.push("/management/inventory");
          setInventoryData(null);
          toast.success("Sikeres feltöltés!");
          break;
        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  const updateInventory = (values) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/inventory/`, {
      method: "PUT",
      redirect: "follow",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }).then((res) => {
      switch (res.status) {
        case 200:
          router.push("/management/inventory");
          setInventoryData(null);
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
      <EditInventoryModal
        onClose={() => {
          setInventoryData(null);
        }}
        onSubmit={(data) => {
          if (data?.inventoryID) {
            updateInventory(data);
          } else {
            createInventory(data);
          }
        }}
        inventory={inventoryData}
      />

      <div className="min-h-screen w-screen bg-white flex flex-col">
        <MetaData title="Leltár" />
        <Menu user={user?.userID ? user : { permission: -1 }} />

        <div className="flex flex-col gap-10 mx-10">
          <h1 className="text-2xl md:text-3xl font-semibold mt-10 text-center md:text-left">
            Leltár
          </h1>

          {filter && (
            <button
              title="Szűrő törlése"
              className="flex items-center w-fit bg-mint text-white font-semibold p-2 px-4 rounded-full"
              onClick={() => {
                router.push("/management/inventory");
              }}
            >
              <X size={20} weight="bold" className="mr-2" />
              Szűrő:
              {" " +
                inventory?.find((i) => i?.book?.bookID == parseInt(filter))
                  ?.book?.title}
            </button>
          )}

          <div className="flex flex-col overflow-x-scroll min-h-screen">
            <div className="flex justify-center bg-gray-100 font-semibold px-4 py-2 rounded-lg min-w-[700px] ">
              <div className="flex-[0.5] text-left pr-4 ">Leltári szám</div>
              <div className="flex-[3] text-left px-2 ">Könyv</div>
              <div className="flex-[1] text-left px-2 ">Utolsó leltár</div>
              <div className="flex-[1] text-center px-2 ">Státusz</div>
              <div className="flex-[1] text-center px-2 ">Funkciók</div>
            </div>

            {inventory
              ?.filter((i) =>
                filter != null
                  ? i.book?.bookID == parseInt(filter)
                  : i.book?.bookID
              )
              ?.map((item) => {
                return (
                  <div
                    className="min-w-[700px] flex justify-center items-center px-4 py-2 my-1"
                    key={item?.inventoryID}
                  >
                    <div className="flex-[0.5] text-gray-500 pr-4 ">
                      {item?.inventoryID}
                    </div>
                    <Link
                      href={"/books/" + item?.book?.slug}
                      target="_blank"
                      className="flex-[3]  font-medium px-2 "
                    >
                      {item?.book.author}: {" " + item?.book.title}
                    </Link>

                    <div className="flex-[1] px-2 flex gap-5">
                      {moment(item?.intake).format("YYYY. MMMM D.")}
                    </div>

                    <div className="flex-[1] px-2 flex gap-5 justify-center">
                      <div
                        className={`bg-black p-2 rounded-full px-4 ${
                          statusTable[item?.status]?.style
                        }`}
                      >
                        {statusTable[item?.status]?.text}
                      </div>
                    </div>

                    <div className="flex-[1] flex px-2 gap-2.5 justify-center">
                      <button
                        title="Szerkesztés"
                        className="bg-black text-white p-2 rounded-xl"
                        onClick={() => {
                          setInventoryData(item);
                        }}
                      >
                        <Pencil size={20} weight="bold" />
                      </button>
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

export default InventoryManagementPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const dataRes = await fetch(`${process.env.SERVER_URL}/api/inventory`, {
    headers: { cookie },
  });
  const data = dataRes.ok ? await dataRes.json() : null;

  return {
    props: {
      user: userData,
      inventory: data,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
        protected: dataRes.status !== 200 ? dataRes.status : null,
      },
    },
  };
}
