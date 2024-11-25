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
  const [validationErrors, setValidationErrors] = useState<Partial<UserData>>(
    {}
  );
  const router = useRouter();

  interface UserData {
    first_name: string;
    last_name: string;
    id_card: string;
    dob: string;
    phone_no: string;
    address: string;
    bank_name: string;
    bank_acc_no: string;
  }

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

  const handleEditChange = (field: keyof UserData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined })); // Clear the error for the field
  };

  const handleCancelEdit = () => {
    setShowEditOverlay(false);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Basic validation
      const errors: Partial<UserData> = {};

      // Validate First Name
      if (!editData?.first_name || editData.first_name.trim() === "") {
        errors.first_name = "First name is required.";
      }

      // Validate Last Name
      if (!editData?.last_name || editData.last_name.trim() === "") {
        errors.last_name = "Last name is required.";
      }

      // Validate Citizen ID (13 digits)
      if (!/^\d{13}$/.test(editData?.id_card)) {
        errors.id_card = "Citizen ID must be exactly 13 digits.";
      }

      // Validate Phone Number (10 digits)
      if (!/^\d{10}$/.test(editData?.phone_no)) {
        errors.phone_no = "Phone number must be exactly 10 digits.";
      }

      // Validate Address
      if (!editData?.address || editData.address.trim() === "") {
        errors.address = "Address is required.";
      }

      // Validate Birth Date
      if (!editData?.dob || editData.dob === "") {
        errors.dob = "Birth Date is required.";
      }

      // Validate Bank Account Number (10 digits)
      if (!/^\d{10}$/.test(editData?.bank_acc_no)) {
        errors.bank_acc_no = "Bank account number must be exactly 10 digits.";
      }

      // If there are validation errors, log them and return
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

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

      setUserData(editData); // Update the state with the new data
      setShowEditOverlay(false); // Close the overlay
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
    <div className="bg-gray-100 h-full text-gray-800">
      <div className="relative z-10">
        <NavBar />
      </div>

      <div
        className="relative flex justify-center items-center bg-cover bg-center shadow-lg w-full"
        style={{ backgroundImage: "url('/img5.png')", height: 400 }}
      >
        <h1 className="px-4 py-2 font-bold text-7xl text-white">
          Your Information
        </h1>
      </div>

      <div className="bg-white shadow-lg mx-auto mt-6 p-6 rounded-md max-w-7xl">
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
      </div>

      <div className="pb-7">
        <div className="flex justify-end mt-3 mr-28">
          <button
            onClick={handleEdit}
            className="ml-2 text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="mt-1 text-center">
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
                  required
                  onChange={(e) =>
                    handleEditChange("first_name", e.target.value)
                  }
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.first_name ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.first_name && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.first_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Last name
                </label>
                <input
                  type="text"
                  value={editData?.last_name}
                  required
                  onChange={(e) =>
                    handleEditChange("last_name", e.target.value)
                  }
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.last_name ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.last_name && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.last_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Citizen ID
                </label>
                <input
                  type="text"
                  value={editData?.id_card}
                  onChange={(e) => handleEditChange("id_card", e.target.value)}
                  required
                  maxLength={13} // Limits input to 13 characters
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.id_card ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.id_card && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.id_card}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={editData?.dob}
                  required
                  onChange={(e) => handleEditChange("dob", e.target.value)}
                  max={new Date().toISOString().split("T")[0]} // Sets today's date as the maximum
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.dob ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.dob && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.dob}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Phone No.
                </label>
                <input
                  type="text"
                  value={editData?.phone_no}
                  required
                  onChange={(e) => handleEditChange("phone_no", e.target.value)}
                  maxLength={10}
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.phone_no ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.phone_no && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.phone_no}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-600 text-sm">
                  Address
                </label>
                <input
                  type="text"
                  value={editData?.address}
                  required
                  onChange={(e) => handleEditChange("address", e.target.value)}
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.address ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.address && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.address}
                  </p>
                )}
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
                  maxLength={10} // Limits input to 10 characters
                  className={`block border-gray-300 shadow-sm mt-1 rounded-md w-full ${
                    validationErrors.bank_acc_no ? "border-red-500" : ""
                  }`}
                />
                {validationErrors.bank_acc_no && (
                  <p className="mt-1 text-red-500 text-xs">
                    {validationErrors.bank_acc_no}
                  </p>
                )}
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
                className="bg-[#cfa464] hover:bg-[#bd8e48] px-4 py-2 rounded-md text-white"
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
