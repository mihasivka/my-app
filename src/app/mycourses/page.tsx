'use client'

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type Course = {
  _id: string;
  title: string;
  genre: string;
  description: string;
  level: string;
  predictedTime: string;
  creator: string;
  courseScore?: number;
  approved?: string;
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [language, setLanguage] = useState<'en' | 'sl'>("en");

  // User state
  const [user, setUser] = useState<{
    username: string;
    email: string;
    memberSince: string;
    createdCourses: number;
    enrolledCourses: number;
    userScore: number;
    courseScore?: number;
    role?: string;
  } | null>(null);

  // Translation dictionary
  const dict = {
    myCourses: {
      en: "My Courses",
      sl: "Moji tečaji",
    },
    createCourse: {
      en: "+ Create Course",
      sl: "+ Ustvari tečaj",
    },
    yourCourses: {
      en: "Your Courses",
      sl: "Tvoji tečaji",
    },
    noApproved: {
      en: 'You currently have no approved courses, to get started click on "Create Course"',
      sl: 'Trenutno nimaš odobrenih tečajev, za začetek klikni na "Ustvari tečaj"',
    },
    genre: {
      en: "Genre",
      sl: "Zvrst",
    },
    description: {
      en: "Description",
      sl: "Opis",
    },
    rating: {
      en: "Rating",
      sl: "Ocena",
    },
    level: {
      en: "Level",
      sl: "Stopnja",
    },
    length: {
      en: "Length",
      sl: "Dolžina",
    },
    edit: {
      en: "Edit",
      sl: "Uredi",
    },
    delete: {
      en: "Delete",
      sl: "Izbriši",
    },
    submittedCourses: {
      en: "Submitted Courses",
      sl: "Oddani tečaji",
    },
    noSubmitted: {
      en: "You have no pending or denied courses.",
      sl: "Nimaš čakajočih ali zavrnjenih tečajev.",
    },
    pending: {
      en: "pending",
      sl: "v obravnavi",
    },
    denied: {
      en: "denied",
      sl: "zavrnjeno",
    },
    yourEnrolledCourses: {
      en: "Your Enrolled Courses",
      sl: "Tečaji, na katere si vpisan",
    },
    noEnrolled: {
      en: "You are not enrolled in any courses yet.",
      sl: "Nisi še vpisan v noben tečaj.",
    },
    by: {
      en: "By:",
      sl: "Avtor:",
    },
    courses: {
      en: "Courses",
      sl: "Tečaji",
    },
    approvals: {
      en: "Approvals",
      sl: "Odobritve",
    },
    profile: {
      en: "Profile",
      sl: "Profil",
    },
    login: {
      en: "Login",
      sl: "Prijava",
    },
    signup: {
      en: "Signup",
      sl: "Registracija",
    },
    copyright: {
      en: "© 2025 SIS 3 project, Miha Sivka. All rights reserved.",
      sl: "© 2025 projekt SIS 3, Miha Sivka. Vse pravice pridržane.",
    },
  };

  const t = (key: keyof typeof dict) => dict[key][language];

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "sl") setLanguage(savedLang);
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

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

  // Check if user is logged in, if not, redirect to login page
  useEffect(() => {
    if (typeof window !== "undefined" && !Cookies.get("token")) {
      router.push("/login");
    }
  }, [router]);

  // Fetch user's courses
  useEffect(() => {
    fetch("/api/mycourses", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data.courses) ? data.courses : []));
  }, []);

  // Fetch enrolled courses
  useEffect(() => {
    fetch("/api/mycourses/enrolled", { credentials: "include" })
      .then(res => res.json())
      .then(data => setEnrolledCourses(Array.isArray(data.courses) ? data.courses : []));
  }, []);

  // Delete course handler
  const handleDelete = async (courseId: string) => {
    if (!confirm(language === "en"
      ? "Are you sure you want to delete this course?"
      : "Ali si prepričan, da želiš izbrisati ta tečaj?")) return;
    const res = await fetch(`/api/deletecourse/${courseId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCourses(courses => courses.filter(course => course._id !== courseId));
    } else {
      alert(language === "en"
        ? "Failed to delete course."
        : "Izbris tečaja ni uspel.");
    }
  };

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

  // Filter for approved, pending, and denied courses
  const approvedCourses = courses.filter(course => course.approved === "approved");
  const submittedCourses = courses.filter(
    course => course.approved === "pending" || course.approved === "denied"
  );

  // Flag click handler
  const toggleLanguage = () => setLanguage(language === "en" ? "sl" : "en");

  return (
    <div className="flex flex-col min-h-screen bg-blue-400">
      <header className="p-3 w-full flex flex-row items-center justify-between bg-blue-600 relative">
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
          {user && (user.role === "moderator" || user.role === "admin") && (
            <Link href="/approvals">
              <button className="text-2xl h-15 font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded cursor-pointer">
                {t("approvals")}
              </button>
            </Link>
          )}
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
          {/* Username display in its own div */}
          {user && (
            <div className="text-lg font-semibold text-white mr-2">
              {user.username}
            </div>
          )}
          {/* Profile icon and dropdown */}
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
                  // If logged in, show only Profile
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                    onClick={() => setOpen(false)}
                  >
                    {t("profile")}
                  </Link>
                ) : (
                  // If not logged in, show Login and Signup
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

      <main className="flex-1 flex flex-col items-center text-black">
        <div className="w-[70%] mx-auto mt-8">
          <div className="flex flex-row items-center justify-between mb-8">
            <div className="text-4xl mb-1 font-medium text-blue-700 drop-shadow">
              {t("myCourses")}
            </div>
            <Link href="/createcourse">
              <button className="text-2xl font-bold text-white px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer">
                {t("createCourse")}
              </button>
            </Link>
          </div>
          <div className="flex flex-row gap-8">
            {/* Approved Courses List */}
            <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-4 text-blue-700">{t("yourCourses")}</div>
              {approvedCourses.length === 0 ? (
                <div className="text-lg text-gray-700 text-center">
                  {t("noApproved")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                  {approvedCourses.map(course => (
                    <div
                      key={course._id}
                      className="flex flex-col justify-between bg-white rounded-lg shadow p-4 min-h-[250px] max-w-xs w-full"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/courses/${course._id}`}
                          className="text-xl font-bold text-blue-700 hover:underline"
                        >
                          {course.title}
                        </Link>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-green-400 hover:bg-green-500 text-white rounded cursor-pointer"
                            onClick={() => router.push(`/courses/${course._id}/edit`)}
                          >
                            {t("edit")}
                          </button>
                          <button
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                            onClick={() => handleDelete(course._id)}
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </div>
                      {t("genre")}:
                      <div className="flex mb-2">
                        <div className="inline-block text-sm text-black bg-blue-400 rounded-lg uppercase font-bold px-2 py-0.5">
                          {course.genre}</div>
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
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Submitted Courses Section */}
          <div className="flex flex-row gap-8 mt-8">
            <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-4 text-blue-700">{t("submittedCourses")}</div>
              {submittedCourses.length === 0 ? (
                <div className="text-lg text-gray-700 text-center">
                  {t("noSubmitted")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                  {submittedCourses.map(course => (
                    <div
                      key={course._id}
                      className="flex flex-col justify-between bg-white rounded-lg shadow p-4 min-h-[250px] max-w-xs w-full"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/courses/${course._id}`}
                          className="text-xl font-bold text-blue-700 hover:underline"
                        >
                          {course.title}
                        </Link>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-green-400 hover:bg-green-500 text-white rounded cursor-pointer"
                            onClick={() => router.push(`/courses/${course._id}/edit`)}
                          >
                            {t("edit")}
                          </button>
                          <button
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                            onClick={() => handleDelete(course._id)}
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="inline-block text-xs font-bold uppercase rounded px-2 py-1"
                          style={{
                            backgroundColor:
                              course.approved === "pending"
                                ? "#facc15" // yellow-400
                                : "#f87171" // red-400
                          }}>
                          {course.approved === "pending" ? t("pending") : t("denied")}
                        </span>
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
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Your Enrolled Courses Section */}
          <div className="flex flex-row gap-8 mt-8">
            <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-4 text-blue-700">{t("yourEnrolledCourses")}</div>
              {enrolledCourses.length === 0 ? (
                <div className="text-lg text-gray-700 text-center">
                  {t("noEnrolled")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                  {enrolledCourses.map(course => (
                    <div
                      key={course._id}
                      className="flex flex-col justify-between bg-white rounded-lg shadow p-4 min-h-[250px] max-w-xs w-full"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/courses/${course._id}`}
                          className="text-xl font-bold text-blue-700 hover:underline"
                        >
                          {course.title}
                        </Link>
                        <span className="ml-auto text-xs text-gray-700">
                          {t("by")}{" "}
                          <Link
                            href={`/profile/${course.creator}`}
                            className="text-blue-600 hover:underline"
                          >
                            {course.creator}
                          </Link>
                        </span>
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
                  ))}
                </div>
              )}
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
