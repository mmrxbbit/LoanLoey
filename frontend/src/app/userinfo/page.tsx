"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import Cookies from "js-cookie";

export default function UserInfo() {
  const [userData, setUserData] = useState<any | null>(null);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userID = Cookies.get("userId"); // Retrieve userId from cookies
      if (!userID) {
        console.error("UserID not found in cookies");
        router.push("/login"); // Redirect to login if userID is missing
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8080/getUserInfo?userID=${userID}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend error:", errorText);
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleEdit = () => {
    setEditData({ ...userData }); // Clone current user data for editing
    setShowEditOverlay(true);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setShowEditOverlay(false);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    try {
      const userID = Cookies.get("userId"); // Retrieve userId again
      if (!userID) {
        console.error("UserID not found in cookies");
        return;
      }
      console.log("Payload being sent:", editData);
      const response = await fetch(
        `http://localhost:8080/updateUserInfo?userID=${userID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text(); // Retrieve error message from backend
        console.error("Backend error:", errorText);
        throw new Error("Failed to update user data");
      }
      const data = await response.json();
      console.log("Update successful:", data.message);
      setUserData(editData);
      setShowEditOverlay(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    Cookies.remove("userId"); // Remove userId cookie on logout
    router.push("/home"); // Redirect to home page
  };

  if (!userData) {
    return <div>Loading...</div>; // Loading state
  }

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800">
      <div className="relative z-10">
        <NavBar />
      </div>

      <div
        className="relative flex justify-center items-center bg-cover bg-center w-full h-64"
        style={{ backgroundImage: "url('/img5.png')" }}
      >
        <h1 className="px-4 py-2 font-bold text-7xl text-white">
          Your Information
        </h1>
      </div>

      <div className="bg-white shadow-lg mx-auto mt-6 p-6 rounded-md max-w-2xl">
        <div className="gap-4 grid grid-cols-2">
          <div>
            <label className="block font-medium text-gray-600 text-sm">
              First name
            </label>
            <input
              type="text"
              value={userData.first_name}
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
              value={userData.last_name}
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
            value={userData.id_card}
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
            value={userData.dob}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Phone No.
          </label>
          <input
            type="text"
            value={userData.phone_no}
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
            value={userData.address}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Bank Name
          </label>
          <input
            type="text"
            value={userData.bank_name}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Bank Account Number
          </label>
          <input
            type="text"
            value={userData.bank_acc_no}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-600 text-sm">
            Credit Score
          </label>
          <input
            type="text"
            value={userData.credit_score}
            readOnly
            className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
          />
        </div>

        <div className="mt-4 text-end">
          <button
            onClick={handleEdit}
            className="ml-2 text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={handleLogout}
            className="bg-black hover:bg-gray-500 px-4 py-2 rounded-md text-white"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Edit Overlay */}
      {showEditOverlay && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white shadow-md p-6 rounded-md max-w-md">
            <h2 className="mb-4 font-bold text-xl">Edit Your Information</h2>
            <div className="gap-4 grid grid-cols-2">
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  First name
                </label>
                <input
                  type="text"
                  value={editData?.first_name}
                  onChange={(e) =>
                    handleEditChange("first_name", e.target.value)
                  }
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Last name
                </label>
                <input
                  type="text"
                  value={editData?.last_name}
                  onChange={(e) =>
                    handleEditChange("last_name", e.target.value)
                  }
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Citizen ID
                </label>
                <input
                  type="text"
                  value={editData?.id_card}
                  onChange={(e) => handleEditChange("id_card", e.target.value)}
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={editData?.dob}
                  onChange={(e) => handleEditChange("dob", e.target.value)}
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Phone No.
                </label>
                <input
                  type="text"
                  value={editData?.phone_no}
                  onChange={(e) => handleEditChange("phone_no", e.target.value)}
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Address
                </label>
                <input
                  type="text"
                  value={editData?.address}
                  onChange={(e) => handleEditChange("address", e.target.value)}
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Bank Name
                </label>
                <select
                  value={editData?.bank_name || ""}
                  onChange={(e) =>
                    handleEditChange("bank_name", e.target.value)
                  }
                  className="block border-gray-300 bg-white shadow-sm mt-1 rounded-md w-full"
                >
                  <option value="" disabled>
                    Select a bank
                  </option>
                  <option value="City Bank">City Bank</option>
                  <option value="Community Bank">Community Bank</option>
                  <option value="First Financial">First Financial</option>
                  <option value="First National Bank">
                    First National Bank
                  </option>
                  <option value="Global Bank">Global Bank</option>
                  <option value="Global Trust">Global Trust</option>
                  <option value="National Bank">National Bank</option>
                  <option value="Sample Bank">Sample Bank</option>
                  <option value="Secure Savings">Secure Savings</option>
                  <option value="Trust Bank">Trust Bank</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={editData?.bank_acc_no}
                  onChange={(e) =>
                    handleEditChange("bank_acc_no", e.target.value)
                  }
                  className="block border-gray-300 shadow-sm mt-1 rounded-md w-full"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCancelEdit}
                className="mr-4 text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-md text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
