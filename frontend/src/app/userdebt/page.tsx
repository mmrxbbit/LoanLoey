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
  total: number;
  dueDate: string;
  initAmount: number;
  interestRate: number;
  interest: number;
  status: string;
  updateStatus: () => void;
}

interface LoanResponse {
  total: number;
  due_date_time: string;
  initial_amount: number;
  interest_rate: number;
  interest: number;
  status: string;
}

function DebtInfo(props: Props) {
  const [loanStatus, setStatus] = useState("");
  const [statusColor, setColor] = useState("");
  useEffect(() => {
    // Determine loanStatus based on status
    if (props.status === "complete") {
      setStatus("01/01/2100");
      setColor("text-emerald-500");
    } else if (props.status === "overdue") {
      setStatus("*overdue*");
      setColor("text-red-600");
    } else {
      setStatus("");
      setColor("");
    }
  }, [props.status]);

  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);

  const [canPay, setPay] = useState(false);
  useEffect(() => {
    if (props.status === "complete") {
      setPay(false);
    } else {
      setPay(true);
    }
  }, [props.status]);

  // Handle the submit button click
  const openOverlay1 = (event) => {
    event.preventDefault(); // Prevent form submission
    setShowOverlay1(true);
  };

  // close overlay 1 open overlay 2
  const confirmOverlay1 = (event) => {
    event.preventDefault();

    setShowOverlay1(false);
    setShowOverlay2(true);

    // Update loan status to complete
    props.updateStatus();
  };

  // close overlay 2
  const closeOverlay2 = () => {
    setShowOverlay2(false);
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
          <button
            type="button"
            className="flex justify-center items-center bg-black hover:bg-gray-700 rounded-md w-24 h-8 text-white"
            onClick={!canPay ? undefined : (event) => openOverlay1(event)}
          >
            pay
          </button>
          <p className={statusColor}>{loanStatus}</p>
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
              className="relative border-gray-300 bg-white data-[closed]:opacity-0 shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden overflow-hidden data-[enter]:ease-out data-[leave]:ease-in"
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
                    <p className="font-base">total_num</p>
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

      <Dialog open={showOverlay2} onClose={closeOverlay2}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center sm:items-center p-4 sm:p-0 min-h-full text-center">
            <DialogPanel
              transition
              className="relative border-gray-300 bg-white shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
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
  const userId = 1;
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
      if (userId == null) return; // Ensure userId is valid
      try {
        // Fetch loan info
        const response = await fetch(
          `http://localhost:8080/getUserLoans?userID=${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const loanData: LoanResponse[] = await response.json();
        console.log(loanData);

        // Process the data and calculate status
        const updatedLoanInfo = loanData.map((loan) => {
          const status =
            new Date(loan.due_date_time) > new Date() ? "pending" : "overdue";
          return {
            ...loan,
            status,
          };
        });

        setLoanInfo(updatedLoanInfo); // Update the state
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
                key={index} // Use index as the key or use a unique loanId if available
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
