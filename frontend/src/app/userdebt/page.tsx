"use client";

import NavBar from "../../components/NavBar";
import { useState, useEffect } from "react";
import Image from "next/image";
import complete from "../../../public/complete.png";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Cookies from "js-cookie";

interface Props {
  id: number;
  total: number;
  dueDate: string;
  initAmount: number;
  interestRate: number;
  interest: number;
  status: string;
}

interface LoanResponse {
  loan_id: number;
  total: number;
  due_date_time: string;
  initial_amount: number;
  interest_rate: number;
  interest: number;
  status: string;
}

function DebtInfo(props: Props) {
  const [loanNote, setNote] = useState("");
  const [statusColor, setColor] = useState("");
  const [canPay, setPay] = useState(false);
  const [totalAmount, setTotal] = useState(0);

  // loan status
  useEffect(() => {
    switch (props.status) {
      case "complete":
        async function fetchPaymentDetails() {
          try {
            const response = await fetch(
              `http://localhost:8080/checkPaymentDetails?loanID=${props.id}`
            );
            if (!response.ok) {
              throw new Error("Failed to fetch payment details");
            }

            const paymentDetails = await response.json();
            setNote(`Complete on: ${paymentDetails.doPayment}`);
          } catch (error) {
            console.error("Error fetching payment details:", error);
          }
        }
        fetchPaymentDetails();

        setColor("text-emerald-500");
        setPay(false);
        break;
      case "overdue":
        setNote("*overdue*");
        setColor("text-red-600");
        setPay(true);
        break;
      default:
        setNote("");
        setColor("");
        setPay(true);
    }
  }, [props.status]);

  // payment status
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentColor, setPaymentColor] = useState("");

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/getPaymentStatus?loanID=${props.id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const paymentID = data.PaymentID;
      const paymentStatus = data.CheckedStatus;

      if (paymentID) {
        switch (paymentStatus) {
          case "rejected":
            setPaymentNote(
              "Your payment has been rejected, please proceed again"
            );
            setPaymentColor("text-red-600");
            setPay(true);
            break;
          default:
            setPaymentNote("Waiting for approval");
            setPaymentColor("text-amber-500");
            setPay(false);
        }
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [props.id]);

  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [showOverlay3, setShowOverlay3] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle the submit button click
  const openOverlay1 = async (event) => {
    event.preventDefault(); // Prevent form submission

    // Make an API request to check details for the loan
    try {
      const response = await fetch(
        `http://localhost:8080/confirmPaymentDetails?loanID=${props.id}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to confirm payment details. Status: ${response.status}`
        );
      }

      const loanTotal = await response.json();
      setTotal(loanTotal.totalAmount);

      console.log("Checking Detail Response:", loanTotal); // For debugging
      setShowOverlay1(true);
    } catch (error) {
      console.error("Error checking loan detail:", error);
    }
  };

  // close overlay 1 open overlay 2
  const confirmOverlay1 = async (event) => {
    event.preventDefault();

    // Make an API request to confirm payment
    try {
      const response = await fetch(
        `http://localhost:8080/insertPayment?loanID=${props.id}`,
        {
          method: "POST", // Ensure you are sending a POST request
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to confirm payment. Status: ${response.status}`
        );
      }
      const confirm = await response.json();
      console.log("Confirm Payment Response:", confirm); // For debugging

      setShowOverlay1(false);
      setShowOverlay2(true);

      fetchPaymentStatus(); // Update payment status UI
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  // Upload File
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    // You can add further processing here, such as uploading the file to your server
  };

  const handleUploadClick = () => {
    // Trigger the hidden file input element
    document.getElementById(`fileInput-${props.id}`).click();
  };

  // Upload file to backend
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("receipt", selectedFile); // 'receipt' matches the backend key
    formData.append("loanID", props.id.toString()); // Add LoanID as a query parameter

    try {
      const response = await fetch(
        `http://localhost:8080/insertPayment?loanID=${props.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload file. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("File upload successful:", result);

      // Reset the file input and state
      setSelectedFile(null);
      const fileInput = document.getElementById(
        `fileInput-${props.id}`
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Reset file input
      }

      // Close the overlay and reset the file input
      setShowOverlay3(false);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  return (
    <>
      <div className="flex flex-row px-2 py-4 border-1 border-t-white border-r-white border-b-gray-300 border-l-white w-full">
        {/* debt info */}
        <div className="grid grid-cols-2 text-nowrap">
          <div className="flex flex-col gap-y-2 col-span-1 text-left">
            <p className="font-semibold text-base">Total</p>
            <p className="font-semibold text-base">Due Date</p>
            <p className="font-semibold text-base">Initial Amount</p>
            <p className="font-semibold text-base">Interest Rate</p>
            <p className="font-semibold text-base">Interest</p>
          </div>
          <div className="flex flex-col gap-y-2 col-span-1 w-48 text-left">
            <p className="font-base text-base">{props.total}</p>
            <p className="font-base text-base">{props.dueDate}</p>
            <p className="font-base text-base">{props.initAmount}</p>
            <p className="font-base text-base">{props.interestRate}</p>
            <p className="font-base text-base">{props.interest}</p>
          </div>
        </div>
        <div className="w-3/6"></div>
        {/* pay button */}
        <div className="flex flex-col-reverse justify-start items-center gap-y-1 w-1/6">
          {canPay ? (
            <button
              type="button"
              className="flex justify-center items-center bg-black hover:bg-gray-700 rounded-md w-24 h-8 text-white"
              onClick={openOverlay1}
            >
              pay
            </button>
          ) : null}
          <p className={`text-nowrap ${paymentColor}`}>{paymentNote}</p>
          <p className={`text-nowrap ${statusColor}`}>{loanNote}</p>
        </div>
      </div>

      <Dialog open={showOverlay1} onClose={() => setShowOverlay1(false)}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[leave]:ease-in data-[enter]:ease-out"
        />

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center min-h-full">
            <DialogPanel
              transition
              className="relative bg-white data-[closed]:opacity-0 shadow-xl p-2 border border-gray-300 rounded-md w-96 overflow-hidden transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 data-[leave]:ease-in data-[enter]:ease-out transform transform"
            >
              <div className="bg-white px-10 pt-2 pb-4">
                <div className="mt-2 text-center">
                  <DialogTitle
                    as="h3"
                    className="font-semibold text-gray-900 text-xl text-center"
                  >
                    Payment Confirmation
                  </DialogTitle>
                  <div className="flex flex-row justify-start gap-x-4 mt-4">
                    <p className="font-semibold">Total</p>
                    <p className="font-base">{totalAmount}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-left">
                      pay to [BankName] xxx-xxxx
                    </p>
                    <button
                      className="bg-transparent m-0 mt-2 p-0 border-none w-full text-sky-400 text-sm text-left text-start hover:underline cursor-pointer"
                      onClick={() => {
                        setShowOverlay1(false);
                        setShowOverlay3(true);
                      }}
                    >
                      upload payment receipt
                    </button>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="flex flex-row justify-center gap-x-10 bg-white px-10 pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => setShowOverlay1(false)}
                  className="inline-flex justify-center bg-red-600 hover:bg-red-500 shadow-sm px-3 py-2 rounded-md w-full font-semibold text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(event) => confirmOverlay1(event)}
                  className="inline-flex justify-center bg-emerald-700 hover:bg-emerald-600 shadow-sm px-3 py-2 rounded-md w-full font-semibold text-white text-sm"
                >
                  Confirm
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog open={showOverlay2} onClose={() => setShowOverlay2(false)}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[leave]:ease-in data-[enter]:ease-out"
        />

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center sm:items-center p-4 sm:p-0 min-h-full text-center">
            <DialogPanel
              transition
              className="relative bg-white shadow-xl p-2 border border-gray-300 rounded-md w-96 overflow-hidden data-[closed]:sm:scale-95 transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 data-[leave]:ease-in data-[enter]:ease-out transform transform"
            >
              <div className="flex flex-col justify-center gap-y-2 p-4">
                <div className="flex justify-center w-full">
                  <Image
                    src={complete}
                    alt="complete"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="flex justify-center w-full">
                  <h1 className="font-semibold text-xl">Payment Successful</h1>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog open={showOverlay3} onClose={() => setShowOverlay3(false)}>
        <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        <div className="fixed inset-0 flex justify-center items-center">
          <DialogPanel className="bg-white p-6 rounded-lg w-full max-w-md">
            <DialogTitle className="font-medium text-gray-900 text-lg">
              Upload Payment Receipt
            </DialogTitle>
            <div className="mt-4">
              <input
                id={`fileInput-${props.id}`}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-white"
              >
                Choose File
              </button>
              {selectedFile && (
                <p className="mt-2 text-gray-500 text-sm">
                  {selectedFile.name}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowOverlay3(false)}
                className="bg-red-600 hover:bg-red-700 mr-2 px-4 py-2 rounded-md text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Handle the file upload process
                  handleFileUpload();
                  // Close the overlay after uploading
                  setShowOverlay3(false);
                  setShowOverlay1(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white hover:"
              >
                Upload
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export default function Debt() {
  const userId = Cookies.get("userId");
  const [loanInfo, setLoanInfo] = useState<LoanResponse[] | null>(null);

  useEffect(() => {
    async function fetchLoanData() {
      if (!userId) return; // Ensure userId is valid
      // Fetch loan info
      try {
        const response = await fetch(
          `http://localhost:8080/getUserLoans?userID=${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const loanData: LoanResponse[] = await response.json();
        console.log("Check Loan Data:", loanData);
        // Process the data and calculate status
        if (loanData) {
          const updatedLoanInfo = loanData.map((loan) => ({
            ...loan,
            status:
              loan.status === "pending" &&
              new Date(loan.due_date_time) < new Date()
                ? "overdue"
                : loan.status,
          }));
          setLoanInfo(updatedLoanInfo);
        } // Update the state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchLoanData();
  }, [userId]);

  return (
    <>
      <NavBar />
      <div className="mx-20 px-12 w-auto h-auto">
        <div className="flex justify-center items-center w-full">
          <h1 className="my-4 font-semibold text-xl text-center">User Debt</h1>
        </div>
        {loanInfo
          ? loanInfo.map((loan, index) => (
              <DebtInfo
                key={index}
                id={loan.loan_id}
                total={loan.total}
                dueDate={loan.due_date_time}
                initAmount={loan.initial_amount}
                interestRate={loan.interest_rate}
                interest={loan.interest}
                status={loan.status}
              />
            ))
          : null}
      </div>
    </>
  );
}
