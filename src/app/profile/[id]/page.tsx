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
    if (!confirm("Are you sure you want to delete this user and all their courses?")) return;
    const res = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      alert("User and all their courses deleted.");
      router.push("/courses");
    } else {
      alert("Failed to delete user.");
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
                    Profile
                  </Link>
                ) : (
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

      {/* Main */}
      <main className="flex-1 flex flex-col items-center text-black">
        <div className="w-[70%] mx-auto mt-8 items-center flex flex-col items-center">
          {loading ? (
            <div className="text-center text-lg text-blue-900">Loading...</div>
          ) : !user ? (
            <div className="text-center text-lg text-red-600">User not found.</div>
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
                {user.memberSince && (
                  <div className="text-lg text-gray-700 mb-2">
                    Member since: {user.memberSince}
                  </div>
                )}
                {user.userScore !== undefined && (
                  <div className="text-lg text-gray-700 mb-2">
                    User Score: {user.userScore}
                  </div>
                )}
                {/* Moderator Delete Button */}
                {currentUser && (currentUser.role === "moderator" || currentUser.role === "admin") && (
                  <button
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition"
                    onClick={handleDeleteUser}
                  >
                    Delete User & All Courses
                  </button>
                )}
              </div>
              <div className=" w-[70%] bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center mt-6">
                <div className="text-2xl font-semibold mb-2 text-blue-700">
                  Courses by {user.username}
                </div>
                {user.createdCourses?.length === 0 ? (
                  <div className="text-blue-900">No courses found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                    {user.createdCourses.map((course) => (
                      <div
                        key={course._id}
                        className="flex flex-col justify-between bg-white rounded-lg shadow p-4 min-h-[200px] max-w-xs w-full"
                      >
                        <Link
                          href={`/courses/${course._id}`}
                          className="text-xl font-bold text-blue-700 hover:underline mb-2"
                        >
                          {course.title}
                        </Link>
                        <div className="text-sm text-black bg-blue-400 rounded-lg uppercase font-bold mb-2 ">
                          {course.genre}
                        </div>
                        <div className="bg-blue-100 rounded p-2 text-gray-800 text-sm truncate mb-2">
                          {course.description}
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">Rating:</span>{" "}
                          <span>
                            {course.courseScore !== undefined && course.courseScore !== null
                              ? course.courseScore.toFixed(1)
                              : "N/A"}
                          </span>
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
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300">
        <p className="text-center">
          © 2025 SIS 3 project, Miha Sivka. All rights reserved.
        </p>
      </footer>
    </div>
  );
}