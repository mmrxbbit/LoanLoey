"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
        const roleData = await response.json();

        if (roleData.role === "admin") {
          router.push("/AdminHome");
        } else if (roleData.role === "user") {
          router.push("/home");
        } else {
          setErrorMessage("Unexpected role from backend.");
        }
      } else if (response.status === 401) {
        // Unauthorized error - invalid username or password
        setErrorMessage("Incorrect username or password, please try again.");
      } else {
        const errorData = await response.text();
        setErrorMessage(errorData || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleAdminSignUpClick = () => {
    setShowAdminPopup(true);
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    if (adminPassword === "1234") {
      router.push("/AdminSignup");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center bg-black min-h-screen text-white">
      <div className="flex flex-col items-center space-y-6 p-8 w-1/3">
        {/* logo */}
        <div className="text-center">
          <img src="/logo2.png" alt="LoanLoey Logo" className="mb-1 w-60" />
        </div>

        <h1 className="mt-2 font-bold text-3xl">Sign in to LoanLoey</h1>

        {/* login form */}
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
            <Link href="/signup" className="text-blue-400 hover:underline">
              sign up
            </Link>
          </p>
          <p>or </p>
          <p>
            <button
              onClick={handleAdminSignUpClick}
              className="text-blue-400 hover:underline"
            >
              Sign up as a loan shark admin
            </button>
          </p>

          {/* password pop-up for sign up admin */}
          {showAdminPopup && (
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-75">
              <div className="bg-gray-200 p-6 rounded-2xl w-80 text-center">
                <h2 className="mb-4 font-bold text-gray-800 text-large">
                  Please fill in the password
                </h2>
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="border-gray-400 mb-3 p-2 border rounded-xl w-full text-black"
                />
                {passwordError && (
                  <p className="mb-2 text-red-500 text-sm">{passwordError}</p>
                )}
                <button
                  onClick={handlePasswordSubmit}
                  className="bg-black hover:bg-transparent shadow-xl p-2 border hover:border border-black hover:border-black hover:border-solid rounded-xl w-full text-white hover:text-green-600"
                >
                  OK
                </button>
                <button
                  onClick={() => setShowAdminPopup(false)}
                  className="mt-3 text-gray-500 text-sm hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
