'use client'

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Course = {
  _id: string;
  title: string;
  genre: string;
  description: string;
  level: string;
  predictedTime: string;
  creator: string;
  courseScore?: number | null;
  approved?: boolean;
};

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{
    username: string;
    email: string;
    memberSince: string;
    createdCourses: number;
    enrolledCourses: Array<string | { _id: string }>;

    userScore: number;
    role?: string;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "sl">("en");

  // Translation dictionary
  const dict = {
    courses: { en: "Courses", sl: "Tečaji" },
    myCourses: { en: "My Courses", sl: "Moji tečaji" },
    profile: { en: "Profile", sl: "Profil" },
    login: { en: "Login", sl: "Prijava" },
    signup: { en: "Signup", sl: "Registracija" },
    genre: { en: "Genre", sl: "Zvrst" },
    description: { en: "Description", sl: "Opis" },
    rating: { en: "Rating", sl: "Ocena" },
    level: { en: "Level", sl: "Stopnja" },
    length: { en: "Length", sl: "Dolžina" },
    edit: { en: "Edit", sl: "Uredi" },
    delete: { en: "Delete", sl: "Izbriši" },
    approve: { en: "Approve", sl: "Odobri" },
    deny: { en: "Deny", sl: "Zavrni" },
    enroll: { en: "Enroll", sl: "Vpiši se" },
    unenroll: { en: "Unenroll", sl: "Odjavi se" },
    rate: { en: "Rate", sl: "Oceni" },
    loading: { en: "Loading...", sl: "Nalaganje..." },
    confirmDelete: {
      en: "Are you sure you want to delete this course?",
      sl: "Ali si prepričan, da želiš izbrisati ta tečaj?",
    },
    failedDelete: {
      en: "Failed to delete course.",
      sl: "Izbris tečaja ni uspel.",
    },
    enrolled: {
      en: "Enrolled successfully!",
      sl: "Uspešno vpisan!",
    },
    failedEnroll: {
      en: "Failed to enroll.",
      sl: "Vpis ni uspel.",
    },
    unenrolled: {
      en: "Unenrolled successfully!",
      sl: "Uspešno odjavljen!",
    },
    failedUnenroll: {
      en: "Failed to unenroll.",
      sl: "Odjava ni uspela.",
    },
    approveSuccess: {
      en: "Course approved!",
      sl: "Tečaj odobren!",
    },
    approveFail: {
      en: "Failed to approve course.",
      sl: "Odobritev tečaja ni uspela.",
    },
    denySuccess: {
      en: "Course denied!",
      sl: "Tečaj zavrnjen!",
    },
    denyFail: {
      en: "Failed to deny course.",
      sl: "Zavrnitev tečaja ni uspela.",
    },
    copyright: {
      en: "© 2025 SIS 3 project, Miha Sivka. All rights reserved.",
      sl: "© 2025 projekt SIS 3, Miha Sivka. Vse pravice pridržane.",
    },
  };

  const t = (key: keyof typeof dict) => dict[key][language];

  // Persist language selection
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "sl") setLanguage(savedLang);
  }, []);
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUser();
  }, []);

  // Fetch course data
  useEffect(() => {
    fetch(`/api/courses/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCourse(data.course));
  }, [id]);

  // Fetch logged-in user ID (from a profile API or decode JWT)
  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUserId(data.userId));
  }, []);

  if (!course) return <div>{t("loading")}</div>;

  const isOwner = userId && course.creator === userId;
  const isModerator = user && user.role === "moderator";

  // Check enrollment
  const enrolledCourseIds = Array.isArray(user?.enrolledCourses)
    ? user.enrolledCourses.map((c: string | { _id: string }) =>
        typeof c === "string" ? c : c._id
      )
    : [];
  const isEnrolled = enrolledCourseIds.includes(course._id);

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;
    const res = await fetch(`/api/deletecourse/${course._id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      router.push("/mycourses");
    } else {
      alert(t("failedDelete"));
    }
  };

  const handleEnroll = async () => {
    const res = await fetch(`/api/enroll/${course._id}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      alert(t("enrolled"));
      router.refresh();
      window.location.reload();
    } else {
      alert(t("failedEnroll"));
    }
  };

  const handleUnenroll = async () => {
    const res = await fetch(`/api/unenroll/${course._id}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      alert(t("unenrolled"));
      router.refresh();
    } else {
      alert(t("failedUnenroll"));
    }
  };

  // Moderator approve/deny handlers
  const handleApprove = async () => {
    const res = await fetch(`/api/courses/${course._id}/approve`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: "approved" }),
    });
    if (res.ok) {
      alert(t("approveSuccess"));
      router.push("/approvals");
    } else {
      alert(t("approveFail"));
    }
  };

  const handleDeny = async () => {
    const res = await fetch(`/api/courses/${course._id}/approve`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: "denied" }),
    });
    if (res.ok) {
      alert(t("denySuccess"));
      router.push("/approvals");
    } else {
      alert(t("denyFail"));
    }
  };

  // Flag click handler
  const toggleLanguage = () => setLanguage(language === "en" ? "sl" : "en");

  return (
    <div className="flex flex-col min-h-screen bg-blue-400">
      <header className="p-3 w-full flex flex-row items-center justify-between bg-blue-600">
        <div className="flex flex-row gap-4 divide-gray-500">
          <Link href="/home">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="focus:outline-none"
              aria-label="Open profile menu"
            >
              <Image
                src="/images/logo1.png"
                alt="Profile"
                width={150}
                height={150}
                className="rounded-full cursor-pointer transition"
                priority
              />
            </button>
          </Link>
          <Link href="/courses">
            <button className="text-2xl h-15 font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded cursor-pointer">
              {t("courses")}
            </button>
          </Link>
          <Link href="/mycourses">
            <button className="text-2xl h-15 font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded cursor-pointer">
              {t("myCourses")}
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {/* Flag button in top right */}
          <button
            onClick={toggleLanguage}
            className="cursor-pointer focus:outline-none left-30 top-3 rounded-full p-2 transition duration-300"
            aria-label="Toggle language"
          >
            {language === "en" ? (
              <span role="img" aria-label="Slovenian flag" style={{ fontSize: 32 }}>🇸🇮</span>
            ) : (
              <span role="img" aria-label="English flag" style={{ fontSize: 32 }}>🇬🇧</span>
            )}
          </button>
          {user && (
            <div className="text-lg font-semibold text-white mr-2">
              {user.username}
            </div>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="focus:outline-none"
              aria-label="Open profile menu"
            >
              <Image
                src="/images/profile_icon.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full cursor-pointer border border-gray-300 hover:border-blue-600 transition font-bowlby"
                priority
              />
            </button>
            {open && (
              <div className="absolute -translate-x-27 translate-y-3 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                {user ? (
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                    onClick={() => setOpen(false)}
                  >
                    {t("profile")}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                      onClick={() => setOpen(false)}
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                      onClick={() => setOpen(false)}
                    >
                      {t("signup")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col text-black">
        <div className="flex flex-col min-h-screen bg-blue-400 items-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mt-10 text-md font-semibold mb-4 text-blue-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-blue-700">{course.title}</h1>
              {isModerator ? (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
                    onClick={handleApprove}
                  >
                    {t("approve")}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                    onClick={handleDeny}
                  >
                    {t("deny")}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                    onClick={handleDelete}
                  >
                    {t("delete")}
                  </button>
                </div>
              ) : isOwner ? (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-400 hover:bg-green-500 text-white rounded cursor-pointer"
                    onClick={() => router.push(`/courses/${course._id}/edit`)}
                  >
                    {t("edit")}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                    onClick={handleDelete}
                  >
                    {t("delete")}
                  </button>
                </div>
              ) : isEnrolled ? (
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${course._id}/rate`}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded cursor-pointer"
                  >
                    {t("rate")}
                  </Link>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                    onClick={handleUnenroll}
                  >
                    {t("unenroll")}
                  </button>
                </div>
              ) : (
                <button
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer"
                  disabled={!userId}
                  onClick={handleEnroll}
                >
                  {t("enroll")}
                </button>
              )}
            </div>
            {t("genre")}:
            <div className="flex mb-2">
              <div className="inline-block text-sm text-black bg-blue-400 rounded-lg uppercase font-bold px-2 py-0.5">{course.genre}</div>
            </div>
            {t("description")}:
            <div className="flex-2 mb-2">
              <div className="bg-blue-100 rounded p-2 text-gray-800 text-sm truncate">
                {course.description}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <span className="font-semibold">{t("rating")}:</span>{" "}
              <span>
                {course.courseScore !== undefined && course.courseScore !== null
                  ? course.courseScore.toFixed(1)
                  : "N/A"}
              </span>
            </div>
            <div className="flex flex-row justify-between text-xs text-gray-600 mt-2">
              <span className="font-semibold">{t("level")}:</span> <span>{course.level}</span>
              <span className="font-semibold">{t("length")}:</span> <span>{course.predictedTime} hrs</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300">
        <p className="text-center">
          {t("copyright")}
        </p>
      </footer>
    </div>
  );
}
