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
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);


  // Check if user is logged in, if not, redirect to login page
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Fetch user's courses
  useEffect(() => {
    fetch("/api/mycourses", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data.courses) ? data.courses : []));
  }, []);

  // Delete course handler
  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const res = await fetch(`/api/deletecourse/${courseId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCourses(courses => courses.filter(course => course._id !== courseId));
    } else {
      alert("Failed to delete course.");
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
          <div className="flex flex-row items-center justify-between mb-8">
            <div className="text-4xl mb-1 font-medium text-blue-700 drop-shadow">
              My Courses
            </div>
            <Link href="/createcourse">
              <button className="text-2xl font-bold text-white px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer">
                + Create Course
              </button>
            </Link>
          </div>
          <div className="flex flex-row gap-8">
            {/* My Courses List */}
            <div className="flex-1 bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-4 text-blue-700">Your Courses</div>
              {courses.length === 0 ? (
                <div className="text-lg text-gray-700 text-center">
                  You currently have no courses, to get started click on <span className="font-bold">"Create Course"</span>!
                </div>
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
                        <div className="flex gap-2">
                          <button
                            className="text-xs px-2 py-1 bg-green-400 hover:bg-yellow-500 text-white rounded"
                            // onClick={...} // Edit functionality to be implemented
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                            onClick={() => handleDelete(course._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      Genre:
                      <div className="flex mb-2">
                        <div className="text-sm text-black bg-blue-400 rounded-lg uppercase font-bold">{course.genre}</div>
                      </div>
                      Description:
                      <div className="flex-2 mb-2">
                        <div className="bg-blue-100 rounded p-2 text-gray-800 text-sm truncate">
                          {course.description}
                        </div>
                      </div>
                      <div className="flex flex-row justify-between text-xs text-gray-600 mt-2">
                        <span className="font-semibold">Level:</span> <span>{course.level}</span>
                        <span className="font-semibold">Length:</span> <span>{course.predictedTime} hrs</span>
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
          © 2025 SIS 3 project, Miha Sivka. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
