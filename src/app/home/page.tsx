'use client'

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

type TopCourse = {
  _id: string;
  title: string;
  courseScore?: number;
};

type TopUser = {
  _id: string;
  username: string;
  userScore?: number;
};

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
    userScore: number;
    role?: string;
  } | null>(null);

  // Top courses and users
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [language, setLanguage] = useState<"en" | "sl">("en");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUser();

    async function fetchHomeData() {
      const res = await fetch('/api/home');
      if (res.ok) {
        const data = await res.json();
        setTopCourses(data.topCourses || []);
        setTopUsers(data.topUsers || []);
      }
    }
    fetchHomeData();
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

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "sl") setLanguage(savedLang);
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  // Translation dictionary
  const dict = {
    welcome: {en: "Welcome to the Information Sharing platform!",sl: "Dobrodošli na platformi za izmenjavo informacij!"},
    descriptionTitle: {en: "Description",sl: "Opis"},
    descriptionText: {
      en: "Welcome to the Information Sharing platform! Here you can create, share, and learn from a variety of courses made by users like you.",
      sl: "Dobrodošli na platformi za izmenjavo informacij! Tukaj lahko ustvarjate, delite in se učite iz različnih tečajev, ki jih ustvarijo uporabniki kot vi.",},
    courses: {en: "Courses",sl: "Tečaji"},
    myCourses: {en: "My Courses",sl: "Moji tečaji"},
    approvals: {en: "Approvals",sl: "Odobritve"},
    topCourses: {en: "Top Courses",sl: "Najboljši tečaji"},
    noTopCourses: {en: "No top courses found.",sl: "Ni najdenih najboljših tečajev."},
    topUsers: {en: "Top Users",sl: "Najboljši uporabniki"},
    noTopUsers: {en: "No top users found.",sl: "Ni najdenih najboljših uporabnikov."},
    profile: {en: "Profile",sl: "Profil"},
    login: {en: "Login",sl: "Prijava"},
    signup: {en: "Signup",sl: "Registracija"},
    rating: {en: "No rating",sl: "Ni ocene"},
    score: {en: "No score",sl: "Ni točk"},
    copyright: {
      en: "© 2025 SIS 3 project, Miha Sivka. All rights reserved.",
      sl: "© 2025 projekt SIS 3, Miha Sivka. Vse pravice pridržane.",
    },
  };

  // Example translation function
  const t = (key: keyof typeof dict) => dict[key][language];

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

      <main className="flex-1 flex flex-col text-black">
        <div className="text-4xl w-full p-2">
          <div className="text-4xl w-full ml-2 font-bold text-center text-blue-700 drop-shadow">
            {t("welcome")}
          </div>
        </div>
        <div className="flex flex-row gap-6 justify-between mt-8 mx-6">
          {/* Description */}
          <div className="flex-1 bg-blue-200 rounded-xl shadow-lg  p-6 flex flex-col items-center">
            <div className="text-2xl font-semibold mb-2 text-blue-700">{t("descriptionTitle")}</div>
            <div className="text-lg text-gray-700 text-center">
              {t("descriptionText")}
            </div>
          </div>
          {/* Top Courses */}
          <div className="flex-[1.5] bg-blue-200 rounded-xl shadow-lg  p-6 flex flex-col items-center">
            <div className="text-2xl font-semibold mb-2 text-blue-700">{t("topCourses")}</div>
            <div className="w-full flex flex-col gap-4">
              {topCourses.length === 0 ? (
                <div className="text-blue-900">{t("noTopCourses")}</div>
              ) : (
                topCourses.map(course => (
                  <Link
                    key={course._id}
                    href={`/courses/${course._id}`}
                    className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900 hover:underline flex justify-between items-center"
                  >
                    <span>{course.title}</span>
                    <span className="ml-4 text-sm text-blue-700 font-bold">
                      {course.courseScore !== undefined && course.courseScore !== null
                        ? `⭐ ${course.courseScore.toFixed(1)}`
                        : t("rating")}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
          {/* Top Users */}
          <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="text-2xl font-semibold mb-2 text-blue-700">{t("topUsers")}</div>
            <div className="w-full flex flex-col gap-4">
              {topUsers.length === 0 ? (
                <div className="text-blue-900">{t("noTopUsers")}</div>
              ) : (
                topUsers.map(user => (
                  <Link
                    key={user._id}
                    href={`/profile/${user.username}`}
                    className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900 hover:underline flex justify-between items-center"
                  >
                    <span>{user.username}</span>
                    <span className="ml-4 text-sm text-blue-700 font-bold">
                      {user.userScore !== undefined && user.userScore !== null
                        ? `🏆 ${user.userScore.toFixed(1)}`
                        : t("score")}
                    </span>
                  </Link>
                ))
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
