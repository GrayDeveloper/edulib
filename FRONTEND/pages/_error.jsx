import ErrorHandler from "@/components/Error";
import { MetaData } from "@/components/MetaData";
import Link from "next/link";

function Error({ statusCode }) {
  return <ErrorHandler statusCode={statusCode} />;
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
