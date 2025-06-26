'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function PublicProfile() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Language state
  const [language, setLanguage] = useState<"en" | "sl">("en");

  // Translation dictionary
  const dict = {
    courses: { en: "Courses", sl: "Tečaji" },
    myCourses: { en: "My Courses", sl: "Moji tečaji" },
    profile: { en: "Profile", sl: "Profil" },
    login: { en: "Login", sl: "Prijava" },
    signup: { en: "Signup", sl: "Registracija" },
    loading: { en: "Loading...", sl: "Nalaganje..." },
    userNotFound: { en: "User not found.", sl: "Uporabnik ni najden." },
    userScore: { en: "User Score", sl: "Uporabniške točke" },
    memberSince: { en: "Member since", sl: "Član od" },
    deleteUser: { en: "Delete User & All Courses", sl: "Izbriši uporabnika in vse tečaje" },
    confirmDelete: {
      en: "Are you sure you want to delete this user and all their courses?",
      sl: "Ali ste prepričani, da želite izbrisati tega uporabnika in vse njegove tečaje?",
    },
    deleted: {
      en: "User and all their courses deleted.",
      sl: "Uporabnik in vsi njegovi tečaji so izbrisani.",
    },
    failedDelete: {
      en: "Failed to delete user.",
      sl: "Brisanje uporabnika ni uspelo.",
    },
    coursesBy: { en: "Courses by", sl: "Tečaji uporabnika" },
    noApprovedCourses: { en: "No approved courses found.", sl: "Ni najdenih odobrenih tečajev." },
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

  // User state
  const [user, setUser] = useState<{
    username: string;
    email?: string;
    memberSince: string;
    createdCourses: {
      _id: string;
      title: string;
      description: string;
      creator: string;
      genre?: string;
      level?: string;
      predictedTime?: number;
      courseScore?: number;
      approved?: string;
    }[];
    enrolledCourses?: number;
    userScore?: number;
  } | null>(null);

  // Logged-in user state
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "sl") setLanguage(savedLang);
  }, []);
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`/api/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
      setLoading(false);
    }
    if (userId) fetchUser();
  }, [userId]);

  // Fetch logged-in user for moderator check
  useEffect(() => {
    async function fetchCurrentUser() {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    }
    fetchCurrentUser();
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

  // Delete user and all their courses (moderator only)
  const handleDeleteUser = async () => {
    if (!confirm(t("confirmDelete"))) return;
    const res = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      alert(t("deleted"));
      router.push("/courses");
    } else {
      alert(t("failedDelete"));
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
          {/* Username display */}
          {currentUser && (
            <div className="text-lg font-semibold text-white mr-2">
              {currentUser.username}
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
                className="rounded-full cursor-pointer border border-gray-300 hover:border-blue-600 transition"
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

      {/* Main */}
      <main className="flex-1 flex flex-col items-center text-black">
        <div className="w-[70%] mx-auto mt-8 items-center flex flex-col items-center">
          {loading ? (
            <div className="text-center text-lg text-blue-900">{t("loading")}</div>
          ) : !user ? (
            <div className="text-center text-lg text-red-600">{t("userNotFound")}</div>
          ) : (
            <>
              <div className=" w-[30%] bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center mb-8">
                <Image
                  src="/images/profile_icon.png"
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-blue-300 mb-4"
                  priority
                />
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {user.username}
                </div>
                {user.userScore !== undefined && (
                  <div className="text-lg text-gray-700 mb-2">
                    {t("userScore")}: {user.userScore?.toFixed(1)}
                  </div>
                )}
                {user.memberSince && (
                  <div className="text-lg text-gray-700 mb-2">
                    {t("memberSince")}: {new Date(user.memberSince).toLocaleDateString()}
                  </div>
                )}
                {/* Moderator Delete Button */}
                {currentUser && (currentUser.role === "moderator" || currentUser.role === "admin") && (
                  <button
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition"
                    onClick={handleDeleteUser}
                  >
                    {t("deleteUser")}
                  </button>
                )}
              </div>
              <div className=" w-[70%] bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center mt-6">
                <div className="text-2xl font-semibold mb-2 text-blue-700">
                  {t("coursesBy")} {user.username}
                </div>
                {user.createdCourses.filter((course) => course.approved === "approved").length === 0 ? (
                  <div className="text-blue-900">{t("noApprovedCourses")}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                    {user.createdCourses
                      .filter((course) => course.approved === "approved")
                      .map((course) => (
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
                          {/* New Rating Display */}
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
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300">
        <p className="text-center">
          {t("copyright")}
        </p>
      </footer>
    </div>
  );
}