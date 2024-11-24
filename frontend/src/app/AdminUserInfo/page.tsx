"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserInfo() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const id = queryParams.get("userID"); // Match the query param
      console.log("Extracted userID from URL:", id); // debugging

      if (!id || isNaN(Number(id))) {
        // Example: Validate if userID should be a number
        setError("Invalid UserID format.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/getUserInfo?userID=${id}`
        );
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to fetch user information.");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="font-bold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 min-h-screen text-gray-800">
      <button
        className="mb-4 font-bold text-black hover:underline"
        onClick={() => router.back()}
      >
        BACK
      </button>

      <div className="bg-white shadow-lg mx-auto p-6 rounded-md max-w-2xl">
        <h2 className="mb-4 font-bold text-2xl text-center">
          User Information
        </h2>

        <div className="gap-4 grid grid-cols-2">
          <div>
            <label className="block font-medium text-gray-600">
              First Name
            </label>
            <input
              type="text"
              value={userData?.first_name || ""}
              readOnly
              className="border-gray-300 p-2 border rounded-md w-full"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600">Last Name</label>
            <input
              type="text"
              value={userData?.last_name || ""}
              readOnly
              className="border-gray-300 p-2 border rounded-md w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Citizen ID</label>
          <input
            type="text"
            value={userData.id_card}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Phone no.</label>
          <input
            type="text"
            value={userData.phone_no}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Birth Date</label>
          <input
            type="text"
            value={userData.dob}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Address</label>
          <input
            type="text"
            value={userData.address}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Bank Name</label>
          <input
            type="text"
            value={userData.bank_name}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">
            Bank Account
          </label>
          <input
            type="text"
            value={userData.bank_acc_no}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Username</label>
          <input
            type="text"
            value={userData.username}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">
            Credit Score
          </label>
          <input
            type="text"
            value={userData.credit_score}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>
      </div>
    </div>
  );
}
