import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../public/logo_nobg.png";
import dropdownIcon from "../../public/dropdown_arrow.svg";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const user = [
  {
    userId: null,
    username: null,
    credit: null,
    debt: null,
  },
];

export default function NavBar() {
  const PageName = [
    { name: "Information", path: "/userinfo" },
    { name: "Borrow Money", path: "/borrow" },
    { name: "User Debt", path: "/userdebt" },
  ];

  const { userId, username, credit, debt } = user[0];
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(username));
  const [creditColor, setcreditColor] = useState("");
  const [canDelete, setDelete] = useState(true);

  useEffect(() => {
    if (credit === "green") {
      setcreditColor("bg-green-400");
    } else if (credit === "yellow") {
      setcreditColor("bg-amber-500");
    } else {
      setcreditColor("bg-red-600");
    }
  }, []);

  useEffect(() => {
    setDelete(debt > 0 ? false : true);
    setIsLoggedIn(username ? true : false);
  }, []);

  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [showOverlay3, setShowOverlay3] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const router = useRouter();

  // Handle the delete button click
  const openOverlay1 = (event) => {
    event.preventDefault(); // Prevent form submission
    setDropdownOpen(false); // Close the dropdown
    setShowOverlay1(true);
  };

  // close overlay 1 open overlay 2 or 3
  const confirmOverlay1 = (event) => {
    event.preventDefault();
    setShowOverlay1(false);
    canDelete ? openOverlay3(event) : setShowOverlay2(true);
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
    }, 2500); // 1 seconds = 1000 ms
  };

  // close overlay 3
  const closeOverlay3 = () => {
    setShowOverlay2(false);
  };

  return (
    <>
      <nav className="flex justify-between items-center bg-[#FFD28F] px-4 py-1 text-white">
        <div className="flex flex-row items-center gap-x-2">
          <Image
            src={logo}
            alt="logo"
            width={35}
            height={35}
            className="py-1 w-auto h-full"
          />
          <span className="font-semibold text-black text-xl">LoanLoey</span>
        </div>
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
            <Menu
              as="div"
              className="relative flex justify-center"
              style={{ zIndex: 20 }}
            >
              <MenuButton
                className="flex items-center space-x-2"
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setRotation((prevRotation) => (prevRotation === 0 ? 180 : 0)); // Toggle rotation between 0 and 180
                }}
              >
                <span className={`${creditColor} w-2 h-2 rounded-full`}></span>
                <span className="text-black">{username}</span>
                <span
                  className="transition-transform duration-300"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <Image
                    src={dropdownIcon}
                    alt="dropdown"
                    width={24}
                    height={24}
                  />
                </span>
              </MenuButton>

              {dropdownOpen && (
                <MenuItems
                  key="dropdownmenu"
                  transition
                  className="top-full right-0 absolute bg-white ring-opacity-5 data-[closed]:opacity-0 shadow-md mt-2 rounded-md divide-y divide-gray-300 ring-1 ring-black w-48 data-[closed]:transform origin-top-right transition focus:outline-none data-[closed]:scale-95 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  {PageName.map((page) => (
                    <div key={page.name}>
                      <MenuItem key={page.name}>
                        <Link
                          href={page.path}
                          className="block data-[focus]:bg-gray-100 px-4 py-2 data-[focus]:rounded-md font-base text-base text-black data-[focus]:text-gray-800"
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
                        className="block data-[focus]:bg-gray-200 px-4 py-2 data-[focus]:rounded-md font-base text-base text-red-500 data-[focus]:text-red-500 cursor-pointer"
                      >
                        Delete Account
                      </a>
                    </MenuItem>
                  </div>
                </MenuItems>
              )}
            </Menu>
          ) : (
            <Link href="/login">
              <div className="bg-black hover:bg-[#a1865d] shadow-7xl hover:shadow-lg px-4 py-1 rounded-lg text-center text-white transition-shadow duration-300 cursor-pointer">
                Log In
              </div>
            </Link>
          )}
        </div>
      </nav>

      <Dialog open={showOverlay1} onClose={() => setShowOverlay1(false)}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-100 bg-opacity-75 data-[closed]:opacity-0 transition-opacity data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="z-10 fixed inset-0 w-screen overflow-y-auto">
          <div className="flex justify-center items-center min-h-full">
            <DialogPanel
              transition
              className="relative border-gray-300 bg-white data-[closed]:opacity-0 shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden overflow-hidden data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="bg-white px-10 pt-2 pb-4">
                <div className="mt-2 text-center">
                  <div className="flex justify-start gap-x-4 mt-4">
                    <p className="font-base text-xl">
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
              className="relative border-gray-300 bg-white shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
            >
              <div className="flex flex-col justify-center gap-y-2 p-4">
                <h1 className="font-base text-xl">
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
              className="relative border-gray-300 bg-white shadow-xl p-2 border rounded-md w-96 transform transform transition-all data-[closed]:translate-y-4 data-[enter]:duration-300 data-[leave]:duration-200 overflow-hidden overflow-hidden data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:scale-95"
            >
              <div className="flex flex-col justify-center gap-y-2 p-4">
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
