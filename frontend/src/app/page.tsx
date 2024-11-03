"use client";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar></NavBar>
      <div className="bg-black w-screen h-screen">
        <div className="text-white flex flex-col items-center w-full h-full">
          <div className="flex flex-row justify-center items-center gap-x-4 h-1/6">
            <h1>pic</h1>
            <h3 className="text-3xl">LoanLoey</h3>
          </div>
          <div className="flex flex-col text-center justify-evenly items-center h-3/6">
            <h1 className="text-5xl">
              Unlock your financial potential <br />
              don't miss out on our easy loan <br />
              solutions now!
            </h1>
            <a href="./borrow">
              <button
                type="button"
                className="bg-[#FFD28F] text-black font-bold p-4 rounded-lg"
              >
                Borrow now
              </button>
            </a>
          </div>
          <div className="flex justify-center items-top h-2/6">
            <h1 className="text-2xl">LoanLoey.com</h1>
          </div>
        </div>
      </div>
    </>
  );
}
