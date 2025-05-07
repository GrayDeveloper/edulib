//Imports
import { Dialog, DialogPanel } from "@headlessui/react";
import { Field, Formik } from "formik";

//Custom modules

//EditInventoryModal
const EditInventoryModal = ({ inventory, onClose, onSubmit }) => {
  //Router

  //Hooks

  //Objects
  const statusTable = [
    {
      id: "available",
      name: "Elérhető",
      style: "bg-gray-200 font-semibold",
    },
    {
      id: "missing",
      name: "Hiányzó",
      style: "bg-warmcoal text-white font-semibold",
    },
    {
      id: "damaged",
      name: "Sérült",
      style: "bg-deepteal text-white font-semibold",
    },
  ];

  //Functions
  if (!inventory) return;

  return (
    <Dialog transition open={true} onClose={onClose} className="relative z-50 ">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm bg-black/30">
        <DialogPanel className="w-full md:w-2/3 bg-white p-10 rounded-3xl text-center ">
          <Formik initialValues={inventory} onSubmit={onSubmit}>
            {(formik) => (
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col items-center gap-10 w-full transition-all"
              >
                <h1 className="font-semibold italic text-2xl">
                  {inventory?.inventoryID
                    ? "Példány státuszának módosítása"
                    : "Új példány felvétele"}
                </h1>
                <span className="font-semibold text-xl">
                  {inventory?.book?.title}
                </span>

                <span className="font-semibold text-xl">
                  Leltári szám: {inventory?.inventoryID}
                </span>

                <Field
                  as="select"
                  name="status"
                  className="text-input-3 w-w-full"
                >
                  <option disabled selected>
                    Válassza ki a példány állapotát!
                  </option>
                  {statusTable?.map((s) => {
                    return <option value={s?.id}>{s?.name}</option>;
                  })}
                </Field>

                {formik.touched.status && formik.errors.status ? (
                  <p className="field-error-1">{formik.errors.status}</p>
                ) : null}

                <button className="button-2 my-auto" title="Mentés">
                  Mentés
                </button>
              </form>
            )}
          </Formik>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default EditInventoryModal;
