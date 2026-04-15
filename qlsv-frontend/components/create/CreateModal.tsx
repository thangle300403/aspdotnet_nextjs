"use client";

import { Form, Formik } from "formik";
import { AnyObjectSchema } from "yup";

type BaseFieldConfig<Values> = {
  name: keyof Values & string;
  label: string;
};

type InputFieldConfig<Values> = BaseFieldConfig<Values> & {
  type: "text" | "date" | "number";
  min?: number;
  max?: number;
};

type SelectFieldConfig<Values> = BaseFieldConfig<Values> & {
  type: "select";
  options: Array<{
    label: string;
    value: string;
  }>;
};

export type CreateFieldConfig<Values> =
  | InputFieldConfig<Values>
  | SelectFieldConfig<Values>;

type CreateModalProps<Values extends Record<string, string | number>> = {
  isOpen: boolean;
  title: string;
  initialValues: Values;
  validationSchema: AnyObjectSchema;
  fields: CreateFieldConfig<Values>[];
  isSubmitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (values: Values) => Promise<void>;
};

function getFieldError<Values extends Record<string, string | number>>(
  fieldName: keyof Values & string,
  touched: Partial<Record<keyof Values, boolean>>,
  errors: Partial<Record<keyof Values, string>>,
) {
  if (!touched[fieldName] || !errors[fieldName]) {
    return "";
  }

  return errors[fieldName] ?? "";
}

export default function CreateModal<
  Values extends Record<string, string | number>,
>({
  isOpen,
  title,
  initialValues,
  validationSchema,
  fields,
  isSubmitting,
  submitLabel = "Save",
  submittingLabel = "Saving...",
  errorMessage,
  onClose,
  onSubmit,
}: CreateModalProps<Values>) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={async (values, helpers) => {
            try {
              await onSubmit(values);
              helpers.resetForm();
            } catch {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-4">
              {fields.map((field) => {
                const fieldError = getFieldError(
                  field.name,
                  touched as Partial<Record<keyof Values, boolean>>,
                  errors as Partial<Record<keyof Values, string>>,
                );

                return (
                  <div key={field.name}>
                    <label className="mb-1 block text-sm font-medium">
                      {field.label}
                    </label>

                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={String(values[field.name] ?? "")}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        min={field.min}
                        max={field.max}
                        value={values[field.name]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      />
                    )}

                    {fieldError && (
                      <p className="mt-1 text-sm text-red-600">{fieldError}</p>
                    )}
                  </div>
                );
              })}

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSubmitting ? submittingLabel : submitLabel}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
