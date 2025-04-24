//Imports
import { Dialog, DialogPanel } from "@headlessui/react";
import { Field, Formik } from "formik";
import * as yup from "yup";

//Custom modules
const bookScheme = yup.object().shape({
  title: yup
    .string()
    .min(4, "A címnek legalább 4 karakter hosszúnak kell lennie!")
    .max(45, "A cím maximum 45 karakter hosszú lehet!")
    .required("Cím megadása kötelező!"),
  description: yup
    .string()
    .min(4, "A leírásnak legalább 4 karakter hosszúnak kell lennie!")
    .max(255, "A leírás maximum 255 karakter hosszú lehet!")
    .required("Leírás megadása kötelező!"),
  releaseDate: yup.date().notRequired(),
  cover: yup.string().notRequired(),
  ISBN: yup
    .string()
    .min(10, "ISBN legalább 10 karakter hosszúnak kell lennie!")
    .max(13, "ISBN maximum 13 karakter hosszú lehet!")
    .notRequired(),
  genreID: yup.number().required("GenreID megadása kötelező!"),
  authorID: yup.number().required("AuthorID megadása kötelező!"),
});

//EditBookModal
const EditBookModal = ({ bookData, authors, genres, onClose, onSubmit }) => {
  //Router

  //Hooks

  //Objects

  //Functions
  if (!bookData) return;

  return (
    <Dialog transition open={true} onClose={onClose} className="relative z-50 ">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm bg-black/30">
        <DialogPanel className="w-full md:w-2/3 bg-white p-10 rounded-3xl text-center ">
          <Formik
            initialValues={bookData}
            validationSchema={bookScheme}
            onSubmit={onSubmit}
          >
            {(formik) => (
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col items-center gap-10 w-full transition-all"
              >
                <h1 className="font-semibold italic text-2xl">
                  {bookData?.bookID
                    ? "Könyv szerkesztése"
                    : "Új könyv feltöltése"}
                </h1>
                <Field
                  id="title"
                  name="title"
                  placeholder="Cím"
                  className="w-full text-input-3"
                  type="text"
                />
                {formik.touched.title && formik.errors.title ? (
                  <p className="field-error-1">{formik.errors.title}</p>
                ) : null}

                <Field
                  id="description"
                  name="description"
                  placeholder="Leírás"
                  className="w-full text-input-3"
                  as="textarea"
                />
                {formik.touched.description && formik.errors.description ? (
                  <p className="field-error-1">{formik.errors.description}</p>
                ) : null}

                <Field
                  id="releaseDate"
                  name="releaseDate"
                  placeholder="Kiadás éve"
                  className="w-full text-input-3"
                  type="date"
                />
                {formik.touched.releaseDate && formik.errors.releaseDate ? (
                  <p className="field-error-1">{formik.errors.releaseDate}</p>
                ) : null}

                <Field
                  id="ISBN"
                  name="ISBN"
                  placeholder="ISBN"
                  className="w-full text-input-3"
                  type="text"
                />
                {formik.touched.ISBN && formik.errors.ISBN ? (
                  <p className="field-error-1">{formik.errors.ISBN}</p>
                ) : null}

                <div className="flex flex-col md:flex-row gap-10 ">
                  <Field
                    as="select"
                    name="authorID"
                    className="text-input-3 w-w-full"
                  >
                    <option disabled selected>
                      Válassz szerzőt!
                    </option>
                    {authors
                      ?.sort((a, b) => a?.author.localeCompare(b?.author))
                      ?.map((author) => {
                        return (
                          <option value={author?.authorID}>
                            {author?.author}
                          </option>
                        );
                      })}
                  </Field>

                  {formik.touched.authorID && formik.errors.authorID ? (
                    <p className="field-error-1">{formik.errors.authorID}</p>
                  ) : null}

                  <Field
                    as="select"
                    name="genreID"
                    className="text-input-3 w-w-full"
                  >
                    <option disabled selected>
                      Válassz kategóriát!
                    </option>
                    {genres
                      /*  ?.sort((a, b) => a?.author.localeCompare(b?.author)) */
                      ?.map((g) => {
                        return <option value={g?.genreID}>{g?.name}</option>;
                      })}
                  </Field>

                  {formik.touched.genreID && formik.errors.genreID ? (
                    <p className="field-error-1">{formik.errors.genreID}</p>
                  ) : null}
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

export default EditBookModal;
