import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import dropdownIcon from "../../public/dropdown.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";

const headerInfo = [{ credit: "green", username: "john_doe", debt: 20000 }];

export default function NavBar() {
  const PageName = [
    { name: "Home", path: "/home" },
    { name: "User Information", path: "/userinfo" },
    { name: "Borrow Money", path: "/borrow" },
    { name: "User Debt", path: "/userdebt" },
  ];

  const { credit, username, debt } = headerInfo[0];
  const [creditColor, setcreditColor] = useState("");
  const [debtMessage, setDebtMessage] = useState("");

  useEffect(() => {
    if (credit === "green") {
      setcreditColor("bg-green-400");
    } else if (credit === "yellow") {
      setcreditColor("bg-yellow-400");
    } else {
      setcreditColor("bg-red-600");
    }
  }, []);

  useEffect(() => {
    if (debt > 0) {
      setDebtMessage("You have debt!!");
    } else {
      setDebtMessage("You have no debt");
    }
  }, []);

  return (
    <>
      <header className="p-3 bg-black text-white items-center">
        <nav className="flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className={`${creditColor} w-4 h-4 rounded-full`}></div>
            <p className="font-semibold">{username}</p>
          </div>

          <p className="flex items-center font-semibold">{debtMessage}</p>

          <Menu as="div" className="flex justify-center">
            <MenuButton>
              <Image
                src={dropdownIcon}
                alt="dropdown icon"
                height={24}
                width={24}
              />
            </MenuButton>

            <MenuItems
              key="dropdownmenu"
              transition
              className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-300 rounded-md bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              {PageName.map((page) => (
                <div key={page.name}>
                  <MenuItem key={page.name}>
                    <Link
                      href={page.path}
                      className="block px-4 py-2 text-sm font-bold text-gray-700 data-[focus]:bg-gray-200 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      {page.name}
                    </Link>
                  </MenuItem>
                </div>
              ))}

              <div key="delete">
                <MenuItem key="delete">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm font-bold text-red-500 data-[focus]:bg-gray-200 data-[focus]:text-red-500 data-[focus]:outline-none"
                  >
                    Delete Account
                  </a>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </nav>
      </header>
    </>
  );
}
