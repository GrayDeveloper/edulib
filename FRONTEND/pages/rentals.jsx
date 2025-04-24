//Imports

//Custom modules
import ErrorHandler from "@/components/Error";
import LoginPage from "@/components/Login";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import Link from "next/link";

//RentalsPage
const RentalsPage = ({ user, rentals, error }) => {
  //Router

  //Hooks

  //Objects

  //Functions

  if (error?.user) return <ErrorHandler statusCode={error?.user} />;

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col">
      <MetaData title="Kölcsönzött" />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col gap-10">
        <h1 className="text-2xl md:text-3xl text-charcoal font-semibold mx-10 mt-10 text-center md:text-left">
          Kölcsönzött könyvek: {rentals?.limit} / {rentals?.list?.length}
        </h1>

        <div className="flex flex-wrap gap-10 mx-10 mb-10">
          {Array(rentals?.limit)
            .fill(0)
            ?.map((_, i) => {
              if (i < rentals?.list?.length) {
                const rental = rentals?.list?.[i];

                return (
                  <Link
                    href={"/books/" + rental?.book?.slug}
                    key={i}
                    className="w-full md:w-64"
                  >
                    <img
                      src={
                        rental?.book?.cover ||
                        "https://placehold.co/248x350/709e87/FFF?font=playfair-display&text=" +
                          rental?.book?.title
                      }
                      className="rounded-3xl w-full aspect-[1/1.414] bg-cover bg-center"
                    />
                  </Link>
                );
              }
              return (
                <div
                  class="bg-charcoal/10 rounded-3xl  w-full md:w-64 aspect-[1/1.414]"
                  key={i}
                ></div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default RentalsPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  const dataRes = await fetch(`${process.env.SERVER_URL}/api/rentals/my`, {
    headers: { cookie },
  });
  const data = dataRes.ok ? await dataRes.json() : null;

  return {
    props: {
      user: userData,
      rentals: data,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
        rentals: dataRes.status !== 200 ? dataRes.status : null,
      },
    },
  };
}
