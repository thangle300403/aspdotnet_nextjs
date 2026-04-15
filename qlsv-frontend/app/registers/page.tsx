"use client";

import { useEffect, useState } from "react";
import * as Yup from "yup";
import DataTable, { DataTableColumn } from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import CreateModal, {
  CreateFieldConfig,
} from "../../components/create/CreateModal";
import {
  apiFetch,
  buildApiUrl,
  getErrorMessage,
  requireAccessToken,
} from "../../lib/authFetch";
import { toast } from "react-toastify";
import EditModal from "@/components/edit/EditModal";
import DeleteModal from "@/components/delete/DeleteModal";
import { Student } from "../students/page";
import { Subject } from "../subjects/page";

export type Register = {
  id: number;
  student_id: number;
  subject_id: number;
  score: number;
};

type RegisterCreatePayload = {
  student_id: number;
  subject_id: number;
  score: number;
};

type RegisterEditPayload = {
  score: number;
};

const pageSize = 5;

const defaultRegisterPayload: RegisterCreatePayload = {
  student_id: 1,
  subject_id: 1,
  score: 1,
};

const registerCreateSchema = Yup.object({
  student_id: Yup.number()
    .typeError("Student is required.")
    .integer("Student is invalid.")
    .min(1, "Student is required.")
    .required("Student is required."),
  subject_id: Yup.number()
    .typeError("Subject is required.")
    .integer("Subject is invalid.")
    .min(1, "Subject is required.")
    .required("Subject is required."),
  score: Yup.number()
    .typeError("Score must be a number.")
    .min(0, "Score must be at least 0.")
    .max(10, "Score must be at most 10.")
    .required("Score is required."),
});

const registerEditSchema = Yup.object({
  score: Yup.number()
    .typeError("Score must be a number.")
    .min(0, "Score must be at least 0.")
    .max(10, "Score must be at most 10.")
    .required("Score is required."),
});

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; register: Register }
  | { type: "delete"; register: Register };

function getPagedRows<T>(rows: T[], currentPage: number) {
  const start = (currentPage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export default function RegisterPage() {
  const [allRegisters, setAllRegisters] = useState<Register[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const registerCreateFields: CreateFieldConfig<RegisterCreatePayload>[] = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      options: students.map((student) => ({
        label: `${student.id} - ${student.name}`,
        value: String(student.id),
      })),
    },
    {
      name: "subject_id",
      label: "Subject",
      type: "select",
      options: subjects.map((subject) => ({
        label: `${subject.id} - ${subject.name}`,
        value: String(subject.id),
      })),
    },
    {
      name: "score",
      label: "Score",
      type: "number",
      min: 0,
      max: 10,
    },
  ];

  const registerEditFields: CreateFieldConfig<RegisterEditPayload>[] = [
    {
      name: "score",
      label: "Score",
      type: "number",
      min: 0,
      max: 10,
    },
  ];

  const columns: DataTableColumn<Register>[] = [
    { key: "id", header: "ID", render: (register) => register.id },
    {
      key: "student_id",
      header: "Student",
      render: (register) => {
        const student = students.find(
          (item) => item.id === register.student_id,
        );
        return student
          ? `${student.id} - ${student.name}`
          : String(register.student_id);
      },
    },
    {
      key: "subject_id",
      header: "Subject",
      render: (register) => {
        const subject = subjects.find(
          (item) => item.id === register.subject_id,
        );
        return subject
          ? `${subject.id} - ${subject.name}`
          : String(register.subject_id);
      },
    },
    { key: "score", header: "Score", render: (register) => register.score },
  ];

  const fetchRegisters = async () => {
    try {
      const response = await apiFetch("/api/register");
      const result = await response.json();
      const registerRows = Array.isArray(result) ? result : [];

      setAllRegisters(registerRows);
      setTotalPages(Math.max(1, Math.ceil(registerRows.length / pageSize)));
      setRegisters(getPagedRows(registerRows, page));
    } catch {
      setAllRegisters([]);
      setRegisters([]);
      setTotalPages(1);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        buildApiUrl("/api/student?page=1&pageSize=1000"),
      );
      const result = await response.json();
      setStudents(Array.isArray(result.data) ? result.data : []);
    } catch {
      setStudents([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        buildApiUrl("/api/subject?page=1&pageSize=1000"),
      );
      const result = await response.json();
      setSubjects(Array.isArray(result.data) ? result.data : []);
    } catch {
      setSubjects([]);
    }
  };

  useEffect(() => {
    try {
      requireAccessToken();
    } catch {
      return;
    }

    void fetchStudents();
    void fetchSubjects();
  }, []);

  useEffect(() => {
    void fetchRegisters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const computedTotalPages = Math.max(
      1,
      Math.ceil(allRegisters.length / pageSize),
    );

    if (page > computedTotalPages) {
      setPage(computedTotalPages);
      return;
    }

    setTotalPages(computedTotalPages);
    setRegisters(getPagedRows(allRegisters, page));
  }, [allRegisters, page]);

  const closeModal = () => {
    setModal({ type: "none" });
    setCreateError("");
  };

  const handleAdd = () => {
    setCreateError("");
    setModal({ type: "add" });
  };

  const handleEdit = (register: Register) => {
    setUpdateError("");
    setModal({ type: "edit", register });
  };

  const handleDelete = (register: Register) => {
    setDeleteError("");
    setModal({ type: "delete", register });
  };

  const handleCreateRegister = async (values: RegisterCreatePayload) => {
    setCreateError("");
    setIsCreating(true);

    try {
      const response = await apiFetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: Number(values.student_id),
          subject_id: Number(values.subject_id),
          score: Number(values.score),
        }),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Tao register that bai.",
        );
        throw new Error(message);
      }

      toast.success("Register created successfully!");
      closeModal();
      await fetchRegisters();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Tao register that bai.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRegister = async (values: RegisterEditPayload) => {
    if (modal.type !== "edit") {
      return;
    }

    setUpdateError("");
    setIsUpdating(true);

    try {
      const response = await apiFetch(`/api/register/${modal.register.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Number(values.score)),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Cap nhat register that bai.",
        );
        throw new Error(message);
      }

      toast.success("Register updated successfully!");
      closeModal();
      await fetchRegisters();
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Cap nhat register that bai.",
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
      const response = await apiFetch(`/api/register/${modal.register.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Xoa register that bai.",
        );
        throw new Error(message);
      }

      toast.success("Register deleted successfully!");
      closeModal();
      await fetchRegisters();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Xoa register that bai.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const initialValues =
    students.length > 0 && subjects.length > 0
      ? {
          student_id: students[0].id,
          subject_id: subjects[0].id,
          score: 1,
        }
      : defaultRegisterPayload;

  const editInitialValues: RegisterEditPayload =
    modal.type === "edit"
      ? {
          score: modal.register.score,
        }
      : { score: 0 };

  const editTitle =
    modal.type === "edit"
      ? `Edit Score - ${
          students.find((student) => student.id === modal.register.student_id)
            ?.name ?? `Student ${modal.register.student_id}`
        } / ${
          subjects.find((subject) => subject.id === modal.register.subject_id)
            ?.name ?? `Subject ${modal.register.subject_id}`
        }`
      : "Edit Register";

  const deleteItemName =
    modal.type === "delete"
      ? `${
          students.find((student) => student.id === modal.register.student_id)
            ?.name ?? `Student ${modal.register.student_id}`
        } / ${
          subjects.find((subject) => subject.id === modal.register.subject_id)
            ?.name ?? `Subject ${modal.register.subject_id}`
        }`
      : "";

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Register List</h1>

      <DataTable
        columns={columns}
        rows={registers}
        rowKey={(register) => register.id}
        emptyText="No registers found."
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
        title="Add Register"
        initialValues={initialValues}
        validationSchema={registerCreateSchema}
        fields={registerCreateFields}
        isSubmitting={isCreating}
        errorMessage={createError}
        onClose={closeModal}
        onSubmit={handleCreateRegister}
      />
      <EditModal
        isOpen={modal.type === "edit"}
        title={editTitle}
        initialValues={editInitialValues}
        validationSchema={registerEditSchema}
        fields={registerEditFields}
        isSubmitting={isUpdating}
        errorMessage={updateError}
        onClose={closeModal}
        onSubmit={handleUpdateRegister}
      />

      <DeleteModal
        isOpen={modal.type === "delete"}
        title="Delete Register"
        itemLabel="dang ky"
        itemName={deleteItemName}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
