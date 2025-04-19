//Imports

import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import "moment/locale/hu";
import {
  Archive,
  Check,
  ClockClockwise,
  Funnel,
  HandArrowDown,
  HandArrowUp,
  Question,
  X,
} from "@phosphor-icons/react/dist/ssr";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { BarcodeButton } from "@/components/BarcodeButton";
import Layout from "@/components/Layout";

//Custom modules

//RentalManagementPage
const RentalManagementPage = ({ user, rentals, error }) => {
  moment().locale("hu");

  //Router
  const router = useRouter();

  //Hooks
  const [Filter, setFilter] = useState({
    id: "all",
  });

  //Objects
  const filters = [
    {
      id: "all",
      name: "Összes",
      icon: <Funnel size={25} weight="bold" />,
    },
    {
      id: "active",
      name: "Aktív",
      icon: <Check size={25} weight="bold" />,
    },
    {
      id: "pickup",
      name: "Átvételre vár",
      icon: <HandArrowDown size={25} weight="bold" />,
    },
    {
      id: "late",
      name: "Lejárt",
      icon: <ClockClockwise size={25} weight="bold" />,
    },
    {
      id: "missing",
      name: "Hiányzó leltár",
      icon: <Question size={25} weight="bold" />,
    },
    {
      id: "ended",
      name: "Lezárt",
      icon: <Archive size={25} weight="bold" />,
    },
  ];

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const markRental = (rentalID, status) => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/rentals/${rentalID}/mark`,
      {
        method: "PUT",
        redirect: "follow",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      }
    ).then((res) => {
      refreshData();

      switch (res.status) {
        case 200:
          refreshData();
          toast.success("Sikeres frissítés!");
          break;
        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };
  return (
    <Layout>
      <MetaData title="Kölcsönzések" />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col gap-5  mx-10">
        <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mt-10 text-center md:text-left">
          Kölcsönzések
        </h1>

        <div className="flex flex-wrap w-full gap-5">
          {filters?.map((f) => {
            return (
              <button
                title={f?.name + " szűrő beállítása"}
                className={`font-semibold px-4 py-2 rounded-lg w-fit ${
                  Filter.id == f.id ? "bg-mint text-white" : "bg-gray-100"
                }`}
                onClick={() => {
                  setFilter({
                    id: f?.id,
                  });
                }}
              >
                {f?.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col overflow-x-scroll min-h-screen">
          <div className="flex justify-center bg-gray-100 font-semibold px-4 py-2 rounded-lg min-w-[700px]">
            <div className="flex-[1] text-left pr-4 ">Státusz</div>
            <div className="flex-[1] text-left px-2 ">Leltári szám</div>
            <div className="flex-[2] text-left px-2 ">Cím</div>
            <div className="flex-[1] text-left px-2 ">Felhasználó</div>
            <div className="flex-[1] text-left px-2 ">Lejárat</div>
            <div className="flex-[1] text-center px-2 ">Funkciók</div>
          </div>
          {rentals
            ?.filter(
              (rental) =>
                rental?.status === Filter?.id ||
                (Filter?.id === "all" && rental?.status != "ended")
            )
            .map((rental) => {
              return (
                <div
                  className={`min-w-[700px] flex justify-center items-center px-4 py-2 my-1 ${
                    rental?.status == "ended" && "disabled opacity-50"
                  }`}
                >
                  <div className="flex-[1]  font-medium px-2 ">
                    {filters?.find((i) => i?.id == rental?.status)?.name}
                  </div>
                  <div className="flex-[1]  font-medium px-2 ">
                    {rental?.inventoryID}
                  </div>
                  <div className="flex-[2]  font-medium px-2 ">
                    {rental?.book?.title}
                  </div>

                  <div className="flex-[1]  font-medium px-2 ">
                    {rental?.user?.name}
                  </div>

                  <div className="flex-[1]  font-medium px-2 ">
                    {moment(rental?.rentalEnd).fromNow()}
                  </div>
                  <div className="flex-[1] flex px-2 gap-2.5 justify-center">
                    {rental?.status == "pickup" && (
                      <button
                        title="Átadás"
                        className="bg-black text-white p-2 rounded-xl"
                        onClick={() => {
                          markRental(rental?.rentalID, "active");
                        }}
                      >
                        <HandArrowDown size={20} weight="bold" />
                      </button>
                    )}

                    {rental?.status == ("active" || "late") && (
                      <button
                        title="Kölcsönzés befejezése"
                        className="bg-mint text-white p-2 rounded-xl"
                        onClick={() => {
                          markRental(rental?.rentalID, "ended");
                        }}
                      >
                        <Check size={20} weight="bold" />
                      </button>
                    )}

                    {rental?.status == "pickup" && (
                      <button
                        title="Elutasítás"
                        className="bg-mint text-white p-2 rounded-xl"
                        onClick={() => {
                          markRental(rental?.rentalID, "ended");
                        }}
                      >
                        <X size={20} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {rentals?.filter(
            (rental) =>
              rental?.status === Filter?.id ||
              (Filter?.id === "all" && rental?.status != "ended")
          )?.length == 0 && (
            <span className="text-xl text-center my-10">Nincs találat!</span>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RentalManagementPage;

export async function getServerSideProps(ctx) {
  try {
    const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const userData = await userRes.json();

    const rentalsRes = await fetch(`${process.env.SERVER_URL}/api/rentals`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const rentalsData = await rentalsRes.json();

    return {
      props: {
        user: userData,
        rentals: rentalsData,
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
