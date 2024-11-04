import React from "react";
import Image from "next/image";
import dropdownIcon from "../../public/dropdown.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";

export default function NavBar() {
  const PageName = [
    { name: "Home", path: "/home" },
    { name: "User Information", path: "/userinfo" },
    { name: "Borrow Money", path: "/borrow" },
    { name: "User Debt", path: "/userdebt" },
  ];

  return (
    <>
      <header className="p-3 bg-black text-white items-center">
        <nav className="flex flex-row justify-between ">
          <div className="flex flex-row items-center gap-1">
            <div className="bg-green-400 w-4 h-4 rounded-full"></div>
            <p className="font-bold">Username</p>
          </div>

          <p className="items-center font-bold">Debt Status</p>

          <Menu as="div" className="relative">
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
