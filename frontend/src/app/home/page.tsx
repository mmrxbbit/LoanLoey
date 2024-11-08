"use client";
import NavBarB from "../../components/NavBarB";
import Footer from "../../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBarB username={null} />
      <main className="flex-grow bg-gray-100">
        <section className="relative bg-black w-full h-[400px]">
          <img
            src="/img1.png"
            alt="Background Image"
            className="absolute inset-0 opacity-50 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <h1 className="font-bold text-4xl">Your Trust, Our Expertise</h1>
            <p className="mt-2 text-lg">Loan now with LoanLoey</p>
          </div>
        </section>
        <section className="bg-black p-8 text-white">
          <h2 className="font-semibold text-2xl">Who are we</h2>
          <p className="mt-4 italic">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            quis nisi vitae urna pharetra pulvinar. In ornare nunc vel semper
            molestie. Praesent non eros tristique, suscipit mauris vitae,
            viverra mauris. Aenean luctus erat in purus lacinia sodales.
          </p>
        </section>
        <section className="bg-gray-200 p-8">
          <h2 className="font-semibold text-2xl">What do we offer</h2>
          <p className="mt-4 italic">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            quis nisi vitae urna pharetra pulvinar. In ornare nunc vel semper
            molestie. Praesent non eros tristique, suscipit mauris vitae,
            viverra mauris. Aenean luctus erat in purus lacinia sodales.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
