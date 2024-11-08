import Link from "next/link";

export default function AdminSignup() {
  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="space-y-6 bg-white shadow-lg p-8 rounded-lg w-1/3 max-w-lg">
        <h2 className="mb-4 font-bold text-2xl text-center">Sign up</h2>

        {/* Signup Form */}
        <form className="space-y-4">
          <label className="block">
            <span className="text-gray-700">First name</span>
            <input
              type="text"
              className="block mt-1 px-4 py-2 border focus:border-black rounded-md w-full focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Last name</span>
            <input
              type="text"
              className="block mt-1 px-4 py-2 border focus:border-black rounded-md w-full focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Username</span>
            <input
              type="text"
              className="block mt-1 px-4 py-2 border focus:border-black rounded-md w-full focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Password</span>
            <input
              type="password"
              className="block mt-1 px-4 py-2 border focus:border-black rounded-md w-full focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Confirm password</span>
            <input
              type="password"
              className="block mt-1 px-4 py-2 border focus:border-black rounded-md w-full focus:outline-none"
            />
          </label>

          <Link href="/AdminHome">
            <button
              type="submit"
              className="bg-[#FFD28F] hover:bg-[#f5c680] mt-4 py-2 rounded-md w-full text-black hover:text-white"
            >
              Sign up
            </button>
          </Link>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            log in
          </Link>
        </p>
      </div>
    </div>
  );
}
