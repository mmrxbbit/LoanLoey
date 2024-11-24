"use client";

import NavBar from "../../components/NavBar";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo_white from "../../../public/logo_white.png";
import loanshark from "../../../public/loanshark.jpg";
import complete from "../../../public/complete.png";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import DateTimePicker from "../../components/DateTimePicker";
import { ZonedDateTime } from "@internationalized/date";

export default function Borrow() {
  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [message, setMessage] = useState("");

  const [requestData, setRequestData] = useState({
    userId: 20,
    amount: 0,
    returnDate: null,
  });

  const [detail, setDetail] = useState({
    total: null,
    duedate: null,
    initAmount: null,
    interestRate: null,
    interest: null,
  });

  const minAmount = 1000;

  // Get the input element by name
  var inputElement = document.getElementsByName("returnDate")[0];

  // Ensure it's an HTMLInputElement before setting the 'min' attribute
  if (inputElement instanceof HTMLInputElement) {
    var today = new Date().toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
    inputElement.min = today; // Set the 'min' attribute
  }

  // Format date
  const formatter = (date) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Update min datetime continuously
  const [minDateTime, setMinDateTime] = useState("");
  // Format the current date and time for the min attribute
  const updateMinDateTime = () => {
    const now = new Date();

    // Get local time components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`; // Format for datetime-local
  };
  // Continuously update the minDateTime state
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMinDateTime(updateMinDateTime());
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Handle input change
  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value);
    setRequestData((prevState) => ({
      ...prevState, // Keep the previous state values
      amount: value, // Update amount
    }));
    setMessage("");
  };
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < minDateTime) {
      alert("You cannot select a time earlier than the current time.");
      setRequestData((prevData) => ({
        ...prevData,
        returnDate: minDateTime,
      }));
    } else {
      const formattedReturnDate = formatter(selectedDate);
      setRequestData((prevState) => ({
        ...prevState, // Keep the previous state values
        returnDate: formattedReturnDate, // Update return date
      }));
    }
  };

  // Handle the submit button click
  const openOverlay1 = async (event) => {
    event.preventDefault(); // Prevent form submission
    if (requestData.amount < minAmount) {
      setMessage("You must borrow at least 1000");
      return; // Prevent oveylay from opening
    }

    // Make an API request to check details for the loan
    try {
      const response = await fetch("http://localhost:8080/checkLoanDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: requestData.userId,
          initial_amount: requestData.amount,
          due_date_time: requestData.returnDate,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to check loan details. Status: ${response.status}`
        );
      }

      const data = await response.json();
      setDetail({
        total: data.total,
        duedate: data.due_date_time,
        initAmount: data.initial_amount,
        interestRate: data.interest_rate,
        interest: data.interest,
      });
      console.log("Checking Detail Response:", data); // For debugging

      setShowOverlay1(true);
    } catch (error) {
      console.error("Error checking loan detail:", error);
    }
  };

  // Confirm button click (close overlay 1 open overlay 2)
  const confirmOverlay1 = async (event) => {
    event.preventDefault();

    // Make an API request to apply for the loan
    try {
      const response = await fetch("http://localhost:8080/applyForLoan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: requestData.userId,
          initial_amount: requestData.amount,
          due_date_time: requestData.returnDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to apply for loan. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Loan Application Response:", data); // For debugging

      setShowOverlay1(false);
      setShowOverlay2(true);
    } catch (error) {
      console.error("Error applying for loan:", error);
    }
  };

  // close overlay 2
  const closeOverlay2 = () => {
    setShowOverlay2(false);
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center h-auto">
        <Image src={logo_white} alt="logo" width={250} height={250} />
        <div className="rounded-md w-full max-w-lg">
          <h1 className="mb-8 font-semibold text-2xl">
            How much and How long?
          </h1>
          <form className="space-y-4" onSubmit={(event) => openOverlay1(event)}>
            <div className="grid grid-cols-4 items-center gap-x-4">
              <label className="col-span-1 w-1/4 font-semibold text-xl whitespace-nowrap">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={message ? "" : requestData.amount}
                placeholder={message || "Amount you want borrow"}
                onChange={handleAmountChange}
                className={`col-span-3 border border-2 border-gray-300 px-4 py-2 rounded-md w-full text-black hover:border-gray-400 [&::-webkit-inner-spin-button]:appearance-none ${
                  message ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4">
              <label className="col-span-1 w-1/4 font-semibold text-xl whitespace-nowrap">
                Return Date
              </label>
              <div className="col-span-3" inert={false}>
                <input
                  type="datetime-local"
                  name="returnDate"
                  min={minDateTime}
                  value={requestData.returnDate || ""}
                  onChange={handleDateChange}
                  required
                  className="col-span-3 border border-2 border-gray-300 px-4 py-2 rounded-md w-full text-black hover:border-gray-400"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                name="subloan"
                className="bg-gray-800 hover:bg-gray-900 py-2 rounded-md w-32 text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showOverlay1} onClose={() => setShowOverlay1(false)}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed z-10 inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center min-h-full">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl transform transition-all data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="bg-white px-10 pt-2 pb-4">
                <div className="mt-2 text-center">
                  <DialogTitle
                    as="h3"
                    className="font-semibold text-xl text-center text-gray-900"
                  >
                    Summary
                  </DialogTitle>
                  <div className="grid grid-cols-2 mt-4">
                    <div className="flex flex-col gap-y-2 text-left">
                      <p className="text-base font-semibold">Total</p>
                      <p className="text-base font-semibold">Due Date</p>
                      <p className="text-base font-semibold">Initial Amount</p>
                      <p className="text-base font-semibold">Interest Rate</p>
                      <p className="text-base font-semibold">Interest</p>
                    </div>
                    <div className="flex flex-col gap-y-2 text-left">
                      <p className="text-base font-base">{detail.total}</p>
                      <p className="text-base font-base">{detail.duedate}</p>
                      <p className="text-base font-base">{detail.initAmount}</p>
                      <p className="text-base font-base">
                        {detail.interestRate}
                      </p>
                      <p className="text-base font-base">{detail.interest}</p>
                    </div>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="flex flex-row justify-center gap-x-10 bg-white px-10 py-4">
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
              className="relative bg-white data-[closed]:opacity-0 shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-lg text-left transform transition-all data-[closed]:sm:translate-y-0 data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
            >
              <div className="flex flex-col justify-center">
                <Image
                  src={loanshark}
                  alt="loanshark"
                  width={150}
                  height={150}
                  className="w-full h-full"
                />
                <div className="flex justify-center w-full">
                  <Image
                    src={complete}
                    alt="complete"
                    width={150}
                    height={150}
                  />
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
