'use client'

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
                href="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
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
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center text-black">
        <div className="w-[70%] mx-auto mt-8">
          <div className="text-4xl font-bold text-center text-blue-700 drop-shadow mb-8">
            Courses
          </div>
          <div className="flex flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Search & Filters */}
              <div className="bg-blue-200 rounded-xl shadow-lg p-6 mb-6 flex flex-col items-center">
                <div className="text-2xl font-semibold mb-2 text-blue-700">Search & Filters</div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="mb-4 w-full px-3 py-2 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2 w-full">
                  <button className="flex-1 bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600 transition">Filter</button>
                  <button className="flex-1 bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600 transition">Sort</button>
                </div>
              </div>
              {/* Top Courses */}
              <div className="bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
                <div className="text-2xl font-semibold mb-2 text-blue-700">Top Courses</div>
                <div className="w-full flex flex-col gap-4">
                  <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Course 1: Introduction to IS</div>
                  <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Course 2: Advanced Sharing</div>
                  <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Course 3: Collaboration Tools</div>
                </div>
              </div>
            </div>
            {/* Suggestions */}
            <div className="flex-1 max-w-xs bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-2 text-blue-700">Suggestions</div>
              <div className="w-full flex flex-col gap-4">
                <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Try searching for "Python"</div>
                <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Check out trending topics!</div>
                <div className="bg-blue-100 rounded p-4 shadow text-lg font-medium text-blue-900">Create your own course!</div>
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
