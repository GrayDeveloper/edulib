//Imports
import LoginModule from "@/components/Login";
import { useRouter } from "next/router";
import { useEffect } from "react";

//Custom modules

//LoginPage
const LoginPage = ({ user, error }) => {
  //Router
  const router = useRouter();

  //Hooks

  //Objects

  //Functions
  if (!user) return <LoginModule />;
  if (error) return <ErrorHandler statusCode={error} />;

  //didComponentMount

  return useEffect(() => {
    router.replace("/");
  }, []);
};

export default LoginPage;

export async function getServerSideProps(ctx) {
  try {
    const res = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: { cookie: ctx.req.headers?.cookie },
    });

    if (!res.ok) throw new Error(res.status); // Handle non-200 responses

    const user = await res.json();
    return { props: { user, error: false } };
  } catch (error) {
    return { props: { user: null, error: error.message } };
  }
}
