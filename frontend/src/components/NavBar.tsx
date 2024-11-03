import React from "react";
import Link from "next/link";

export default function NavBar() {
    return (
        <>
            <header className="p-3 bg-black text-white items-center">
                <nav className="flex flex-row justify-between ">
                    <div className="flex flex-row">
                        <div className="bg-green w-10 h-10 border-white border-solid border-1"></div>
                        <p>Username</p>
                    </div>
                        
                    <p className="">Debt Status</p>

                    <div>
                        <p>dropdown</p>
                    </div>
                </nav>
            </header>
        </>
    );
}