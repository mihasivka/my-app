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
    userScore: number;
  } | null>(null);

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
              Courses
            </button>
          </Link>
          <Link href="/mycourses">
            <button className="text-2xl h-15 font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded cursor-pointer">
              My Courses
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
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
                    Profile
                  </Link>
                ) : (
                  // If not logged in, show Login and Signup
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                      onClick={() => setOpen(false)}
                    >
                      Signup
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
              {user ? user.username : "Loading..."}
            </div>
            <div className="text-lg text-gray-700 mb-4">
              {user ? user.email : ""}
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Edit Profile
            </button>
            <button
              className="px-6 py-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                Cookies.remove("token"); // Remove token from browser
                window.location.href = '/login';
              }}
            >
              Logout
            </button>
          </div>
          <div className="flex flex-row gap-8">
            {/* Profile Info */}
            <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-4 text-blue-700">Profile Information</div>
              <div className="w-full flex flex-col gap-2 text-lg text-blue-900">
                <div><span className="font-bold">Member since:</span> {user ? user.memberSince : ""}</div>
                <div><span className="font-bold">Courses created:</span> {user ? user.createdCourses : ""}</div>
                <div><span className="font-bold">Courses enrolled:</span> {user ? user.enrolledCourses : ""}</div>
                <div><span className="font-bold">User score:</span> {user ? user.userScore : ""}</div>
              </div>
            </div>
            {/* Suggestions */}
            <div className="flex-1 max-w-xs bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-2 text-blue-700">Suggestions</div>
              <div className="w-full flex flex-col gap-4">
                <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Update your profile for better visibility!</div>
                <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Check your enrolled courses.</div>
                <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Create a new course today!</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300">
        <p className="text-center">
          © 2025 SIS 3 project, Miha Sivka. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
