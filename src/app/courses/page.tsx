'use client'

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState(""); // "" means no sorting, or set a default
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  // Courses state
  const [courses, setCourses] = useState<
    {
      _id: string;
      title: string;
      description: string;
      creator: string;
      genre?: string;
      level?: string;
      predictedTime?: number;
      courseScore?: number;
      approved?: string;
    }[]
  >([]);

  // Top users state
  const [topUsers, setTopUsers] = useState<
    { username: string; userScore: number; createdCourses: number }[]
  >([]);

  // Filter states
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterLength, setFilterLength] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [search, setSearch] = useState("");

  // Get unique options from courses
  const categoryOptions = [
    "",
    ...Array.from(new Set(courses.map(c => c.genre).filter(Boolean))).sort()
  ];
  const difficultyOptions = [
    "",
    ...Array.from(new Set(courses.map(c => c.level).filter(Boolean))).sort()
  ];
  const lengthOptions = [
    "",
    ...Array.from(new Set(courses.map(c => c.predictedTime).filter(Boolean))).sort((a, b) => {
      // If predictedTime is numeric, sort numerically
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      // Otherwise, sort as strings
      return String(a).localeCompare(String(b));
    })
  ];

  // Filtered courses
  const filteredCourses = courses.filter(course =>
  course.approved === "approved" && // Only show approved courses
  (filterCategory === "" || course.genre === filterCategory) &&
  (filterDifficulty === "" || course.level === filterDifficulty) &&
  (filterLength === "" || String(course.predictedTime) === filterLength)
);

  const searchedCourses = filteredCourses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  function capitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    // Fetch user info
    async function fetchUser() {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUser();

    // Fetch all courses
    async function fetchCourses() {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    }
    fetchCourses();

    // Fetch top users
    async function fetchTopUsers() {
      const res = await fetch('/api/topusers');
      if (res.ok) {
        const data = await res.json();
        setTopUsers(data.topUsers || []);
      }
    }
    fetchTopUsers();
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

  // Define allowed sort keys
  type Course = {
    _id: string;
    title: string;
    description: string;
    creator: string;
    genre?: string;
    level?: string;
    predictedTime?: number;
    courseScore?: number;
  };

  type SortKey = "title" | "genre" | "courseScore" | "level" | "predictedTime";

  // Sorting logic
  const sortedCourses = [...searchedCourses].sort((a, b) => {
    if (!sortBy) return 0;
    // Only allow known keys
    const key = sortBy as SortKey;
    let valA = a[key];
    let valB = b[key];

    // For undefined/null values, treat as empty string or 0
    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";

    // For rating and length, sort numerically
    if (key === "courseScore" || key === "predictedTime") {
      valA = Number(valA);
      valB = Number(valB);
      if (isNaN(valA)) valA = 0;
      if (isNaN(valB)) valB = 0;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }

    // For other fields, sort alphabetically (case-insensitive)
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB), undefined, { sensitivity: "base" })
      : String(valB).localeCompare(String(valA), undefined, { sensitivity: "base" });
  });

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
          {user && (user.role === "moderator" || user.role === "admin") && (
            <Link href="/approvals">
              <button className="text-2xl h-15 font-bold text-black px-4 focus:outline-none hover:bg-blue-300 rounded cursor-pointer">
                Approvals
              </button>
            </Link>
          )}
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
          <div className="text-4xl font-bold text-center text-blue-700 drop-shadow mb-8">
            Courses
          </div>
          <div className="flex flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Search & Filters */}
              <div className="bg-blue-200 rounded-xl shadow-lg p-6 mb-6 flex flex-col items-center">
                <div className="text-2xl font-semibold mb-2 text-blue-700">Search & Filters</div>
                <div className="mb-4 flex gap-2 w-full">
                  <input
                    type="text"
                    value={pendingSearch}
                    onChange={e => setPendingSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="border rounded px-3 py-1 w-full bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSearch(pendingSearch)}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    Search
                  </button>
                </div>
                <h1 className="text-lg font-semibold text-blue-700 mt-4">Filters:</h1>
                {/* Filter Modules */}
                <div className="flex gap-4 w-full mt-2">
                  {/* Category Filter */}
                  <div className="flex flex-col flex-1">
                    <label className="font-semibold mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {categoryOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt === "" ? "All" : capitalize(opt ?? "")}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Difficulty Filter */}
                  <div className="flex flex-col flex-1">
                    <label className="font-semibold mb-1">Difficulty</label>
                    <select
                      value={filterDifficulty}
                      onChange={e => setFilterDifficulty(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {difficultyOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt === "" ? "All" : opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Length Filter */}
                  <div className="flex flex-col flex-1">
                    <label className="font-semibold mb-1">Length</label>
                    <select
                      value={filterLength}
                      onChange={e => setFilterLength(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {lengthOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt === "" ? "All" : opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="flex gap-4 items-center mb-4">
                <label className="font-semibold">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border rounded px-2 py-1 bg-blue-200"
                >
                  <option value="">None</option>
                  <option value="title">Name</option>
                  <option value="genre">Genre</option>
                  <option value="courseScore">Rating</option>
                  <option value="level">Level</option>
                  <option value="predictedTime">Length</option>
                </select>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 border rounded bg-blue-200"
                  onClick={() => setSortOrder(order => (order === "asc" ? "desc" : "asc"))}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>

              {/* All Courses List */}
              <div className="bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
                <div className="text-2xl font-semibold mb-2 text-blue-700">Courses</div>
                {filteredCourses.length === 0 ? (
                  <div className="text-blue-900">No courses found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-md font-semibold mb-4 text-blue-700">
                    {sortedCourses.map(course => (
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
                          <span className="ml-auto text-xs text-gray-700">
                            By:{" "}
                            <Link
                              href={`/profile/${course.creator}`}
                              className="text-blue-600 hover:underline"
                            >
                              {course.creator}
                            </Link>
                          </span>
                        </div>
                        Genre:
                        <div className="flex mb-2">
                          <span className="inline-block text-sm text-black bg-blue-400 rounded-lg uppercase font-bold px-2 py-0.5">
                            {course.genre}
                          </span>
                        </div>
                        Description:
                        <div className="flex-2 mb-2">
                          <div className="bg-blue-100 rounded p-2 text-gray-800 text-sm truncate">
                            {course.description}
                          </div>
                        </div>
                        {/* New Rating Display */}
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
            </div>
            {/* Top users */}
            <div className="flex-1 max-w-xs bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-2xl font-semibold mb-2 text-blue-700">Top Users</div>
              <div className="w-full flex flex-col gap-4">
                {topUsers.length === 0 ? (
                  <div className="text-blue-900 text-center text-sm py-4">
                    No top users found.
                  </div>
                ) : (
                  topUsers.map(user => (
                    <div
                      key={user.username}
                      className="flex flex-col justify-between bg-white rounded-lg shadow p-4 min-h-[100px] w-full"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/profile/${user.username}`}
                          className="text-lg font-bold text-blue-700 hover:underline"
                        >
                          {user.username}
                        </Link>
                        <div className="text-xs text-gray-700">
                          Score: {user.userScore}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">
                          Created Courses: {user.createdCourses}
                        </span>
                        <Link
                          href={`/profile/${user.username}`}
                          className="text-blue-600 hover:underline text-xs text-center"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))
                )}
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
