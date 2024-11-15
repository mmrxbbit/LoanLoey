"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const redirectPath = response.url; // Backend redirect path
        router.push(redirectPath.replace("http://localhost:8080", "")); // Redirect based on role
      } else {
        const errorData = await response.text();
        setErrorMessage(errorData || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center bg-black min-h-screen text-white">
      <div className="flex flex-col items-center space-y-6 p-8 w-1/3">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo2.png" alt="LoanLoey Logo" className="mb-1 w-60" />
        </div>

        <h1 className="mt-2 font-bold text-3xl">Sign in to LoanLoey</h1>

        {/* Login Form */}
        <form
          className="space-y-4 bg-gray-700 p-6 rounded-lg w-full max-w-xs"
          onSubmit={handleLogin}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-4 py-2 rounded-md w-full focus:outline-none text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-2 rounded-md w-full focus:outline-none text-black"
          />
          <button
            type="submit"
            className="bg-[#FFD28F] hover:bg-[#f5c680] mt-4 py-2 rounded-md w-full text-black hover:text-white"
          >
            Log in
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 text-center text-red-500 text-sm">
            {errorMessage}
          </p>
        )}

        <div className="text-center text-sm">
          <p>
            Don’t have an account?{" "}
            <a href="/signup" className="text-blue-400 hover:underline">
              sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
