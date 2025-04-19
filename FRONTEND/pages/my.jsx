//Imports

import ErrorHandler from "@/components/Error";
import LoginPage from "@/components/Login";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import { useRouter } from "next/router";
import Barcode from "react-barcode";
import toast from "react-hot-toast";

//Custom modules

//MyPage
const MyPage = ({ user, error }) => {
  //Router
  const router = useRouter();

  //Hooks

  //Objects

  //Functions
  if (error === 503) return <ErrorHandler statusCode={error} />;

  if (!user.userID) {
    return <LoginPage />;
  }

  const Logout = () => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/logout`, {
      method: "POST",
      redirect: "follow",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      switch (res.status) {
        case 200:
          toast.success("Sikeres kijelentkezés!");
          router.push("/");
          break;

        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col">
      <MetaData title="Profilom" />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col items-center justify-center gap-5 md:gap-10 mx-4 pt-5 md:py-10 grow">
        <img
          src={
            "https://ui-avatars.com/api/?name=" +
            user?.name +
            "&background=d1d5dc"
          }
          className="w-1/3 md:w-1/6 rounded-full bg-mint"
        />
        <h1 className="text-3xl font-semibold mt-5 md:mt-10">{user?.name}</h1>
        <p className="text-lg">
          <strong>Email:</strong> {user?.email}
        </p>

        {/*  <div className="w-fit overflow-hidden rounded-xl">
          <Barcode
            value={"ELU:" + user?.userID}
            displayValue={false}
            margin={0}
            className="m-0 p-0"
          />
        </div> */}

        <button onClick={Logout} className="button-2" title="Kijelentkezés">
          Kijelentkezés
        </button>
      </div>
    </div>
  );
};

export default MyPage;

export async function getServerSideProps(ctx) {
  try {
    const res = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const data = await res.json();
    return {
      props: {
        user: data,
        error: res?.status,
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
