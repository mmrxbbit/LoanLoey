import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col bg-black min-h-screen text-white">
      <div
        className="bg-cover bg-center w-full"
        style={{
          height: "400px",
          backgroundImage: "url('/header-img.jpg')",
        }}
      ></div>

      <div className="flex flex-row mt-20 w-full">
        {/* Left logo div */}
        <div className="flex flex-shrink-0 justify-center items-center ml-20 w-1/3">
          <img src="/logo.jpg" alt="Logo" className="w-100 h-100" />{" "}
          {/* Adjust size as needed */}
        </div>

        {/* Spacer div to add space between logo and gray div */}
        <div
          className="flex-grow flex-shrink-0"
          style={{ flexGrow: 0.6 }}
        ></div>

        {/* Right gray div */}
        <div className="flex flex-col flex-shrink-0 items-center bg-gray-800 px-4 py-8 rounded-md w-2/3 max-w-md">
          <form className="space-y-4 w-full">
            <input
              type="text"
              placeholder="Username"
              className="px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full text-black focus:outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 py-2 rounded-md w-full text-white"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-sm">
            Don’t have an account yet?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
