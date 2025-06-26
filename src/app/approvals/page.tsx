'use client'

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type Course = {
  _id: string;
  title: string;
  description: string;
  creator: string;
  genre?: string;
  level?: string;
  predictedTime?: number | string;
  courseScore?: number;
  approved?: string;
};

export default function Approvals() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{
    username: string;
    email: string;
    memberSince: string;
    createdCourses: number;
    enrolledCourses: number;
    userScore: number;
    role?: string;
  } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "sl">("en");

  // Translation dictionary
  const dict = {
    courses: { en: "Courses", sl: "Tečaji" },
    myCourses: { en: "My Courses", sl: "Moji tečaji" },
    approvals: { en: "Approvals", sl: "Odobritve" },
    profile: { en: "Profile", sl: "Profil" },
    login: { en: "Login", sl: "Prijava" },
    signup: { en: "Signup", sl: "Registracija" },
    approvalsTitle: { en: "Approvals", sl: "Odobritve" },
    pendingCourses: { en: "Pending Courses", sl: "Tečaji v obravnavi" },
    loading: { en: "Loading...", sl: "Nalaganje..." },
    noCourses: { en: "No courses awaiting approval.", sl: "Ni tečajev, ki čakajo na odobritev." },
    by: { en: "By:", sl: "Avtor:" },
    genre: { en: "Genre", sl: "Zvrst" },
    description: { en: "Description", sl: "Opis" },
    rating: { en: "Rating", sl: "Ocena" },
    level: { en: "Level", sl: "Stopnja" },
    length: { en: "Length", sl: "Dolžina" },
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

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUser();

    async function fetchCourses() {
      const res = await fetch('/api/approvals');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

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
          {user && (user.role === "moderator" || user.role === "admin") && (
            <Link href="/approvals">
              <button className="text-2xl h-15 font-bold text-black px-4 focus:outline-none hover:bg-blue-300 rounded cursor-pointer">
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

      <main className="flex-1 flex flex-col items-center text-black">
        <div className="w-[70%] mx-auto mt-8">
          <div className="text-4xl font-bold text-center text-blue-700 drop-shadow mb-8">
            {t("approvalsTitle")}
          </div>
          <div className="bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="text-2xl font-semibold mb-2 text-blue-700">{t("pendingCourses")}</div>
            {loading ? (
              <div className="text-blue-900">{t("loading")}</div>
            ) : courses.length === 0 ? (
              <div className="text-blue-900">{t("noCourses")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                {courses.map(course => (
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
                      <span className="inline-block text-sm text-black bg-blue-400 rounded-lg uppercase font-bold px-2 py-0.5">
                        {course.genre}
                      </span>
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
                          ? Number(course.courseScore).toFixed(1)
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
      </main>

      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300">
        <p className="text-center">
          {t("copyright")}
        </p>
      </footer>
    </div>
  );
}