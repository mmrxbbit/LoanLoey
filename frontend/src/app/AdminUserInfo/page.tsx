"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserInfo() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [debtDetails, setDebtDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptsFetched, setReceiptsFetched] = useState(false);
  const [allPaymentStatus, setPaymentStatus] = useState<Record<number, any[]>>(
    {}
  );

  useEffect(() => {
    const fetchUserInfo = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const id = queryParams.get("userID"); // Match the query param
      console.log("Extracted userID from URL:", id); // debugging

      if (!id || isNaN(Number(id))) {
        setError("Invalid UserID format.");
        setLoading(false);
        return;
      }

      setUserId(id);

      try {
        // Fetch user information
        const userResponse = await fetch(
          `http://localhost:8080/getUserInfo?userID=${id}`
        );
        if (!userResponse.ok) {
          const errorMessage = await userResponse.text();
          throw new Error(errorMessage || "Failed to fetch user information.");
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch user debt details
        const debtResponse = await fetch(
          `http://localhost:8080/getUserLoans?userID=${id}`
        );
        if (!debtResponse.ok) {
          const errorMessage = await debtResponse.text();
          throw new Error(errorMessage || "Failed to fetch user debt details.");
        }
        const debtData = await debtResponse.json();
        setDebtDetails(debtData);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchDebtDetailsWithReceipts = async () => {
      try {
        const updatedDebtDetails = await Promise.all(
          debtDetails.map(async (debt) => {
            const receipts = await fetchReceipts(debt.loan_id);
            return { ...debt, receipts };
          })
        );

        // Also build the map for loan_id => paymentStatus
        const statusMap: Record<number, string> = {};
        updatedDebtDetails.forEach((debt) => {
          statusMap[debt.loan_id] = debt.paymentStatus;
        });

        setDebtDetails(updatedDebtDetails);
        setReceiptsFetched(true); // Mark receipts as fetched
        console.log(debtDetails);
      } catch (error) {
        console.error("Error fetching debt details with receipts:", error);
      }
    };

    if (debtDetails.length > 0 && !receiptsFetched) {
      fetchDebtDetailsWithReceipts();
    }
  }, [debtDetails, receiptsFetched]);

  const handleApproval = async (loanID: number, action: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/handlePaymentApproval?loanID=${loanID}&action=${action}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update payment status.");
      }
      alert(`Payment ${action} successfully.`);
      window.location.reload(); // Refresh the page to reflect changes
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("An error occurred while updating payment status.");
    }
  };

  const fetchReceipts = async (loanID: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/decryptReceipt?loanID=${loanID}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch receipts for LoanID: ${loanID}`);
      }
      const data = await response.json();
      return data.receipts || [];
    } catch (error) {
      console.error("Error fetching receipts:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const statusData = await Promise.all(
          debtDetails.map(async (debt) => {
            const res = await fetch(
              `http://localhost:8080/getPaymentStatus?loanID=${debt.loan_id}`
            );
            if (!res.ok) throw new Error("Failed to fetch payment status");
            const data = await res.json();
            return {
              loan_id: debt.loan_id,
              paymentStatuses: data, // assuming it's an array
            };
          })
        );

        // Reduce to a map: { loan_id: [...statuses] }
        const statusMap = statusData.reduce(
          (acc, { loan_id, paymentStatuses }) => {
            acc[loan_id] = paymentStatuses;
            return acc;
          },
          {} as Record<number, any[]>
        );

        setPaymentStatus(statusMap);
        console.log("Fetched payment status map:", statusMap);
      } catch (err) {
        console.error("Error fetching all payment statuses:", err);
      }
    };

    if (debtDetails.length > 0) {
      fetchPaymentStatus();
    }
  }, [debtDetails]);

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

      <div className="flex flex-row gap-8">
        {/* Left Side: User Information */}
        <div className="w-1/3">
          <div className="bg-white shadow-lg mx-auto p-6 rounded-md">
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
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData?.last_name || ""}
                  readOnly
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600">
                Citizen ID
              </label>
              <input
                type="text"
                value={userData.id_card}
                readOnly
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600">
                Phone no.
              </label>
              <input
                type="text"
                value={userData.phone_no}
                readOnly
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600">
                Birth Date
              </label>
              <input
                type="text"
                value={userData.dob}
                readOnly
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600">Address</label>
              <input
                type="text"
                value={userData.address}
                readOnly
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600">
                Bank Name
              </label>
              <input
                type="text"
                value={userData.bank_name}
                readOnly
                className="p-2 border border-gray-300 rounded-md w-full"
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
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-medium text-gray-600">
                Risk Level Score
              </label>
              <input
                type="text"
                value={userData.credit_score}
                readOnly
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
          </div>
        </div>

        {/* Right Side: User Debt Details */}
        <div className="w-2/3">
          <div className="bg-white shadow-lg mx-auto p-6 rounded-md">
            <h2 className="mb-4 font-bold text-2xl text-center">
              User Debt Details
            </h2>

            {/* Scrollable container */}
            <div className="gap-4 grid grid-cols-1 pr-4 max-h-[641px] overflow-y-auto">
              {debtDetails.map((debt) => {
                const loanPayments = Object.values(
                  allPaymentStatus[debt.loan_id] || {}
                );
                console.log("allpayment", allPaymentStatus);
                console.log("Loan ID: ", debt.loan_id);
                console.log("payment: ", loanPayments);

                return (
                  <div key={debt.loan_id} className="p-4 border rounded-md">
                    <div className="grid grid-cols-3 grid-rows-2">
                      <p className="font-semibold">Total: {debt.total}</p>
                      <p>Interest: {debt.interest}</p>
                      <p>Due Date: {debt.due_date_time}</p>
                      <p>Initial Amount: {debt.initial_amount}</p>
                      <p>Interest Rate: {debt.interest_rate}</p>
                      <p>Status: {debt.status}</p>
                    </div>

                    {/* Receipt Images */}
                    <div className="mt-4">
                      <p className="font-semibold">Payment Receipts:</p>
                      <div className="flex flex-row overflow-x-auto gap-6 max-w-full">
                        {Array.isArray(debt.receipts) &&
                          [...debt.receipts]
                            .slice() // clone the array
                            .reverse() // reverse it to show latest first
                            .map((receipt, index) => {
                              const status = loanPayments[index];
                              const paymentId = loanPayments[1];

                              return (
                                <div
                                  key={index}
                                  className="mt-2 mb-2 flex-shrink-0 text-center"
                                >
                                  <img
                                    src={`data:image/jpeg;base64,${receipt}`}
                                    alt={`Receipt ${paymentId}`}
                                    className="border rounded-md w-64 h-auto"
                                  />
                                  {status === "waiting" ? (
                                    <div className="flex justify-between mt-2">
                                      <button
                                        className="w-auto bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white"
                                        onClick={() =>
                                          handleApproval(debt.loan_id, "accept")
                                        }
                                      >
                                        Approve
                                      </button>
                                      <button
                                        className="w-auto bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white"
                                        onClick={() =>
                                          handleApproval(debt.loan_id, "reject")
                                        }
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : typeof status === "string" ? (
                                    <p className="mt-1">{status}</p>
                                  ) : (
                                    <div></div>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
