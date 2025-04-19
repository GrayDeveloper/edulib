//Imports
import Head from "next/head";

//Module
const MetaData = ({ title, prefix_off, description, url }) => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#719482" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="favicon.ico" />

        <title>{prefix_off ? title : `EduLIB / ${title}`}</title>
        <meta name="title" content={prefix_off ? title : `EduLIB / ${title}`} />
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta
          property="og:title"
          content={prefix_off ? title : `EduLIB / ${title}`}
        />
        <meta property="og:description" content={description} />
        <meta name="robots" content="noindex"></meta>
      </Head>
    </>
  );
};

export { MetaData };
