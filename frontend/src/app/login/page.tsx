"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if username and password match admin credentials
    if (username === "admin" && password === "1234") {
      router.push("/AdminHome"); // Redirect to AdminHome page
    } else {
      router.push("/home"); // Redirect to Home page
    }
  };

  return (
    <div className="flex flex-col bg-black min-h-screen text-white">
      <div
        className="bg-cover bg-center w-full"
        style={{
          height: "400px",
          backgroundImage: "url('/header-img.jpg')",
        }}
      ></div>

      <div className="flex flex-row mt-20 w-full">
        {/* Left logo div */}
        <div className="flex flex-shrink-0 justify-center items-center ml-20 w-1/3">
          <img src="/logo.jpg" alt="Logo" className="w-100 h-100" />{" "}
          {/* Adjust size as needed */}
        </div>

        {/* Spacer div to add space between logo and gray div */}
        <div
          className="flex-grow flex-shrink-0"
          style={{ flexGrow: 0.6 }}
        ></div>

        {/* Right gray div */}
        <div className="flex flex-col flex-shrink-0 items-center bg-gray-800 px-4 py-8 rounded-md w-2/3 max-w-md">
          <form className="space-y-4 w-full" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />

            <button
              type="submit"
              className="bg-[#FFD28F] hover:bg-[#dfa651] mt-4 py-2 rounded-md w-full text-black hover:text-white"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-sm">
            Don’t have an account yet?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
