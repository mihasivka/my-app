'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RateCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);

  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<{ title: string; creator: string } | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${id}/rate`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Data from /rate:", data);
        setCourse({ title: data.course.title, creator: data.course.creator });
      })
      .catch(() => setCourse(null));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/courses/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ score }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(`/courses/${id}`);
    } else {
      setError("Failed to submit rating.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-400">
      {/* Header */}
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
      <main className="flex-1 flex flex-col items-center justify-center text-black">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96 mt-10">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Rate this Course</h2>
          <div className="mb-4 text-black font-semibold text-lg text-center">
            {course ? (
              <>
                This is a course: <span className="hover:underline">{course.title}</span> by:{" "}
                <span className="hover:underline">{course.creator}</span>
              </>
            ) : (
              "Loading course info..."
            )}
          </div>
          <label className="block mb-2 font-semibold">Rate the Course (1-5):</label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <label key={val} className="flex flex-col items-center">
                <input
                  type="radio"
                  name="score"
                  value={val}
                  checked={score === val}
                  onChange={() => setScore(val)}
                  className="accent-blue-600"
                  required
                />
                <span className="text-sm">{val}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center border-t border-gray-300">
        <p className="text-center">© 2025 SIS 3 project, Miha Sivka. All rights reserved.</p>
      </footer>
    </div>
  );
}