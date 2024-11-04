"use client";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import homeimg from "../../../public/homeimg.png";

export default function Home() {
  return (
    <>
      <NavBar></NavBar>
      <Image
        src={homeimg}
        alt="home"
        width="1000"
        height="1000"
        className="absolute w-screen h-screen"
      />
      <div className="bg-black w-screen h-screen flex justify-center grid grid-rows-3">
        <div className="row-span-2"></div>
        <a href="./borrow">
          <button
            type="button"
            className="relative bg-[#FFD28F] text-black font-bold p-4 rounded-lg"
          >
            Borrow now
          </button>
        </a>
      </div>
    </>
  );
}
