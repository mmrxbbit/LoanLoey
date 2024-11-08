"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";

export default function UserInfo() {
  const [userData] = useState({
    FirstName: "John",
    LastName: "Doe",
    CitizenID: "123456789",
    BirthDate: "01/01/2000",
    Address: "1234 Elm Street, Springfield",
    BankAccount: "9876543210",
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800">
      {/* Position NavBar at the top with a high z-index */}
      <div className="relative z-10">
        <NavBar username={null} />
      </div>

      {/* Image and Title */}
      <div
        className="relative flex justify-center items-center bg-cover bg-center w-full h-64"
        style={{ backgroundImage: "url('/userinfo-img.jpg')" }}
      >
        <h1 className="bg-black bg-opacity-50 px-4 py-2 rounded-md font-bold text-4xl text-white">
          User Information
        </h1>
      </div>

      {/* User Info Form */}
      <div className="bg-white shadow-lg mx-auto mt-6 p-6 rounded-md max-w-2xl">
        <div className="gap-4 grid grid-cols-2">
          <div>
            <label className="block font-medium text-gray-600 text-sm">
              First name
            </label>
            <input
              type="text"
              value={userData.FirstName}
              readOnly
              className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600 text-sm">
              Last name
            </label>
            <input
              type="text"
              value={userData.LastName}
              readOnly
              className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Citizen ID
          </label>
          <input
            type="text"
            value={userData.CitizenID}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Birth Date
          </label>
          <input
            type="text"
            value={userData.BirthDate}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Address
          </label>
          <input
            type="text"
            value={userData.Address}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="w-full">
            <label className="block font-medium text-gray-600 text-sm">
              Bank Account Number
            </label>
            <input
              type="text"
              value={userData.BankAccount}
              readOnly
              className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
            />
          </div>
          <button className="ml-2 text-blue-600 hover:underline">edit</button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="bg-black hover:bg-gray-800 px-4 py-2 rounded-md text-white"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white shadow-md p-6 rounded-md max-w-xs text-center">
            <p className="mb-4 font-semibold text-lg">
              You have already logged out. Please refresh.
            </p>
            <button
              onClick={confirmLogout}
              className="bg-black hover:bg-gray-800 px-4 py-2 rounded-md text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
