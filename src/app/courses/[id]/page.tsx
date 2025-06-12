'use client'

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Course = {
  _id: string;
  title: string;
  genre: string;
  description: string;
  level: string;
  predictedTime: string;
  creator: string;
};

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{
  username: string;
  email: string;
  memberSince: string;
  createdCourses: number;
  enrolledCourses: Array<string | { _id: string }>; // ✅ Now it's an array!
  userScore: number;
} | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  
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

  // Fetch course data
    useEffect(() => {
      fetch(`/api/courses/${id}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setCourse(data.course));
    }, [id]);
  
    // Fetch logged-in user ID (from a profile API or decode JWT)
    useEffect(() => {
      fetch("/api/profile", { credentials: "include" })
        .then(res => res.json())
        .then(data => setUserId(data.userId)); // Ensure your /api/profile returns userId
    }, []);
  
    if (!course) return <div>Loading...</div>;
  
    const isOwner = userId && course.creator === userId;

    // Add this helper to check enrollment
    const isEnrolled =
      user &&
      Array.isArray(user.enrolledCourses) &&
      user.enrolledCourses
        .map((c: any) => (typeof c === "string" ? c : c._id))
        .includes(course._id);

    // Add this log to check enrolled course IDs and the current course ID
    console.log(
      "Enrolled course IDs:",
      user?.enrolledCourses?.map((c: any) => (typeof c === "string" ? c : c._id)),
      "Current course ID:",
      course._id
    );
  
    const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this course?")) return;
      const res = await fetch(`/api/deletecourse/${course._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/mycourses");
      } else {
        alert("Failed to delete course.");
      }
    };
  
    const handleEnroll = async () => {
      const res = await fetch(`/api/enroll/${course._id}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        alert("Enrolled successfully!");
        router.refresh(); // Force the page components to re-fetch data and update the view.
      } else {
        alert("Failed to enroll.");
      }
    };

    const handleUnenroll = async () => {
  const res = await fetch(`/api/unenroll/${course._id}`, {
    method: "POST",
    credentials: "include",
  });
  if (res.ok) {
    alert("Unenrolled successfully!");
    router.refresh(); // refresh to update the UI
  } else {
    alert("Failed to unenroll.");
  }
};
  

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

      <main className="flex-1 flex flex-col text-black">
        <div className="flex flex-col min-h-screen bg-blue-400 items-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mt-10 text-md font-semibold mb-4 text-blue-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-blue-700">{course.title}</h1>
              {isOwner ? (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-400 hover:bg-green-500 text-white rounded cursor-pointer"
                    onClick={() => router.push(`/courses/${course._id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              ) : isEnrolled ? (
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${course._id}/rate`}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded cursor-pointer"
                  >
                    Rate
                  </Link>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                    onClick={handleUnenroll}
                  >
                    Unenroll
                  </button>
                </div>
              ) : (
                <button
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer"
                  disabled={!userId} // Disable if user is not logged in
                  onClick={handleEnroll}
                >
                  Enroll
                </button>
              )}
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
