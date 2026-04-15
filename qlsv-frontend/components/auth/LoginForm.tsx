"use client";

import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  API_BASE_URL,
  dispatchAuthChanged,
  resetSessionExpiredToast,
} from "../../lib/authFetch";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginResponse = {
  message?: string;
  accessToken?: string;
};

type LoginFormProps = {
  redirectTo?: string;
};

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Email khong hop le.")
    .required("Email la bat buoc."),
  password: Yup.string()
    .min(6, "Mat khau toi thieu 6 ky tu.")
    .required("Mat khau la bat buoc."),
});

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginForm({
  redirectTo = "/students",
}: LoginFormProps) {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={async (values, helpers) => {
        setIsLoggingIn(true);

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(values),
          });

          const data = ((await response.json()) as LoginResponse) ?? {};

          if (!response.ok) {
            throw new Error(data.message || "Dang nhap that bai.");
          }

          if (!data.accessToken) {
            throw new Error("Backend khong tra ve access token.");
          }

          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("loggedInEmail", values.email);
          resetSessionExpiredToast();
          dispatchAuthChanged();
          toast.success(data.message || "Dang nhap thanh cong.");
          helpers.resetForm();
          router.push(redirectTo);
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Dang nhap that bai.",
          );
        } finally {
          setIsLoggingIn(false);
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, handleBlur, handleChange }) => (
        <Form className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium tracking-[0.18em] text-slate-700 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
            {touched.email && errors.email && (
              <p className="text-sm text-rose-300">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium tracking-[0.18em] text-slate-700 uppercase"
            >
              Mat khau
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhap mat khau"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
            {touched.password && errors.password && (
              <p className="text-sm text-rose-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold tracking-[0.22em] text-white uppercase transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isLoggingIn ? "Dang xu ly..." : "Dang nhap"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
