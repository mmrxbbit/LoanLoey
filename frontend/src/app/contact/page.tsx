"use client";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      {/* image */}
      <div className="relative">
        <div
          className="flex justify-center items-center bg-cover bg-center h-96"
          style={{
            backgroundImage: "url('/img3.png')",
          }}
        >
          <h1 className="font-bold text-7xl text-white">Contact</h1>
        </div>
      </div>

      {/* contact info. */}
      <div className="gap-8 grid grid-cols-2 px-16 py-12">
        {/* left column */}
        <div>
          <h2 className="mb-4 font-bold text-2xl">Phone</h2>
          <p>
            If you like to hear a voice at the other end, we're there for you
            with everything you need. <br />
            <strong>Call</strong>: 000-000-000 <br />
            <strong>Hours</strong>: Monday - Sunday, 10:00 - 22:00
          </p>

          <h2 className="mt-8 mb-4 font-bold text-2xl">Email</h2>
          <p>
            If you need help anytime, day or night. Feel free to email us and
            we'll get back to you as soon as possible. <br />
            <a href="mailto:loanloey@gmail.com" className="underline">
              loanloey@gmail.com
            </a>
          </p>

          <h2 className="mt-8 mb-4 font-bold text-2xl">Map</h2>
          <div className="mr-8 ml-2">
            <img src="/img4.png" alt="map" className="w-auto h-auto"></img>
          </div>
        </div>

        {/* right column */}
        <div>
          <h2 className="mb-4 font-bold text-2xl">Social Media</h2>
          <p className="mb-4">
            You can follow us on social media, leave comments, see what other
            people have to say.
          </p>
          <div className="flex space-x-4 mb-8">
            {/* Icons can be added here */}
            <div className="bg-gray-400 rounded-full w-10 h-10"></div>
            <div className="bg-gray-400 rounded-full w-10 h-10"></div>
            <div className="bg-gray-400 rounded-full w-10 h-10"></div>
            <div className="bg-gray-400 rounded-full w-10 h-10"></div>
          </div>

          <h2 className="mb-4 font-bold text-2xl">Feedback Center</h2>
          <p className="mb-8">
            Tell us about your experience in the store or with our website,
            mobile app, any of our services or with the customer service. We are
            always looking to improve and welcome your feedback.
          </p>

          <h2 className="mb-4 font-bold text-2xl">FAQ</h2>
          <p>
            The fastest way to get answers is to read our frequently asked
            questions (FAQ).
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
