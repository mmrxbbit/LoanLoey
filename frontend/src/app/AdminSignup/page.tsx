"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });

  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default page reload

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setResponseMessage("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/createAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponseMessage(data.message);
        router.push("/AdminHome"); // Navigate to admin home page on successful signup
      } else {
        const errorData = await res.json();
        setResponseMessage(errorData.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="space-y-6 bg-white shadow-lg p-8 rounded-lg w-1/3 max-w-lg">
        <h2 className="mb-4 font-bold text-2xl text-center">Sign up</h2>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative w-full">
            <input
              type="text"
              name="first_name"
              placeholder=" "
              value={formData.first_name}
              onChange={handleChange}
              required
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="first_name"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              First Name
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              name="last_name"
              placeholder=" "
              value={formData.last_name}
              onChange={handleChange}
              required
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="last_name"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Last Name
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              name="username"
              placeholder=" "
              value={formData.username}
              onChange={handleChange}
              required
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="username"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Username
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              required
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="password"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Password
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              name="confirmPassword"
              placeholder=" "
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="confirmPassword"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Confirm Password
            </label>
          </div>

          <button
            type="submit"
            className="bg-[#FFD28F] hover:bg-[#f5c680] mt-4 py-2 rounded-md w-full text-black hover:text-white"
          >
            Sign up
          </button>
        </form>

        {responseMessage && (
          <p className="mt-4 text-center text-red-500 text-sm">
            {responseMessage}
          </p>
        )}

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            log in
          </Link>
        </p>
      </div>
    </div>
  );
}
