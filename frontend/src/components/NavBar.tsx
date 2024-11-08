import React, { useEffect, useState } from "react";
import Image from "next/image";
import dropdownIcon from "../../public/dropdown.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

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
  const [canDelete, setDelete] = useState(true);
  const router = useRouter();

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
    setDebtMessage(debt > 0 ? "You have debt!!" : "You have no debt");
    setDelete(debt > 0 ? false : true);
  }, []);

  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [showOverlay3, setShowOverlay3] = useState(false);

  // Handle the delete button click
  const openOverlay1 = (event) => {
    event.preventDefault(); // Prevent form submission
    setShowOverlay1(true);
  };

  // close overlay 1 open overlay 2 or 3
  const confirmOverlay1 = (event) => {
    event.preventDefault();
    if (!canDelete) {
      setShowOverlay1(false);
      setShowOverlay2(true);
    } else {
      setShowOverlay1(false);
      openOverlay3(event);
    }
  };

  // close overlay 2
  const closeOverlay2 = () => {
    setShowOverlay2(false);
  };

  // Open overlay 3
  const openOverlay3 = (event) => {
    event.preventDefault(); // Prevent form submission
    setShowOverlay3(true);
    setTimeout(() => {
      setShowOverlay3(false); // Close overlay
      router.push("/login"); // Replace with your target page path
    }, 5000); // 1 seconds = 1000 ms
  };

  // close overlay 3
  const closeOverlay3 = () => {
    setShowOverlay2(false);
  };

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
                    onClick={openOverlay1}
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
                  <div className="flex justify-start mt-4 gap-x-4">
                    <p className="font-semibold text-xl">
                      Are you sure you want to{" "}
                      <span className="text-red-500">delete</span> this account?
                    </p>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="flex flex-row justify-center gap-x-10 bg-white px-10 pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => setShowOverlay1(false)}
                  className="inline-flex justify-center bg-black hover:bg-gray-800 shadow-sm px-3 py-2 rounded-md w-full font-semibold text-sm text-white"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={(event) => confirmOverlay1(event)}
                  className="inline-flex justify-center bg-red-600 hover:bg-red-500 shadow-sm px-3 py-2 rounded-md w-full font-semibold text-sm text-white"
                >
                  Delete
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
                <h1 className="font-semibold text-xl">
                  Delete failed, there are debt remaining in your account.
                </h1>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog open={showOverlay3} onClose={closeOverlay3}>
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
                <h1 className="font-semibold text-xl">Delete success.</h1>
                <h1 className="font-semibold text-xl">
                  Going back to login page.
                </h1>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
