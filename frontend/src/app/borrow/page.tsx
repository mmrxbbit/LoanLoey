"use client";

import NavBar from "../../components/NavBar";
import { useState } from "react";
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
import { min } from "date-fns";

export default function Borrow() {
  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [message, setMessage] = useState("");

  const [amount, setAmount] = useState(null);
  const [returnDate, setReturnDate] = useState(null);

  const interestRate = 0.02;
  const minAmount = 1000;

  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Handle input change
  const handleAmountChange = (e) => {
    const fvalue = parseInt(e.target.value);
    setAmount(fvalue);
    setMessage("");
  };
  const handleDateChange = (date: ZonedDateTime) => {
    setReturnDate(formatter.format(date.toDate()));
  };

  // Calculate interest
  const calculateInterest = () => {
    return amount * interestRate;
  };

  // Handle the submit button click
  const openOverlay1 = (event) => {
    event.preventDefault(); // Prevent form submission
    if (amount < minAmount) {
      setMessage("You must borrow at least 1000");
      return; // Prevent oveylay from opening
    }
    setShowOverlay1(true);
  };

  // close overlay 1 open overlay 2
  const confirmOverlay1 = (event) => {
    event.preventDefault();
    setShowOverlay1(false);
    setShowOverlay2(true);
  };

  // close overlay 2
  const closeOverlay2 = () => {
    setShowOverlay2(false);
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center min-h-screen">
        <Image src={logo_white} alt="logo" width={250} height={250} />
        <div className="rounded-md w-full max-w-lg">
          <h1 className="mb-8 font-semibold text-2xl">
            How much and How long?
          </h1>
          <form className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-x-4">
              <label className="col-span-1 w-1/4 font-semibold text-xl whitespace-nowrap">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                required
                min="1000"
                value={message ? "" : amount}
                onChange={handleAmountChange}
                placeholder={message || "Amount you want borrow"}
                className={`col-span-3 border border-2 border-gray-300 px-4 py-2 rounded-md w-full text-black hover:border-gray-400 [&::-webkit-inner-spin-button]:appearance-none ${
                  message ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4">
              <label className="col-span-1 w-1/4 font-semibold text-xl whitespace-nowrap">
                Return Date
              </label>
              <DateTimePicker name="date" onSetDate={handleDateChange} />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                name="subloan"
                onClick={(event) => openOverlay1(event)}
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

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center min-h-full">
            <DialogPanel
              transition
              className="relative w-1/3 rounded-md border border-gray-300 bg-white data-[closed]:opacity-0 shadow-xl text-left transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="bg-white px-6 pt-2 pb-3">
                <div className="mt-2 text-center">
                  <DialogTitle
                    as="h3"
                    className="font-semibold text-xl text-center text-gray-900"
                  >
                    Summary
                  </DialogTitle>
                  <div className="grid grid-cols-2 mt-4">
                    <div className="flex flex-col gap-x-1 text-left">
                      <p className="text-base font-semibold">Total</p>
                      <p className="text-base font-semibold">Due Date</p>
                      <p className="text-base font-semibold">Initial Amount</p>
                      <p className="text-base font-semibold">Interest Rate</p>
                      <p className="text-base font-semibold">Interest</p>
                    </div>
                    <div className="flex flex-col gap-x-1 text-left">
                      <p className="text-base font-semibold">
                        {amount + calculateInterest()}
                      </p>
                      <p className="text-base font-semibold">
                        {returnDate ? returnDate : "No date selected"}
                      </p>
                      <p className="text-base font-semibold">{amount}</p>
                      <p className="text-base font-semibold">2%</p>
                      <p className="text-base font-semibold">
                        {calculateInterest()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="flex flex-row justify-center gap-x-4 bg-white px-4 py-3">
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
