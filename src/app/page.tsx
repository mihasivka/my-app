import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="p-3 w-full flex flex-row items-center justify-between mb-8 border-b border-gray-300 bg-blue-400">
        <div className="flex flex-row gap-4 divide-gray-500">
          <button className="text-2xl font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded">
            Home
          </button>
          <button className="text-2xl font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded">
            Courses
          </button>
          <button className="text-2xl font-bold text-black px-4 focus:outline-none bg-transparent hover:bg-blue-300 rounded">
            My Courses
          </button>
        </div>
        <a href="#" className="ml-4">
          <Image
            src="/images/profile_icon.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full cursor-pointer border border-gray-300 hover:border-blue-600 transition"
            priority
          />
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-2xl">Welcome to My App</div>
      </main>

      <footer className="p-10 w-80 h-24 text-gray-600 justify-items-center object-bottom self-center">
        <p className="text-center">
          © 2025 Sis 3 project, Miha Sivka. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
