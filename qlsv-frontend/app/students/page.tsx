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
import { apiFetch, buildApiUrl, getErrorMessage } from "../../lib/authFetch";
import { toast } from "react-toastify";

export type Student = {
  id: number;
  name: string;
  gender: string;
  birthday: string;
};

type StudentCreatePayload = {
  name: string;
  gender: string;
  birthday: string;
};

const defaultStudentPayload: StudentCreatePayload = {
  name: "",
  gender: "male",
  birthday: "",
};

const studentCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less.")
    .required("Name is required."),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Gender is invalid.")
    .required("Gender is required."),
  birthday: Yup.date()
    .typeError("Birthday is invalid.")
    .max(new Date(), "Birthday cannot be in the future.")
    .required("Birthday is required."),
});

const studentCreateFields: CreateFieldConfig<StudentCreatePayload>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
  },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { label: "male", value: "male" },
      { label: "female", value: "female" },
      { label: "other", value: "other" },
    ],
  },
  {
    name: "birthday",
    label: "Birthday",
    type: "date",
  },
];

const studentEditSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less.")
    .required("Name is required."),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Gender is invalid.")
    .required("Gender is required."),
  birthday: Yup.date()
    .typeError("Birthday is invalid.")
    .max(new Date(), "Birthday cannot be in the future.")
    .required("Birthday is required."),
});

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; student: Student }
  | { type: "delete"; student: Student };

function normalizeGender(gender: string) {
  const normalized = gender.trim().toLowerCase();
  return ["male", "female", "other"].includes(normalized)
    ? normalized
    : "other";
}

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const columns: DataTableColumn<Student>[] = [
    { key: "id", header: "ID", render: (student) => student.id },
    { key: "name", header: "Name", render: (student) => student.name },
    { key: "gender", header: "Gender", render: (student) => student.gender },
    {
      key: "birthday",
      header: "Birthday",
      render: (student) => new Date(student.birthday).toLocaleDateString(),
    },
  ];

  const fetchStudents = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/student?page=${page}`));
      const result = await response.json();

      setStudents(Array.isArray(result.data) ? result.data : []);
      setTotalPages(result.totalPages ?? 1);
    } catch {
      setStudents([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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

  const handleEdit = (student: Student) => {
    setUpdateError("");
    setModal({ type: "edit", student });
  };

  const handleDelete = (student: Student) => {
    setDeleteError("");
    setModal({ type: "delete", student });
  };

  const handleCreateStudent = async (values: StudentCreatePayload) => {
    setCreateError("");
    setIsCreating(true);

    try {
      const response = await apiFetch("/api/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          gender: normalizeGender(values.gender),
        }),
      });

      if (!response.ok) {
        const message = await getErrorMessage(response, "Tao student that bai.");
        throw new Error(message);
      }

      toast.success("Student created successfully!");
      closeModal();
      await fetchStudents();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Tao student that bai.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStudent = async (values: StudentCreatePayload) => {
    if (modal.type !== "edit") {
      return;
    }

    setUpdateError("");
    setIsUpdating(true);

    try {
      const response = await apiFetch(
        `/api/student/${modal.student.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            name: values.name.trim(),
            gender: normalizeGender(values.gender),
          }),
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Cap nhat student that bai.",
        );
        throw new Error(message);
      }

      toast.success("Student updated successfully!");
      closeModal();
      await fetchStudents();
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Cap nhat student that bai.",
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
      const response = await apiFetch(
        `/api/student/${modal.student.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(response, "Xoa student that bai.");
        throw new Error(message);
      }

      toast.success("Student deleted successfully!");
      closeModal();
      await fetchStudents();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Xoa student that bai.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const editInitialValues: StudentCreatePayload =
    modal.type === "edit"
      ? {
          name: modal.student.name,
          gender: normalizeGender(modal.student.gender),
          birthday: modal.student.birthday.slice(0, 10),
        }
      : defaultStudentPayload;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Student List</h1>

      <DataTable
        columns={columns}
        rows={students}
        rowKey={(student) => student.id}
        emptyText="No students found."
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
        title="Add Student"
        initialValues={defaultStudentPayload}
        validationSchema={studentCreateSchema}
        fields={studentCreateFields}
        isSubmitting={isCreating}
        errorMessage={createError}
        onClose={closeModal}
        onSubmit={handleCreateStudent}
      />
      <EditModal
        isOpen={modal.type === "edit"}
        title="Edit Student"
        initialValues={editInitialValues}
        validationSchema={studentEditSchema}
        fields={studentCreateFields}
        isSubmitting={isUpdating}
        errorMessage={updateError}
        onClose={closeModal}
        onSubmit={handleUpdateStudent}
      />
      <DeleteModal
        isOpen={modal.type === "delete"}
        title="Delete Student"
        itemLabel="sinh vien"
        itemName={modal.type === "delete" ? modal.student.name : ""}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
