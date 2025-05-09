"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    id_card: "",
    dob: "",
    phone_no: "",
    address: "",
    bank_name: "",
    bank_acc_no: "",
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
    e.preventDefault();

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setResponseMessage("Passwords do not match.");
      return;
    }
    console.log(formData);
    try {
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          id_card: formData.id_card,
          dob: formData.dob,
          phone_no: formData.phone_no,
          address: formData.address,
          bank_name: formData.bank_name,
          bank_acc_no: formData.bank_acc_no,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponseMessage(data.message);
        router.push("/home"); // Navigate to home page on successful signup
      } else {
        const errorText = await res.text();
        setResponseMessage(errorText || "Signup failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen text-gray-800">
      <div className="bg-white shadow-lg mt-10 p-8 rounded-md w-full max-w-lg">
        <h2 className="mb-6 font-semibold text-3xl text-center">Sign up</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              name="id_card"
              placeholder=" "
              value={formData.id_card}
              onChange={handleChange}
              required
              maxLength={13} // Limits input to 13 characters
              pattern="\d{13}" // Ensures exactly 13 digits
              title="Citizen ID format is incorrect"
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="id_card"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Citizen ID
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              name="phone_no"
              placeholder=" "
              value={formData.phone_no}
              onChange={handleChange}
              required
              maxLength={10}
              pattern="\d{10}"
              title="Phone No. format is incorrect"
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="phone_no"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Phone No
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="date"
              name="dob"
              placeholder=" "
              value={formData.dob}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]} // Sets today's date as the maximum
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="dob"
              className={`absolute left-4 top-3 text-gray-400 text-sm transition-all duration-200 ease-in-out bg-white px-1 ${
                formData.dob ? "-top-2 text-blue-500 text-xs" : ""
              }`}
            >
              Birth Date
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              name="address"
              placeholder=" "
              value={formData.address}
              onChange={handleChange}
              required
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="address"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Address
            </label>
          </div>

          <select
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          >
            <option value="" disabled>
              Select Bank
            </option>
            <option value="City Bank">City Bank</option>
            <option value="Community Bank">Community Bank</option>
            <option value="First Financial">First Financial</option>
            <option value="First National Bank">First National Bank</option>
            <option value="Global Bank">Global Bank</option>
            <option value="Global Trust">Global Trust</option>
            <option value="National Bank">National Bank</option>
            <option value="Sample Bank">Sample Bank</option>
            <option value="Secure Savings">Secure Savings</option>
            <option value="Trust Bank">Trust Bank</option>
          </select>

          <div className="relative w-full">
            <input
              type="text"
              name="bank_acc_no"
              placeholder=" "
              value={formData.bank_acc_no}
              onChange={handleChange}
              required
              maxLength={10} // Limits input to 13 characters
              pattern="\d{10}" // Ensures exactly 13 digits
              title="Bank Account No. format is incorrect"
              className="block border-gray-300 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <label
              htmlFor="bank_acc_no"
              className="top-4 left-3 absolute bg-white px-1 text-gray-400 text-sm transition-all duration-200 ease-in-out"
            >
              Bank Account No.
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
            className="bg-[#FFD28F] hover:bg-[#dfa651] mt-4 py-2 rounded-md w-full text-black hover:text-white"
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
          <Link href="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
