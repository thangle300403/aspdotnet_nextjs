"use client";

import { AnyObjectSchema } from "yup";
import CreateModal, { CreateFieldConfig } from "../create/CreateModal";

type EditModalProps<Values extends Record<string, string | number>> = {
  isOpen: boolean;
  title: string;
  initialValues: Values;
  validationSchema: AnyObjectSchema;
  fields: CreateFieldConfig<Values>[];
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (values: Values) => Promise<void>;
};

export default function EditModal<
  Values extends Record<string, string | number>,
>({
  isOpen,
  title,
  initialValues,
  validationSchema,
  fields,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: EditModalProps<Values>) {
  return (
    <CreateModal
      isOpen={isOpen}
      title={title}
      initialValues={initialValues}
      validationSchema={validationSchema}
      fields={fields}
      isSubmitting={isSubmitting}
      submitLabel="Update"
      submittingLabel="Saving..."
      errorMessage={errorMessage}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
