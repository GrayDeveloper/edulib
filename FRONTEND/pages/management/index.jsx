//Imports
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
ChartJS.register(ArcElement, Tooltip);

import ErrorHandler from "@/components/Error";
import Layout from "@/components/Layout";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import {
  Archive,
  Barcode,
  BookBookmark,
  Books,
  Funnel,
  Pencil,
  User,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Pie } from "react-chartjs-2";

//Custom modules

//ManagementPage
const ManagemenetPage = ({ user, stats, error }) => {
  //Router

  //Hooks

  //Objects
  const pages = [
    {
      id: "books",
      name: "Könyvek",
      icon: <Books size={25} weight="bold" />,
    },
    {
      id: "users",
      name: "Felhasználók",
      icon: <User size={25} weight="bold" />,
    },
    {
      id: "rentals",
      name: "Kölcsönzések",
      icon: <BookBookmark size={25} weight="bold" />,
    },
    {
      id: "inventory",
      name: "Leltár",
      icon: <Archive size={25} weight="bold" />,
    },
    {
      id: "authors",
      name: "Szerzők",
      icon: <Pencil size={25} weight="bold" />,
    },
    {
      id: "genres",
      name: "Műfajok",
      icon: <Funnel size={25} weight="bold" />,
    },
    {
      id: "barcode",
      name: "Vonalkód",
      icon: <Barcode size={25} weight="bold" />,
    },
  ];

  const backgroundColors = [
    "#709e87",
    "#3b6f60",
    "#dc6f4a",
    "#cb8e88",
    "#c1a264",
    "#596e66",
  ];

  //Functions

  if (error?.protected) {
    return <ErrorHandler statusCode={error?.protected} />;
  }

  if (error?.user) {
    return <ErrorHandler statusCode={error?.user} />;
  }

  return (
    <Layout>
      <MetaData title="Könyvtár" />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col gap-10">
        <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mx-10 mt-10 text-center md:text-left">
          Szép napot, {user?.name}!
        </h1>

        <div className="mx-10">
          <div className="flex flex-col md:flex-row justify-around gap-10">
            {pages?.map((page) => {
              return (
                <Link
                  href={"/management/" + page?.id}
                  key={page?.id}
                  className="bg-gray-100 w-full flex flex-col gap-2.5 items-center justify-center py-5 rounded-2xl hover:scale-105 transition-all"
                >
                  {page?.icon}
                  <span className="font-semibold">{page?.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mx-10 mt-10 text-center md:text-left">
          Könyvtár statisztikái:
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/6 px-10 text-center">
            <Pie
              data={{
                labels: ["Elérhető", "Kölcsönzött"],
                datasets: [
                  {
                    data: [stats?.availableBooks, stats?.unavailableBooks],
                    backgroundColor: backgroundColors,
                    borderColor: "#f0f4f2",
                    borderWidth: 2.5,
                  },
                ],
              }}
              options={{
                responsive: true,
                animation: false,
              }}
            />
            <span className="italic ">
              Kölcsönzött illetve elérhető könyvek aránya
            </span>
          </div>

          <div className="w-full md:w-1/6 px-10 text-center ">
            <Pie
              data={{
                labels: ["Felhasználók", "Kölcsönzött"],
                datasets: [
                  {
                    data: [stats?.totalUsers, stats?.activeRentals],
                    backgroundColor: backgroundColors,
                    borderColor: "#f0f4f2",
                    borderWidth: 2.5,
                  },
                ],
              }}
              options={{
                responsive: true,
                animation: false,
              }}
            />
            <span className="italic ">
              Felhasználók és aktív kölcsönzések aránya
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagemenetPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const statsRes = await fetch(`${process.env.SERVER_URL}/api/library/stats`, {
    headers: { cookie },
  });
  const statsData = statsRes.ok ? await statsRes.json() : null;

  return {
    props: {
      user: userData,
      stats: statsData,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
        protected: statsRes.status !== 200 ? statsRes.status : null,
      },
    },
  };
}
