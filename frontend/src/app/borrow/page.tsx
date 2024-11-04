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
              <label className="font-semibold text-xl whitespace-nowrap w-1/4">
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
              <label className="font-semibold text-xl whitespace-nowrap w-1/4">
                Due Date
              </label>
              <input
                type="date"
                name="duedate"
                value={duedate}
                onChange={handleDuedateChange}
                className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
              />
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
          className="fixed inset-0 bg-gray-100 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-6 pt-5 pb-3 sm:p-6 sm:pb-4">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    Summary
                  </DialogTitle>
                  <div className="mt-2 grid grid-cols-2">
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
              <div className="bg-white px-4 py-3 flex flex-row gap-x-4">
                <button
                  type="button"
                  onClick={() => setShowOverlay1(false)}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(event) => confirmOverlay1(event)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
          className="fixed inset-0 bg-gray-100 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="flex flex-col justify-center">
                <Image
                  src={loanshark}
                  alt="loanshark"
                  width={150}
                  height={150}
                  className="w-full h-full"
                />
                <div className="w-full flex justify-center">
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
