"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      router.replace("/students");
    }
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.45),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      <div className="absolute top-16 right-[-8rem] h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="absolute bottom-[-7rem] left-[-5rem] h-80 w-80 rounded-full bg-blue-200/45 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <section className="space-y-8">
          <div className="inline-flex rounded-full border border-sky-100 bg-white/85 px-4 py-2 text-xs tracking-[0.3em] text-sky-700 uppercase shadow-sm backdrop-blur-sm">
            QLSV Workspace
          </div>

          <div className="max-w-3xl space-y-6">
            <p className="text-sm tracking-[0.28em] text-slate-500 uppercase">
              Quan ly sinh vien tren giao dien sang, gon va de theo doi
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-balance md:text-7xl">
              Dang nhap de quan ly sinh vien.
            </h1>
          </div>

          <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-3">
            <div className="border-t border-slate-200 pt-4">
              <p className="mb-2 text-xs tracking-[0.22em] text-slate-400 uppercase">
                Content plan
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <p className="mb-2 text-xs tracking-[0.22em] text-slate-400 uppercase">
                Interaction
              </p>
              <p>
                Glass panel, gradient light field, chuyen huong ngay sau xac
                thuc.
              </p>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-0 scale-105 rounded-[2rem] bg-sky-200/35 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white bg-white/88 p-6 shadow-2xl shadow-sky-100/80 backdrop-blur-2xl md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm tracking-[0.22em] text-sky-700 uppercase">
                  Access portal
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  Dang nhap he thong
                </h2>
              </div>
            </div>

            <LoginForm redirectTo="/students" />

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-sm text-slate-500">
              <span>Ban muon xem du lieu cong khai truoc?</span>
              <Link
                href="/students"
                className="text-sky-700 transition hover:text-sky-800"
              >
                Xem danh sach
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
