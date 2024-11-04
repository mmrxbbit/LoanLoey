"use client";

import NavBar from "../../components/NavBar";
import { useState } from "react";
import Image from "next/image";
import logo_white from "../../../public/logo_white.png";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function Borrow() {
  const [showOverlay1, setShowOverlay1] = useState(false);
  const toggleOverlay1 = () => {
    setShowOverlay1(!showOverlay1);
  };

  const [showOverlay2, setShowOverlay2] = useState(false);
  const toggleOverlay2 = () => {
    setShowOverlay2(false);
  };

  const confirmOverlay1 = () => {
    setShowOverlay1(false);
    setShowOverlay2(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close overlay if clicking on the background, not the content
    if (e.target === e.currentTarget) {
      toggleOverlay2();
    }
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
                className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                name="subloan"
                onClick={toggleOverlay1}
                className="bg-gray-800 hover:bg-gray-900 py-2 rounded-md w-32 text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {showOverlay1 && (
        <div className="overlay">
          <div className="overlay-content">
            <h1>Summary</h1>
            <h2>Total</h2>
            <h2>Due Date</h2>
            <div className="flex flex-row gap-x-4">
              <button onClick={toggleOverlay1}>Cancel</button>
              <button onClick={confirmOverlay1}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showOverlay2 && (
        <div className="overlay" onClick={handleOverlayClick}>
          <div className="flex flex-col w-full">
            <Image src="loanshark.jpg" alt="loanshark" />
            <Image src="complete.png" alt="complete" />
          </div>
        </div>
      )}
    </>
  );
}
