// pages/admin/home.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function AdminHome() {
  // Sample data for users' debts and risk levels
  const totalDebt = 85000;
  const usersData = [
    {
      id: 1,
      name: "Jane Doe",
      totalDebt: 10000,
      remainingDebt: 10000,
      risk: "red",
    },
    {
      id: 2,
      name: "John Smith",
      totalDebt: 20000,
      remainingDebt: 15000,
      risk: "green",
    },
    {
      id: 3,
      name: "Somsri Meesuk",
      totalDebt: 30000,
      remainingDebt: 20000,
      risk: "green",
    },
    {
      id: 4,
      name: "Somsak Kondee",
      totalDebt: 40000,
      remainingDebt: 40000,
      risk: "yellow",
    },
    {
      id: 5,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 6,
      name: "Mana Meejai",
      totalDebt: 8000,
      remainingDebt: 5000,
      risk: "yellow",
    },
    {
      id: 7,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 8,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 9,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 10,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 11,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 12,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 13,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 14,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 15,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 16,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 17,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 18,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 19,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    {
      id: 20,
      name: "Manee Meena",
      totalDebt: 50000,
      remainingDebt: 3000,
      risk: "green",
    },
    // Add more user data as needed
  ];

  return (
    <div className="bg-gray-100 p-6 min-h-screen text-gray-800">
      {/* Summary of total debt */}
      <div className="bg-black mb-4 p-4 rounded-md text-center text-white">
        <h2 className="font-bold text-xl">All User Debt: {totalDebt} ฿</h2>
      </div>

      {/* Scrollable Table */}
      <div className="bg-white shadow-lg p-4 rounded-md max-h-96 overflow-y-auto">
        <table className="border-collapse w-full text-left">
          <thead>
            <tr>
              <th className="p-2 border-b">Name Surname</th>
              <th className="p-2 border-b">Total Debt</th>
              <th className="p-2 border-b">Remaining Debt</th>
              <th className="p-2 border-b">Risk Lv</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user) => (
              <tr key={user.id}>
                <td className="p-2 border-b">
                  <Link
                    href={`/AdminUserInfo/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.name}
                  </Link>
                </td>
                <td className="p-2 border-b">{user.totalDebt} ฿</td>
                <td className="p-2 border-b">{user.remainingDebt} ฿</td>
                <td
                  className={`p-2 border-b ${
                    user.risk === "red"
                      ? "text-red-500"
                      : user.risk === "green"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {user.risk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Link href="/login">
          <button className="bg-black hover:bg-gray-800 mt-8 px-4 py-2 rounded-md text-white">
            Log out
          </button>
        </Link>
      </div>
    </div>
  );
}
