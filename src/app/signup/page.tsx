'use client'

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [language, setLanguage] = useState<"en" | "sl">("en");

  // Translation dictionary
  const dict = {
    courses: { en: "Courses", sl: "Tečaji" },
    myCourses: { en: "My Courses", sl: "Moji tečaji" },
    login: { en: "Login", sl: "Prijava" },
    signup: { en: "Signup", sl: "Registracija" },
    signupTitle: {
      en: "Sign Up to create your own courses and learn from others!",
      sl: "Registrirajte se, da ustvarite svoje tečaje in se učite od drugih!",
    },
    signUp: { en: "Sign up", sl: "Registracija" },
    email: { en: "Email", sl: "E-pošta" },
    username: { en: "Username", sl: "Uporabniško ime" },
    password: { en: "Password", sl: "Geslo" },
    repassword: { en: "Re-enter Password", sl: "Ponovno vnesite geslo" },
    submit: { en: "Submit", sl: "Pošlji" },
    passwordsNoMatch: { en: "Passwords do not match.", sl: "Gesli se ne ujemata." },
    signupSuccess: {
      en: "Signup successful! You can now log in.",
      sl: "Registracija uspešna! Zdaj se lahko prijavite.",
    },
    signupFailed: { en: "Signup failed.", sl: "Registracija ni uspela." },
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

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const repassword = (form.elements.namedItem("repassword") as HTMLInputElement).value;

    if (password !== repassword) {
      setError(t("passwordsNoMatch"));
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (res.ok) {
      setSuccess(t("signupSuccess"));
      form.reset();
    } else {
      const data = await res.json();
      setError(data.error || t("signupFailed"));
    }
  };

  // Flag click handler
  const toggleLanguage = () => setLanguage(language === "en" ? "sl" : "en");

  return (
    <div className="flex flex-col min-h-screen bg-blue-400 font-sans">
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
          {/* Profile icon and dropdown */}
          <div className="relative mr-3" ref={menuRef}>
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
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
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
              </div>
            )}
          </div>
        </div>
        
      </header>

      <main className="flex-1 flex flex-col text-black font-sans">
        <div className="text-4xl w-full p-2 font-bold text-center text-blue-700 drop-shadow">
          {t("signupTitle")}
        </div>
        <div className="flex h-full gap-2 items-center justify-center mt-8 ml-2 mr-2">
          <form
            className="flex flex-col gap-4 w-[350px] p-6 bg-blue-200 rounded-xl shadow-lg font-sans"
            onSubmit={handleSubmit}
          >
            <div className="text-2xl mb-2 text-center font-bold">{t("signUp")}</div>
            {error && <div className="text-red-600 text-center">{error}</div>}
            {success && <div className="text-green-600 text-center">{success}</div>}
            <label className="flex flex-col">
              <span className="mb-1 font-medium">{t("email")}</span>
              <input
                type="email"
                name="email"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none bg-white focus:ring-2 focus:ring-blue-400 font-sans"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-medium">{t("username")}</span>
              <input
                type="text"
                name="username"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none bg-white focus:ring-2 focus:ring-blue-400 font-sans"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-medium">{t("password")}</span>
              <input
                type="password"
                name="password"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none bg-white focus:ring-2 focus:ring-blue-400 font-sans"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 font-medium">{t("repassword")}</span>
              <input
                type="password"
                name="repassword"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none bg-white focus:ring-2 focus:ring-blue-400 font-sans"
                required
              />
            </label>
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition font-sans"
            >
              {t("submit")}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300 font-sans">
        <p className="text-center">
          {t("copyright")}
        </p>
      </footer>
    </div>
  );
}
