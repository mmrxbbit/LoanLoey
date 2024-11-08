// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FFD28F] p-4 text-black">
      <div className="flex justify-around">
        <div>
          <h4 className="font-bold">Company</h4>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div>
          <h4 className="font-bold">Quick Links</h4>
          <ul>
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
        <div>
          <h4 className="font-bold">Follow Us</h4>
          <div className="flex space-x-2">
            {/* Placeholder for social media icons */}
            <div className="bg-gray-400 rounded-full w-8 h-8"></div>
            <div className="bg-gray-400 rounded-full w-8 h-8"></div>
            <div className="bg-gray-400 rounded-full w-8 h-8"></div>
            <div className="bg-gray-400 rounded-full w-8 h-8"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
