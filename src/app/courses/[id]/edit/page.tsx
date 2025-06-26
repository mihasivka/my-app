'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  _id: string;
  title: string;
  genre: string;
  description: string;
  level: string;
  predictedTime: string;
};

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{
    username: string;
    email: string;
    memberSince: string;
    createdCourses: number;
    enrolledCourses: number;
    userScore: number;
  } | null>(null);

  const [language, setLanguage] = useState<"en" | "sl">("en");

  // Translation dictionary
  const dict = {
    editCourse: { en: "Edit Course", sl: "Uredi tečaj" },
    courseTitle: { en: "Course Title", sl: "Naslov tečaja" },
    description: { en: "Description", sl: "Opis" },
    category: { en: "Category", sl: "Kategorija" },
    selectCategory: { en: "Select category", sl: "Izberi kategorijo" },
    difficulty: { en: "Difficulty", sl: "Težavnost" },
    length: { en: "Length", sl: "Dolžina" },
    selectLength: { en: "Select length", sl: "Izberi dolžino" },
    saveChanges: { en: "Save Changes", sl: "Shrani spremembe" },
    courses: { en: "Courses", sl: "Tečaji" },
    myCourses: { en: "My Courses", sl: "Moji tečaji" },
    profile: { en: "Profile", sl: "Profil" },
    login: { en: "Login", sl: "Prijava" },
    signup: { en: "Signup", sl: "Registracija" },
    loading: { en: "Loading...", sl: "Nalaganje..." },
    success: { en: "Course updated successfully!", sl: "Tečaj uspešno posodobljen!" },
    failed: { en: "Failed to update course.", sl: "Posodobitev tečaja ni uspela." },
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
    fetch(`/api/courses/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCourse(data.course));
  }, [id]);

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!course) return;

    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      category: (form.elements.namedItem("category") as HTMLSelectElement).value,
      difficulty: (form.elements.namedItem("difficulty") as RadioNodeList).value,
      length: (form.elements.namedItem("length") as HTMLSelectElement).value,
      approved: "pending",
    };

    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (res.ok) {
      setSuccess(t("success"));
      router.push(`/courses/${id}`);
    } else {
      const result = await res.json();
      setError(result.error || t("failed"));
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

  // Flag click handler
  const toggleLanguage = () => setLanguage(language === "en" ? "sl" : "en");

  if (!course) return <div>{t("loading")}</div>;

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

      <main className="flex-1 flex flex-col text-black justify-center items-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mt-10 text-gray-400 ">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">{t("editCourse")}</h1>
          <form className="flex flex-col gap-6 w-full font-sans " onSubmit={handleSubmit}>
            {error && <div className="text-red-600 text-center">{error}</div>}
            {success && <div className="text-green-600 text-center">{success}</div>}
            <label className="flex flex-col">
              <span className="mb-1 font-bold text-black">{t("courseTitle")}</span>
              <input
                type="text"
                name="title"
                defaultValue={course.title}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-bold text-black">{t("description")}</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={course.description}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-bold text-black">{t("category")}</span>
              <select
                name="category"
                defaultValue={course.genre}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
                required
              >
                <option value="">{t("selectCategory")}</option>
                <option value="programming">Programming</option>
                <option value="languages">Languages</option>
                <option value="science">Science</option>
                <option value="math">Math</option>
                <option value="art">Art</option>
                <option value="business">Business</option>
                <option value="culinary">Culinary</option>
                <option value="gaming">Gaming</option>
                <option value="sport">Sport</option>
                <option value="music">Music</option>
                <option value="dance">Dance</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-bold text-black">{t("difficulty")}</span>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <label key={level} className="flex flex-col items-center font-sans">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      defaultChecked={course.level === String(level)}
                      className="accent-blue-600"
                      required
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-bold text-black">{t("length")}</span>
              <select
                name="length"
                defaultValue={course.predictedTime}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
                required
              >
                <option value="">{t("selectLength")}</option>
                <option value="1-10">1-10 hrs</option>
                <option value="10-50">10-50 hrs</option>
                <option value="50-100">50-100 hrs</option>
                <option value="100+">100+ hrs</option>
              </select>
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition font-sans cursor-pointer"
            >
              {t("saveChanges")}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center">
        <p className="text-center">
          {t("copyright")}
        </p>
      </footer>
    </div>
  );
}
