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

interface Props {
  id: number;
  total: number;
  dueDate: string;
  initAmount: number;
  interestRate: number;
  interest: number;
  status: string;
  updateStatus: () => void;
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

  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);

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
        `http://localhost:8080/makePayment?loanID=${props.id}`,
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

      props.updateStatus(); // Update loan status to complete
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  return (
    <>
      <div className="flex flex-row border-1 px-2 py-4 border-t-white border-r-white border-b-gray-300 border-l-white w-full">
        {/* debt info */}
        <div className="grid grid-cols-2 text-nowrap">
          <div className="col-span-1 flex flex-col gap-y-2 text-left">
            <p className="font-semibold text-base">Total</p>
            <p className="font-semibold text-base">Due Date</p>
            <p className="font-semibold text-base">Initial Amount</p>
            <p className="font-semibold text-base">Interest Rate</p>
            <p className="font-semibold text-base">Interest</p>
          </div>
          <div className="col-span-1 flex flex-col gap-y-2 w-48 text-left">
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
          <p className={`text-nowrap ${statusColor}`}>{loanNote}</p>
        </div>
      </div>

      <Dialog open={showOverlay1} onClose={() => setShowOverlay1(false)}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center min-h-full">
            <DialogPanel
              transition
              className="relative border-gray-300 bg-white data-[closed]:opacity-0 shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="bg-white px-10 pt-2 pb-4">
                <div className="mt-2 text-center">
                  <DialogTitle
                    as="h3"
                    className="font-semibold text-center text-gray-900 text-xl"
                  >
                    Payment Confirmation
                  </DialogTitle>
                  <div className="flex flex-row justify-start gap-x-4 mt-4">
                    <p className="font-semibold">Total</p>
                    <p className="font-base">{totalAmount}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-left text-sm">
                      pay to [BankName] xxx-xxxx
                    </p>
                    <p className="text-left text-sky-400 text-sm">
                      upload paymet receipt
                    </p>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="flex flex-row justify-center gap-x-10 bg-white px-10 pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => setShowOverlay1(false)}
                  className="inline-flex justify-center bg-red-600 hover:bg-red-500 shadow-sm px-3 py-2 rounded-md w-full font-semibold text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(event) => confirmOverlay1(event)}
                  className="inline-flex justify-center bg-emerald-700 hover:bg-emerald-600 shadow-sm px-3 py-2 rounded-md w-full font-semibold text-sm text-white"
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
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center sm:items-center p-4 sm:p-0 min-h-full text-center">
            <DialogPanel
              transition
              className="relative border-gray-300 bg-white shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
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
    </>
  );
}

export default function Debt() {
  const userId = 20;
  const [loanInfo, setLoanInfo] = useState<LoanResponse[] | null>(null);

  const updateLoanStatus = (index: number) => {
    setLoanInfo((prevLoanInfo) => {
      if (!prevLoanInfo) return null;
      const updatedLoans = [...prevLoanInfo];
      updatedLoans[index].status = "complete"; // Update status to 'complete'
      return updatedLoans;
    });
  };

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
          <h1 className="my-4 font-semibold text-center text-xl">User Debt</h1>
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
                updateStatus={() => updateLoanStatus(index)}
              />
            ))
          : null}
      </div>
    </>
  );
}
