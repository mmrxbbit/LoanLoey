"use client";

import NavBar from "../../components/NavBar";
import { useState, useEffect, use } from "react";

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

  return (
    <div className="w-full px-2 py-4 border-1 border-b-gray-300 border-t-white border-r-white border-l-white flex flex-row">
      {/* debt info */}
      <div className="w-2/6 grid grid-cols-2 text-nowrap">
        <div className="flex flex-col gap-y-2 text-left">
          <p className="text-base font-semibold">Total</p>
          <p className="text-base font-semibold">Due Date</p>
          <p className="text-base font-semibold">Initial Amount</p>
          <p className="text-base font-semibold">Interest Rate</p>
          <p className="text-base font-semibold">Interest</p>
        </div>
        <div className="flex flex-col gap-y-2 text-left">
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
        >
          pay
        </button>
        <p className={statusColor}>{loanStatus}</p>
      </div>
    </div>
  );
}

export default function Debt() {
  return (
    <>
      <NavBar></NavBar>
      <div className="w-auto h-auto px-12">
        <div className="w-full flex items-center justify-center">
          <h1 className="text-center my-4 font-semibold text-xl">User Debt</h1>
        </div>
        {debtData.map((loan) => (
          <DebtInfo
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
