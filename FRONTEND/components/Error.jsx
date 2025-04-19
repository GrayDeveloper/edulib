import { useRouter } from "next/router";
import { MetaData } from "./MetaData";
import Link from "next/link";

const codeLookup = {
  401: "Nincs jogosultságod az oldal megtekintéséhez!",
  403: "Hozzáférés megtagadva!",
  404: "Az oldal nem található...",
  500: "Valami hiba történt...",
  503: "Szerver nem elérhető...",
};

const ErrorHandler = ({ statusCode }) => {
  const router = useRouter();
  return (
    <div className="min-h-screen w-screen bg-white flex flex-col items-center justify-center gap-12">
      <MetaData title={codeLookup[statusCode] || "Ismeretlen hiba..."} />

      <Link href="/" className="top-4 left-4 absolute">
        <img src="/logo.svg" className="w-16" />
      </Link>
      <img src="/doodles/MessyDoodle.svg" className="w-1/2 md:w-1/5" />

      <p className="text-3xl font-bold text-charcoal">Eltévedtél?</p>
      <p className="text-2xl text-charcoal/75 text-center">
        {codeLookup[statusCode] || "Ismeretlen hiba..."}
      </p>

      <div className="flex flex-row gap-5 text-charcoal/90 mt-10">
        <button
          title="Vissza az előző oldalra"
          type="button"
          className="text-xl font-semibold"
          onClick={() => router.back()}
        >
          • Vissza
        </button>
        <Link className="text-xl font-semibold" href="/">
          • Kezdőlap
        </Link>
      </div>
    </div>
  );
};

export default ErrorHandler;
