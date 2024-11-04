"use client";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen text-gray-800">
      <div className="bg-white shadow-lg mt-10 p-8 rounded-md w-full max-w-lg">
        <h2 className="mb-6 font-semibold text-3xl text-center">Sign up</h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="First name"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Last name"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Citizen ID"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Phone no."
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="date"
            placeholder="Birth Date"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Address"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Bank Name"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Bank Account No."
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
          />

          <Link href="/home">
            <button
              type="button"
              className="bg-[#FFD28F] hover:bg-[#dfa651] mt-4 py-2 rounded-md w-full text-black hover:text-white"
            >
              Sign up
            </button>
          </Link>
        </form>

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
