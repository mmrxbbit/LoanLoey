// pages/admin/user/[id].tsx
"use client";
import { useRouter } from "next/navigation";

export default function UserDetail() {
  const router = useRouter();

  // Sample data for a single user
  const userData = {
    FirstName: "Jane",
    LastName: "Doe",
    CitizenID: "1111111111",
    Phone: "0987662542",
    BirthDate: "30/02/2080",
    Address: "homeless, anywhere",
    BankName: "Krungtuay",
    BankAccount: "123-2332-32423",
    Username: "thisisjane",
  };

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
              First name
            </label>
            <input
              type="text"
              value={userData.FirstName}
              readOnly
              className="border-gray-300 p-2 border rounded-md w-full"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600">Last name</label>
            <input
              type="text"
              value={userData.LastName}
              readOnly
              className="border-gray-300 p-2 border rounded-md w-full"
            />
          </div>
        </div>

        {/* Additional fields */}
        <div className="mt-4">
          <label className="block font-medium text-gray-600">Citizen ID</label>
          <input
            type="text"
            value={userData.CitizenID}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Phone no.</label>
          <input
            type="text"
            value={userData.Phone}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Birth Date</label>
          <input
            type="text"
            value={userData.BirthDate}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Address</label>
          <input
            type="text"
            value={userData.Address}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Bank Name</label>
          <input
            type="text"
            value={userData.BankName}
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
            value={userData.BankAccount}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600">Username</label>
          <input
            type="text"
            value={userData.Username}
            readOnly
            className="border-gray-300 p-2 border rounded-md w-full"
          />
        </div>
      </div>
    </div>
  );
}
