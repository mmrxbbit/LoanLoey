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

export default function Borrow() {
  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);

  const [overlayData, setOverlayData] = useState(null); // Store data to pass to the overlay
  const [amount, setAmount] = useState("");
  const [duedate, setDuedate] = useState("");

  // Handle input change
  const handleAmounttChange = (e) => {
    setAmount(e.target.value);
  };
  const handleDuedateChange = (e) => {
    setDuedate(e.target.value);
  };

  // Handle the submit button click
  const openOverlay1 = (event) => {
    event.preventDefault(); // Prevent form submission
    setOverlayData({ amount, duedate }); // Store the data to pass to the overlay
    setShowOverlay1(true);
  };

  const confirmOverlay1 = (event) => {
    event.preventDefault();
    setShowOverlay1(false);
    setShowOverlay2(true);
  };

  const closeOverlay2 = (event) => {
    setShowOverlay2(false);
  };

  return (
    <>
      <NavBar></NavBar>
      <div className="flex flex-col items-center min-h-screen">
        <Image src={logo_white} alt="logo" width={250} height={250} />
        <div className="rounded-md w-full max-w-lg">
          <h1 className="mb-8 font-semibold text-2xl">
            How much and How long?
          </h1>
          <form className="space-y-4">
            <div className="flex flex-row items-center gap-x-4">
              <label className="w-1/4 font-semibold text-xl whitespace-nowrap">
                Amount
              </label>
              <input
                type="text"
                name="amount"
                value={amount}
                onChange={handleAmounttChange}
                placeholder="Amount you want to borrow"
                className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
              />
            </div>
            <div className="flex flex-row items-center gap-x-4">
              <label className="w-1/4 font-semibold text-xl whitespace-nowrap">
                Due Date
              </label>
              <DateTimePicker />
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
          <div className="flex justify-center items-center sm:items-center p-4 sm:p-0 min-h-full text-center">
            <DialogPanel
              transition
              className="relative bg-white data-[closed]:opacity-0 shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-lg text-left transform transition-all data-[closed]:sm:translate-y-0 data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-6 sm:p-6 pt-5 pb-3 sm:pb-4">
                <div className="mt-3 sm:mt-0 sm:ml-4 text-center sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="font-semibold text-base text-gray-900"
                  >
                    Summary
                  </DialogTitle>
                  <div className="grid grid-cols-2 mt-2">
                    <div className="flex flex-col gap-x-1">
                      <p className="text-sm">Total</p>
                      <p className="text-sm">Due Date</p>
                      <p className="text-sm">Initial Amount</p>
                      <p className="text-sm">Interest Rate</p>
                      <p className="text-sm">Interest</p>
                    </div>
                    <div className="flex flex-col gap-x-1">
                      <p className="text-sm">100</p>
                      <p className="text-sm">{overlayData?.duedate}</p>
                      <p className="text-sm">{overlayData?.amount}</p>
                      <p className="text-sm">2%</p>
                      <p className="text-sm">100</p>
                    </div>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="flex flex-row gap-x-4 bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowOverlay1(false)}
                  className="inline-flex justify-center bg-red-600 hover:bg-red-500 shadow-sm sm:ml-3 px-3 py-2 rounded-md w-full sm:w-auto font-semibold text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(event) => confirmOverlay1(event)}
                  className="inline-flex justify-center bg-emerald-700 hover:bg-gray-50 shadow-sm mt-3 sm:mt-0 px-3 py-2 rounded-md ring-1 ring-gray-300 ring-inset w-full sm:w-auto font-semibold text-sm text-white"
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
