"use client";

import { useEffect, useState } from "react";
import * as Yup from "yup";
import DataTable, { DataTableColumn } from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import CreateModal, {
  CreateFieldConfig,
} from "../../components/create/CreateModal";
import DeleteModal from "../../components/delete/DeleteModal";
import EditModal from "../../components/edit/EditModal";
import { buildApiUrl, getErrorMessage } from "../../lib/authFetch";
import { toast } from "react-toastify";

export type Subject = {
  id: number;
  name: string;
  number_of_credit: number;
};

type SubjectCreatePayload = {
  name: string;
  number_of_credit: number;
};

const defaultSubjectPayload: SubjectCreatePayload = {
  name: "",
  number_of_credit: 1,
};

const subjectCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less.")
    .required("Name is required."),
  number_of_credit: Yup.number()
    .typeError("Number of credits must be a number.")
    .integer("Number of credits must be an integer.")
    .min(1, "Number of credits must be at least 1.")
    .max(3, "Number of credits must be at most 3.")
    .required("Number of credits is required."),
});

const subjectCreateFields: CreateFieldConfig<SubjectCreatePayload>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
  },
  {
    name: "number_of_credit",
    label: "Number of credits",
    type: "number",
    min: 1,
    max: 3,
  },
];

const subjectEditSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less.")
    .required("Name is required."),
  number_of_credit: Yup.number()
    .typeError("Number of credits must be a number.")
    .integer("Number of credits must be an integer.")
    .min(1, "Number of credits must be at least 1.")
    .max(3, "Number of credits must be at most 3.")
    .required("Number of credits is required."),
});

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; subject: Subject }
  | { type: "delete"; subject: Subject };

export default function SubjectPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: DataTableColumn<Subject>[] = [
    { key: "id", header: "ID", render: (subject) => subject.id },
    { key: "name", header: "Name", render: (subject) => subject.name },
    {
      key: "number_of_credit",
      header: "Number of credits",
      render: (subject) => subject.number_of_credit,
    },
  ];

  const fetchSubjects = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/subject?page=${page}`));
      const result = await response.json();
      setSubjects(Array.isArray(result.data) ? result.data : []);
      setTotalPages(result.totalPages ?? 1);
    } catch {
      setSubjects([]);
      setTotalPages(1);
    }
  };

  const handleCreateSubject = async (values: SubjectCreatePayload) => {
    setCreateError("");
    setIsCreating(true);

    try {
      const response = await fetch(buildApiUrl("/api/subject"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          number_of_credit: Number(values.number_of_credit),
        }),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Tao subject that bai.",
        );
        throw new Error(message);
      }

      toast.success("Subject created successfully!");
      closeModal();
      await fetchSubjects();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Tao subject that bai.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSubject = async (values: SubjectCreatePayload) => {
    if (modal.type !== "edit") {
      return;
    }

    setUpdateError("");
    setIsUpdating(true);

    try {
      const response = await fetch(
        buildApiUrl(`/api/subject/${modal.subject.id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            name: values.name.trim(),
            number_of_credit: Number(values.number_of_credit),
          }),
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Cap nhat subject that bai.",
        );
        throw new Error(message);
      }

      toast.success("Subject updated successfully!");
      closeModal();
      await fetchSubjects();
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Cap nhat subject that bai.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (modal.type !== "delete") {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        buildApiUrl(`/api/subject/${modal.subject.id}`),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Xoa subject that bai.",
        );
        throw new Error(message);
      }

      toast.success("Subject deleted successfully!");
      closeModal();
      await fetchSubjects();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Xoa subject that bai.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setModal({ type: "none" });
    setCreateError("");
    setUpdateError("");
    setDeleteError("");
  };

  const handleAdd = () => {
    setCreateError("");
    setModal({ type: "add" });
  };

  const handleEdit = (subject: Subject) => {
    setUpdateError("");
    setModal({ type: "edit", subject });
  };

  const handleDelete = (subject: Subject) => {
    setDeleteError("");
    setModal({ type: "delete", subject });
  };

  const editInitialValues: SubjectCreatePayload =
    modal.type === "edit"
      ? {
          name: modal.subject.name,
          number_of_credit: modal.subject.number_of_credit,
        }
      : defaultSubjectPayload;

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Subject List</h1>
      <DataTable
        columns={columns}
        rows={subjects}
        rowKey={(subject) => subject.id}
        emptyText="No subjects found."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((current) => current - 1)}
        onNext={() => setPage((current) => current + 1)}
      />
      <CreateModal
        isOpen={modal.type === "add"}
        title="Add Subject"
        initialValues={defaultSubjectPayload}
        validationSchema={subjectCreateSchema}
        fields={subjectCreateFields}
        isSubmitting={isCreating}
        errorMessage={createError}
        onClose={closeModal}
        onSubmit={handleCreateSubject}
      />
      <EditModal
        isOpen={modal.type === "edit"}
        title="Edit Subject"
        initialValues={editInitialValues}
        validationSchema={subjectEditSchema}
        fields={subjectCreateFields}
        isSubmitting={isUpdating}
        errorMessage={updateError}
        onClose={closeModal}
        onSubmit={handleUpdateSubject}
      />
      <DeleteModal
        isOpen={modal.type === "delete"}
        title="Delete Subject"
        itemLabel="mon hoc"
        itemName={modal.type === "delete" ? modal.subject.name : ""}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
