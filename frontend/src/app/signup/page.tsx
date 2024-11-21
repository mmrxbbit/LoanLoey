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
        const errorData = await res.json();
        setResponseMessage(errorData.message || "Signup failed.");
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
          <input
            type="text"
            name="first_name"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            name="id_card"
            placeholder="Citizen ID"
            value={formData.id_card}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            name="phone_no"
            placeholder="Phone no."
            value={formData.phone_no}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />

          <select
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
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

          <input
            type="text"
            name="bank_acc_no"
            placeholder="Bank Account No."
            value={formData.bank_acc_no}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />

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
