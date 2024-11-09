// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FFD28F] px-16 py-8 text-black">
      <div className="flex justify-between gap-x-12">
        <div className="w-1/3 flex flex-col">
          <h4 className="font-semibold text-xl">Company</h4>
          <p className="py-4 pl-2 text-[#9F6D3A] font-medium">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam
            nam architecto qui sequi explicabo laudantium fuga quos aspernatur
            tempore
          </p>
        </div>
        <div className="w-1/4 flex flex-col ml-24">
          <h4 className="font-semibold text-xl">Quick Links</h4>
          <ul className="py-4 pl-2 flex flex-col gap-y-2 text-[#9F6D3A] font-medium">
            <Link href="/home" className="hover:underline">
              <li>Home</li>
            </Link>
            <Link href="/AboutUs" className="hover:underline">
              <li>About us</li>
            </Link>
            <Link href="/contact" className="hover:underline">
              <li>Contact</li>
            </Link>
          </ul>
        </div>
        <div className="w-1/3 flex flex-col">
          <h4 className="font-semibold text-xl">Follow Us</h4>
          <div className="flex space-x-6 py-4 pl-4">
            {/* Placeholder for social media icons */}
            <div className="bg-gray-400 rounded-full w-12 h-12"></div>
            <div className="bg-gray-400 rounded-full w-12 h-12"></div>
            <div className="bg-gray-400 rounded-full w-12 h-12"></div>
            <div className="bg-gray-400 rounded-full w-12 h-12"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
