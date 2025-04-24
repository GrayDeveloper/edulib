//Imports
import { Dialog, DialogPanel } from "@headlessui/react";
import { Field, Formik } from "formik";

//Custom modules

//EditUserModal
const EditUserModal = ({ userData, onClose, onSubmit }) => {
  //Router

  //Hooks

  //Objects
  const permissionTable = ["Felhasználó", "Könyvtáros", "Adminisztrátor"];
  const statusTable = {
    suspended: "Felfüggesztett",
    active: "Aktív",
    deleted: "Törölve",
  };

  //Functions
  if (!userData) return;

  return (
    <Dialog transition open={true} onClose={onClose} className="relative z-50 ">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm bg-black/30">
        <DialogPanel className="w-full md:w-2/3 bg-white p-10 rounded-3xl text-center ">
          <Formik
            initialValues={userData}
            /* validationSchema={bookScheme} */
            onSubmit={onSubmit}
          >
            {(formik) => (
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col items-center gap-10 w-full transition-all"
              >
                <h1 className="font-semibold italic text-2xl">
                  Felhasználó adatainak módosítása
                </h1>
                <Field
                  id="name"
                  name="name"
                  placeholder="Név"
                  className="w-full text-input-3"
                  type="text"
                />

                {formik.touched.name && formik.errors.name ? (
                  <p className="field-error-1">{formik.errors.name}</p>
                ) : null}

                <Field
                  id="email"
                  name="email"
                  placeholder="Email"
                  className="w-full text-input-3"
                  type="email"
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="field-error-1">{formik.errors.email}</p>
                ) : null}

                <div className="flex flex-col md:flex-row gap-10 ">
                  <Field as="select" name="permission" className="text-input-3">
                    <option value={0}>{permissionTable[0]}</option>
                    <option value={1}>{permissionTable[1]}</option>
                    <option value={2}>{permissionTable[2]}</option>
                  </Field>
                  <Field as="select" name="status" className="text-input-3">
                    <option value={"active"}>{statusTable.active}</option>
                    <option value={"suspended"}>{statusTable.suspended}</option>
                    <option value={"deleted"}>{statusTable.deleted}</option>
                  </Field>
                </div>

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

export default EditUserModal;
