import Link from "next/link";
import { useState } from "react";

export default function NavBarB({ username }) {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(username));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center bg-[#FFD28F] p-4 text-white">
      <span className="font-bold text-black text-lg">LoanLoey</span>{" "}
      {/* Plain text */}
      <div className="flex items-center space-x-4">
        <Link href="/home" className="text-black hover:underline">
          <span className="cursor-pointer">Home</span> {/* No <a> */}
        </Link>
        <Link href="/AboutUs" className="text-black hover:underline">
          <span className="cursor-pointer">About Us</span> {/* No <a> */}
        </Link>
        <Link href="/contact" className="text-black hover:underline">
          <span className="cursor-pointer">Contact</span> {/* No <a> */}
        </Link>
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2"
            >
              <span>{username}</span>
              <span className="material-icons">expand_more</span>
            </button>
            {dropdownOpen && (
              <div className="right-0 absolute bg-white shadow-md mt-2 rounded w-48 text-black">
                <Link href="/profile">
                  <span className="block px-4 py-2 cursor-pointer">
                    Information
                  </span>
                </Link>
                <Link href="/loan">
                  <span className="block px-4 py-2 cursor-pointer">Loan</span>
                </Link>
                <Link href="/debt">
                  <span className="block px-4 py-2 cursor-pointer">Debt</span>
                </Link>
                <button
                  className="block px-4 py-2 w-full text-left"
                  onClick={() => alert("Are you sure?")}
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <div className="bg-black shadow-2xl px-4 py-2 rounded-lg text-center text-white cursor-pointer">
              Sign In
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
