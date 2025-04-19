//Imports

//Custom modules
import LoginPage from "@/components/Login";
import ErrorPage from "@/components/Error";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useState } from "react";

//ScannerPage
const ScannerPage = ({ user, error }) => {
  //Router

  //Hooks
  const [Data, setData] = useState();

  //Objects

  //Functions

  return (
    <>
      <BarcodeScannerComponent
        width={500}
        height={500}
        onUpdate={(err, result) => {
          if (result) setData(result.text);
          else setData("Not Found");
        }}
      />{" "}
      {Data}a
    </>
  );
};

export default ScannerPage;
