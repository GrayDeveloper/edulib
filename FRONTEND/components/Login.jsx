//Imports
import { MetaData } from "@/components/MetaData";
import Link from "next/link";
import { Formik, Field, Form } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as yup from "yup";
import { useRouter } from "next/router";

//Custom modules

//LoginModule
const LoginModule = () => {
  //Router
  const router = useRouter();

  //Hooks
  /*   useEffect(() => {
    if (true) {
      router.replace("/"); // Redirect to home if logged in
    }
  }, [true, router]); */

  const [SignupMode, setSignupMode] = useState(false);

  //Objects
  const SignupScheme = yup.object().shape({
    email: yup
      .string()
      .email("Valós email címet adj meg!")
      .required("Email cím megadása kötelező!"),
    name: yup
      .string()
      .min(4, "A névnek legalább 4 karakter hosszúnak kell lennie!")
      .required("Név megadása kötelező!"),
    password: yup
      .string()
      .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie!")
      .required("Jelszó megadása kötelező!"),
    passwordAgain: yup
      .string()
      .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie!")
      .required("Jelszó megadása kötelező!")
      .oneOf([yup.ref("password"), null], "A jelszavaknak egyezniük kell!"),
  });

  const LoginScheme = yup.object().shape({
    email: yup
      .string()
      .email("Valós email címet adj meg!")
      .required("Email cím megadása kötelező!"),
    password: yup
      .string()
      .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie!")
      .required("Jelszó megadása kötelező!"),
  });

  //Functions
  const refreshData = () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
  };

  const Signup = (name, email, password, passwordAgain) => {
    if (password !== passwordAgain) {
      toast.error("A jelszavak nem egyeznek!");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/signup`, {
      method: "POST",
      redirect: "follow",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        name: name,
      }),
    }).then((res) => {
      switch (res.status) {
        case 200:
          refreshData();
          toast.success("Sikeres regisztráció!");
          break;

        case 409:
          toast.error("Ez az email cím már használatban van!");
          break;

        default:
          toast.error("Hiba történt!");
          break;
      }
    });
  };

  const Login = (email, password) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`, {
      method: "POST",
      redirect: "follow",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    }).then((res) => {
      switch (res.status) {
        case 200:
          refreshData();
          toast.success("Sikeres bejelentkezés!");
          break;

        default:
          toast.error("Hibás email vagy jelszó!");
          break;
      }
    });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-evenly bg-softmint px-10">
      <MetaData title="Bejelentkezés" />
      <Link href="/" className="w-1/3 md:w-48 transition-all">
        <img src="/logo.svg"></img>
      </Link>

      <Formik
        initialValues={
          SignupMode
            ? { name: "", email: "", password: "", passwordAgain: "" }
            : { email: "", password: "" }
        }
        validationSchema={SignupMode ? SignupScheme : LoginScheme}
        onSubmit={(values) => {
          if (SignupMode) {
            Signup(
              values?.name,
              values?.email,
              values?.password,
              values?.passwordAgain
            );
          } else {
            Login(values?.email, values?.password);
          }
        }}
      >
        {(formik) => (
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col items-center gap-10 w-full md:w-3/4 lg:w-1/2 xl:w-1/3 transition-all"
          >
            {SignupMode && (
              <>
                <Field
                  id="name"
                  name="name"
                  placeholder="Név"
                  className="w-full text-input-1"
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="field-error-1">{formik.errors.name}</p>
                ) : null}
              </>
            )}

            <Field
              id="email"
              name="email"
              placeholder="Email"
              className="w-full text-input-1"
              type="email"
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="field-error-1">{formik.errors.email}</p>
            ) : null}

            <Field
              id="password"
              name="password"
              placeholder="Jelszó"
              className="w-full text-input-1"
              type="password"
            />

            {formik.touched.password && formik.errors.password ? (
              <p className="field-error-1">{formik.errors.password}</p>
            ) : null}

            {SignupMode && (
              <>
                <Field
                  id="passwordAgain"
                  name="passwordAgain"
                  placeholder="Jelszó újra"
                  className="w-full text-input-1"
                  type="password"
                />
                {formik.touched.passwordAgain && formik.errors.passwordAgain ? (
                  <p className="field-error-1">{formik.errors.passwordAgain}</p>
                ) : null}
              </>
            )}
            <div className="w-full flex flex-col flex-wrap md:flex-nowrap md:flex-row justify-between gap-5">
              <button
                title={SignupMode ? "Bejelentkezés" : "Regisztráció"}
                type="button"
                className="button-1 w-full cursor-pointer"
                onClick={() => setSignupMode(!SignupMode)}
              >
                {SignupMode ? "Bejelentkezés" : "Regisztráció"}
              </button>

              <button
                type="submit"
                className="button-2 w-full cursor-pointer"
                title={SignupMode ? "Regisztráció" : "Bejelentkezés"}
              >
                {SignupMode ? "Regisztráció" : "Bejelentkezés"}
              </button>
            </div>

            <p className="text-sm  text-charcoal/80">
              A regisztrációval elfogadod a{" "}
              <span className="font-bold">Felhasználási feltételeket</span> és
              az <span className="font-bold">Adatvédelmi szabályzatot.</span>{" "}
              <br />
              <br />A weboldal használatával elfogadod, hogy a weboldal
              munkamenethez és bejelentkezéshez szükséges sütiket használ. Nem
              használunk nyomkövető sütiket.
            </p>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default LoginModule;
