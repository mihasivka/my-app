'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
    } else {
      alert("Failed to enroll.");
    }
  };

  return (
    
    <div className="flex flex-col min-h-screen bg-blue-400 items-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mt-10 text-md font-semibold mb-4 text-blue-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-blue-700">{course.title}</h1>
          {isOwner ? (
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-green-400 hover:bg-yellow-500 text-white rounded"
                onClick={() => router.push(`/courses/${course._id}/edit`)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
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
  );
}