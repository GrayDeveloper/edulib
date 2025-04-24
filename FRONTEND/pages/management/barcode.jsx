//Imports

import { BarcodeButton } from "@/components/BarcodeButton";
import ErrorHandler from "@/components/Error";
import Layout from "@/components/Layout";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import { useState } from "react";
import toast from "react-hot-toast";

//Custom modules

//ScannerPage
const ScannerPage = ({ user, error }) => {
  //Router

  //Hooks
  const [history, setHistory] = useState([]);

  //Objects

  //Functions
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
      switch (res.status) {
        case 200:
          toast.success("Sikeres frissítés!");
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
    <Layout>
      <MetaData title="Barcode szkenner" />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col gap-5  mx-10">
        <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mt-10 text-center md:text-left">
          Vonalkód olvasó
        </h1>
        <BarcodeButton
          markRental={markRental}
          onScan={(data) => {
            if (history.length > 8) {
              setHistory((prev) => [...prev.slice(1), data]);
            } else {
              setHistory((prev) => [...prev, data]);
            }
          }}
        />

        {history?.length > 0 && (
          <div className="flex flex-col-reverse bg-gray-100 rounded-2xl p-5 gap-2.5">
            {history?.map((item, index) => (
              <div key={index} className="">
                <h2 className="text-xl font-semibold">
                  {item?.code ? item?.code : "Hibás kód"}
                </h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ScannerPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const dataRes = await fetch(`${process.env.SERVER_URL}/api/rentals`, {
    headers: { cookie },
  });
  const data = dataRes.ok ? await dataRes.json() : null;

  return {
    props: {
      user: userData,
      rentals: data,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
        protected: dataRes.status !== 200 ? dataRes.status : null,
      },
    },
  };
}
