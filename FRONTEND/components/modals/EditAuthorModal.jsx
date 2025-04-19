//Imports
import { Dialog, DialogPanel } from "@headlessui/react";
import { Field, Formik } from "formik";

//Custom modules

//EditAuthorModal
const EditAuthorModal = ({ authorData, onClose, onSubmit }) => {
  //Router

  //Hooks

  //Objects

  //Functions
  if (!authorData) return;

  return (
    <Dialog transition open={true} onClose={onClose} className="relative z-50 ">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm bg-black/30">
        <DialogPanel className="w-full md:w-2/3 bg-white p-10 rounded-3xl text-center ">
          <Formik initialValues={authorData} onSubmit={onSubmit}>
            {(formik) => (
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col items-center gap-10 w-full transition-all"
              >
                <h1 className="font-semibold italic text-2xl">
                  {authorData?.authorID
                    ? "Szerző adatainak módosítása"
                    : "Új szerző felvétele"}
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
                  id="birthDate"
                  name="birthDate"
                  placeholder="Születés"
                  className="w-full text-input-3"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                />
                {formik.touched.birthDate && formik.errors.birthDate ? (
                  <p className="field-error-1">{formik.errors.birthDate}</p>
                ) : null}

                <Field
                  id="deathDate"
                  name="deathDate"
                  placeholder="Halál"
                  className="w-full text-input-3"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                />
                {formik.touched.deathDate && formik.errors.deathDate ? (
                  <p className="field-error-1">{formik.errors.deathDate}</p>
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

export default EditAuthorModal;
