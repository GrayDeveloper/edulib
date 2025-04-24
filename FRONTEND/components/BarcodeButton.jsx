const { X } = require("@phosphor-icons/react/dist/ssr");
const { useState } = require("react");

const scanCode = (code) => {
  if (code?.length < 3) return;

  var codeObj = {
    code: code,
    type: "UNKNOWN",
  };

  //EDULIB CLOSE RENTAL CODE
  if (code?.startsWith("ECR:")) {
    codeObj.type = "ECR";
  }

  //EDULIB PICKUP RENTAL CODE
  if (code?.startsWith("EPR:")) {
    codeObj.type = "EPR";
  }

  if (code?.startsWith("EI:")) {
    codeObj.type = "EI";
    window.open("/books/" + code, "_blank");
  }

  if (code?.startsWith("ECARD:")) {
    codeObj.type = "ECARD";
  }

  if (code?.match(/^[0-9]+$/) && (code?.length === 13 || code?.length === 10)) {
    codeObj.type = "ISBN";
  }

  if (codeObj.type === "UNKNOWN") {
    return;
  }

  return codeObj;
};

const BarcodeButton = ({ markRental, onScan, className }) => {
  if (!markRental) {
    return;
  }
  const [Active, setActive] = useState(false);

  if (!Active) {
    return (
      <button
        className={"button-2 w-fit " + className}
        onClick={() => {
          setActive(true);
        }}
        title="Vonalkód olvasó megnyitása"
      >
        Vonalkód olvasó megnyitása
      </button>
    );
  } else {
    return (
      <div className={"flex items-center gap-5 " + className}>
        <input
          type="text"
          id="barcode"
          name="barcode"
          className="text-input-2"
          autoFocus
          ref={(input) => input && input.focus()}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              const code = scanCode(event.currentTarget.value);

              if (onScan) {
                onScan(code);
              }

              if (code?.type == "EPR") {
                markRental(code?.code?.slice(4), "active");
              }

              if (code?.type == "ECR") {
                markRental(code?.code?.slice(4), "ended");
              }
              event.currentTarget.value = "";
            }
          }}
        />

        <button
          title="Vonalkód olvasó bezárása"
          className="bg-charcoal/10 text-charcoal font-bold p-2.5 rounded-2xl"
          onClick={() => {
            setActive(false);
          }}
        >
          <X size={22} weight="bold" />
        </button>
      </div>
    );
  }
};
module.exports = {
  BarcodeButton,
};
