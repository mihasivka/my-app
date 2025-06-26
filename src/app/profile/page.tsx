'use client'

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";

export default function Home() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // User state
  const [user, setUser] = useState<{
    username: string;
    email: string;
    memberSince: string;
    createdCourses: number;
    enrolledCourses: number;
    enrolledCoursesCount?: number;
    userScore: number;
  } | null>(null);

  const [language, setLanguage] = useState<"en" | "sl">("en");

  // Translation dictionary
  const dict = {
    courses: { en: "Courses", sl: "Tečaji" },
    myCourses: { en: "My Courses", sl: "Moji tečaji" },
    profile: { en: "Profile", sl: "Profil" },
    login: { en: "Login", sl: "Prijava" },
    signup: { en: "Signup", sl: "Registracija" },
    editProfile: { en: "Edit Profile", sl: "Uredi profil" },
    logout: { en: "Logout", sl: "Odjava" },
    profileInfo: { en: "Profile Information", sl: "Podatki o profilu" },
    memberSince: { en: "Member since:", sl: "Član od:" },
    coursesCreated: { en: "Courses created:", sl: "Ustvarjeni tečaji:" },
    enrolledCourses: { en: "Enrolled courses:", sl: "Vpisani tečaji:" },
    userScore: { en: "User score:", sl: "Uporabniške točke:" },
    copyright: {
      en: "© 2025 SIS 3 project, Miha Sivka. All rights reserved.",
      sl: "© 2025 projekt SIS 3, Miha Sivka. Vse pravice pridržane.",
    },
    loading: { en: "Loading...", sl: "Nalaganje..." },
  };

  const t = (key: keyof typeof dict) => dict[key][language];

  // Fetch user info on mount
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
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/profile_icon.png"
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-blue-300 mb-4"
              priority
            />
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {user ? user.username : t("loading")}
            </div>
            <div className="text-lg text-gray-700 mb-4">
              {user ? user.email : ""}
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              {t("editProfile")}
            </button>
            <button
              className="px-6 py-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                Cookies.remove("token"); // Remove token from browser
                window.location.href = '/login';
              }}
            >
              {t("logout")}
            </button>
          </div>
          <div className="flex flex-row gap-8 w-[70%] mx-auto">
            {/* Profile Info */}
            <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-4 text-blue-700">{t("profileInfo")}</div>
              <div className="w-full flex flex-col gap-2 text-lg text-blue-900">
                <div><span className="font-bold">{t("memberSince")}</span> {user ? user.memberSince : ""}</div>
                <div><span className="font-bold">{t("coursesCreated")}</span> {user ? user.createdCourses : ""}</div>
                <div><span className="font-bold">{t("enrolledCourses")}</span> {user ? user.enrolledCoursesCount : ""}</div>
                <div><span className="font-bold">{t("userScore")}</span> {user ? user.userScore : ""}</div>
              </div>
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
