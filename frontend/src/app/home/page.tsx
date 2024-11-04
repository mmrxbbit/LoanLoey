"use client";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import homeimg from "../../../public/homeimg.png";

export default function Home() {
  return (
    <>
      {/* Position NavBar at the top with a high z-index */}
      <div className="relative z-10">
        <NavBar />
      </div>
      <Image
        src={homeimg}
        alt="home"
        width="1000"
        height="1000"
        className="absolute w-screen h-screen"
      />
      <div className="flex justify-center grid grid-rows-3 bg-black w-screen h-screen">
        <div className="row-span-2"></div>
        <a href="./borrow">
          <button
            type="button"
            className="relative bg-[#FFD28F] p-4 rounded-lg font-bold text-black"
          >
            Borrow now
          </button>
        </a>
      </div>
    </>
  );
}
