//Imports

import ErrorHandler from "@/components/Error";
import Layout from "@/components/Layout";
import { Menu } from "@/components/Menu";
import { MetaData } from "@/components/MetaData";
import Link from "next/link";
import { useRouter } from "next/router";

//Custom modules

//AuthorPage
const AuthorPage = ({ user, author, error }) => {
  //Router

  //Hooks

  //Objects

  //Functions
  if (error === 503) return <ErrorHandler statusCode={error} />;

  return (
    <Layout>
      <MetaData title={author?.name} />
      <Menu user={user?.userID ? user : { permission: -1 }} />

      <div className="flex flex-col items-center justify-center gap-5 md:gap-10 mx-4 pt-5 md:py-10 grow">
        <img
          src={
            "https://ui-avatars.com/api/?name=" +
            author?.name +
            "&background=d1d5dc"
          }
          className="w-1/3 md:w-1/6 rounded-full bg-mint"
        />
        <h1 className="text-3xl font-semibold mt-5 md:mt-10">
          {author?.name}

          {author?.birthDate && (
            <span className="text-charcoal/70">
              {" "}
              ({new Date(author?.birthDate)?.getFullYear()}
              {author?.deathDate && (
                <span> - {new Date(author?.deathDate)?.getFullYear()}</span>
              )}
              )
            </span>
          )}
        </h1>

        <div className="flex flex-col gap-5 items-center">
          <p className="text-lg">
            <strong>Elérhető könyvei:</strong>
          </p>

          <div className="text-lg">
            {author?.books?.map((book) => (
              <Link key={book?.bookID} href={`/books/${book?.slug}`}>
                <li key={book.bookID}>
                  {book.title}{" "}
                  <span className="text-charcoal/70">
                    ({new Date(book?.releaseDate)?.getFullYear()})
                  </span>
                </li>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorPage;

export async function getServerSideProps(ctx) {
  try {
    const userRes = await fetch(`${process.env.SERVER_URL}/api/users/me`, {
      headers: {
        cookie: ctx.req.headers?.cookie,
      },
    });
    const user = await userRes.json();

    const authorRes = await fetch(
      `${process.env.SERVER_URL}/api/authors/id/${ctx.params?.authorID}`,
      {
        headers: {
          cookie: ctx.req.headers?.cookie,
        },
      }
    );
    const author = await authorRes.json();

    return {
      props: {
        user: user,
        author: author,
        error: userRes?.status || authorRes?.status,
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
