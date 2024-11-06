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

const debtData = [
  {
    loanId: 1,
    total: new Float64Array([10500]),
    dueDate: "2022-01-01 15:00",
    initAmount: new Float64Array([10000]),
    interestRate: new Float64Array([0.05]),
    interest: new Float64Array([500]),
    status: "notComplete",
  },
  {
    loanId: 2,
    total: new Float64Array([21000]),
    dueDate: "2022-01-01 15:00",
    initAmount: new Float64Array([20000]),
    interestRate: new Float64Array([0.05]),
    interest: new Float64Array([1000]),
    status: "complete",
  },
  {
    loanId: 3,
    total: new Float64Array([31500]),
    dueDate: "2022-01-01 15:00",
    initAmount: new Float64Array([30000]),
    interestRate: new Float64Array([0.05]),
    interest: new Float64Array([1500]),
    status: "overdue",
  },
];

interface Props {
  total: Float64Array;
  dueDate: string;
  initAmount: Float64Array;
  interestRate: Float64Array;
  interest: Float64Array;
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
  };

  // close overlay 2
  const closeOverlay2 = () => {
    setShowOverlay2(false);
  };

  return (
    <>
      <div className="w-full px-2 py-4 border-1 border-b-gray-300 border-t-white border-r-white border-l-white flex flex-row">
        {/* debt info */}
        <div className="grid grid-cols-2 text-nowrap">
          <div className="w-48 flex flex-col gap-y-2 text-left">
            <p className="text-base font-semibold">Total</p>
            <p className="text-base font-semibold">Due Date</p>
            <p className="text-base font-semibold">Initial Amount</p>
            <p className="text-base font-semibold">Interest Rate</p>
            <p className="text-base font-semibold">Interest</p>
          </div>
          <div className="w-48 flex flex-col gap-y-2 text-left">
            <p className="text-base font-base">{props.total[0]}</p>
            <p className="text-base font-base">{props.dueDate}</p>
            <p className="text-base font-base">{props.initAmount[0]}</p>
            <p className="text-base font-base">{props.interestRate[0]}</p>
            <p className="text-base font-base">{props.interest[0]}</p>
          </div>
        </div>
        <div className="w-3/6"></div>
        {/* pay button */}
        <div className="w-1/6 flex flex-col-reverse justify-start items-center gap-y-1">
          <button
            type="button"
            className="flex justify-center w-24 h-8 bg-black text-white items-center rounded-md hover:bg-gray-700"
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

        <div className="fixed z-10 inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center min-h-full">
            <DialogPanel
              transition
              className="w-96 p-2 relative transform overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl transform transition-all data-[closed]:opacity-0 data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="bg-white px-10 pt-2 pb-4">
                <div className="mt-2 text-center">
                  <DialogTitle
                    as="h3"
                    className="font-semibold text-xl text-center text-gray-900"
                  >
                    Payment Confirmation
                  </DialogTitle>
                  <div className="flex flex-row justify-start mt-4 gap-x-4">
                    <p className="font-semibold">Total</p>
                    <p className="font-base">total_num</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-left">
                      pay to [BankName] xxx-xxxx
                    </p>
                    <p className="text-sm text-sky-400 text-left">
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
              className="w-96 p-2 relative transform overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
            >
              <div className="flex flex-col justify-center p-4 gap-y-2">
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
  return (
    <>
      <NavBar></NavBar>
      <div className="w-auto h-auto px-12 mx-20">
        <div className="w-full flex items-center justify-center">
          <h1 className="text-center my-4 font-semibold text-xl">User Debt</h1>
        </div>
        {debtData.map((loan) => (
          <DebtInfo
            key={loan.loanId}
            total={loan.total}
            dueDate={loan.dueDate}
            initAmount={loan.initAmount}
            interestRate={loan.interestRate}
            interest={loan.interest}
            status={loan.status}
          ></DebtInfo>
        ))}
      </div>
    </>
  );
}
