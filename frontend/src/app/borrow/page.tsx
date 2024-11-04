import NavBar from "../../components/NavBar";
import Image from "next/image";
import { useState } from "react";

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
      <Image src="logo_white.png" alt="logo" />
      <div className="flex flex-col items-center min-h-screen">
        <div className="mt-2 p-8 rounded-md w-full max-w-lg">
          <h1 className="font-semibold text-2xl">How much and How long?</h1>
          <form className="space-y-4">
            <div className="flex flex-row">
              <label className="font-semibold text-2xl">Amount</label>
              <input
                type="text"
                name="amount"
                placeholder="Amount you want to borrow"
                className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
              />
            </div>
            <div className="flex flex-row">
              <label className="font-semibold text-2xl">Due Date</label>
              <input
                type="date"
                name="duedate"
                className="border-gray-300 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
              />
            </div>
            <button
              type="submit"
              name="subloan"
              onClick={toggleOverlay1}
              className="bg-gray-800 hover:bg-gray-900 py-2 rounded-md w-32 text-white"
            >
              Submit
            </button>
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
