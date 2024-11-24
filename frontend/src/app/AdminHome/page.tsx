"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminHome() {
  const [TotalLoan, setTotalLoan] = useState<number | null>(null);
  const [usersData, setUsersData] = useState<
    {
      id: number;
      username: string;
      totalDebt: string | number;
      remainingDebt: string | number;
      risk: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch total debt
        const totalDebtResponse = await fetch(
          "http://localhost:8080/getTotalLoan"
        );
        if (!totalDebtResponse.ok) {
          throw new Error("Failed to fetch total debt");
        }
        const totalDebtData = await totalDebtResponse.json();
        console.log("Total Debt Data:", totalDebtData);
        setTotalLoan(totalDebtData.total_loan);

        // Fetch user info
        const usersResponse = await fetch(
          "http://localhost:8080/getAllUserInfoForAdmin"
        );
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        const usersData = await usersResponse.json();
        console.log("Users Data:", usersData);

        // Ensure correct formatting and fallback values
        const formattedUsers = usersData.map((user: any) => ({
          id: user.user_id || null, // Use the correct field name from the backend
          username: user.username || "Unknown User",
          totalDebt: user.total_loan !== undefined ? user.total_loan : "N/A",
          remainingDebt:
            user.total_loan_remain !== undefined
              ? user.total_loan_remain
              : "N/A",
          risk: user.risk_level || "unknown",
        }));
        console.log("Raw Users Data from Backend:", usersData);

        console.log("Formatted Users:", formattedUsers);
        setUsersData(formattedUsers);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="bg-gray-100 p-6 min-h-screen text-gray-800">
      {/* Loading/Error States */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Summary of total debt */}
          <div className="bg-black mb-4 p-4 rounded-md text-center text-white">
            <h2 className="font-bold text-xl">
              All User Debt: {TotalLoan !== null ? `${TotalLoan} ฿` : "N/A"}
            </h2>
          </div>

          {/* Scrollable Table */}
          <div className="bg-white shadow-lg p-4 rounded-md max-h-96 overflow-y-auto">
            <table className="border-collapse w-full text-left">
              <thead>
                <tr>
                  <th className="p-2 border-b">Username</th>
                  <th className="p-2 border-b">Total Debt</th>
                  <th className="p-2 border-b">Remaining Debt</th>
                  <th className="p-2 border-b">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr key={user.id}>
                    <td className="p-2 border-b">
                      <Link
                        href={`/AdminUserInfo?userID=${user.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.username}
                      </Link>
                    </td>
                    <td className="p-2 border-b text-black">
                      {user.totalDebt} ฿
                    </td>
                    <td className="p-2 border-b text-black">
                      {user.remainingDebt} ฿
                    </td>
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
        </>
      )}

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
