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
  if (error?.user) return <ErrorHandler statusCode={error} />;

  return useEffect(() => {
    router.replace("/");
  }, []);
};

export default LoginPage;

export async function getServerSideProps(ctx) {
  const cookie = ctx.req.headers?.cookie;

  const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
    headers: { cookie },
  });
  const userData = userRes.ok ? await userRes.json() : null;

  return {
    props: {
      user: userData,
      error: {
        user: userRes.status !== 200 ? userRes.status : null,
      },
    },
  };
}
