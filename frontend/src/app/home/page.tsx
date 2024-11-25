"use client";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Image from "next/image";
import qoute1 from "../../../public/quote1.svg";
import qoute2 from "../../../public/quote2.svg";
import backgroudimg from "../../../public/img1.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow bg-gray-100">
        <section className="relative bg-black w-full h-[400px]">
          <Image
            src={backgroudimg}
            alt="Background Image"
            className="absolute inset-0 opacity-50 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <h1 className="font-bold text-5xl">Your Trust, Our Expertise</h1>
            <p className="mt-2 text-2xl">Loan now with LoanLoey</p>
          </div>
        </section>
        <section className="bg-black px-16 py-20 text-white">
          <h2 className="px-4 font-semibold text-3xl">Who are we</h2>
          <p className="mt-4 px-12 text-lg italic">
            <span className="inline-flex items-center">
              <Image src={qoute1} alt="qoute" width={16} height={16} />
            </span>
            {"  "}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            quis nisi vitae urna pharetra pulvinar. In ornare nunc vel semper
            molestie. Praesent non eros tristique, suscipit mauris vitae,
            viverra mauris. Aenean luctus erat in purus lacinia sodales. Lorem
            ipsum, dolor sit amet consectetur adipisicing elit. Doloribus
            sapiente ipsum reprehenderit eum dolorum, omnis iure voluptates.
            Tempore nam qui, optio, dolorem, praesentium quasi reiciendis quo
            quia voluptatum culpa et. Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Vitae blanditiis, aliquam veritatis molestias
            labore facere fugiat dicta et quasi velit deserunt ullam impedit
            commodi aut eos debitis animi quisquam. Quas!{"  "}
            <span className="inline-flex items-center">
              <Image src={qoute2} alt="qoute" width={16} height={16} />
            </span>
          </p>
        </section>
        <section className="text-right bg-black px-16 py-20 text-white">
          <h2 className="px-4 font-semibold text-3xl">What do we offer</h2>
          <p className="mt-4 px-12 text-lg italic">
            <span className="inline-flex items-center">
              <Image src={qoute1} alt="qoute" width={16} height={16} />
            </span>
            {"  "}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            quis nisi vitae urna pharetra pulvinar. In ornare nunc vel semper
            molestie. Praesent non eros tristique, suscipit mauris vitae,
            viverra mauris. Aenean luctus erat in purus lacinia sodales. Lorem
            ipsum dolor sit amet consectetur adipisicing elit. Quis laboriosam
            aliquid veniam excepturi quibusdam consequatur in illum eos rem
            recusandae, facilis alias eius quasi fugit at sequi repudiandae
            perferendis! Dolore? Lorem, ipsum dolor sit amet consectetur
            adipisicing elit. Alias aspernatur dolor laborum pariatur beatae
            temporibus autem asperiores consequatur amet vitae. Repellendus ad
            alias nihil aliquid magnam distinctio iusto cumque. A!{"  "}
            <span className="inline-flex items-center">
              <Image src={qoute2} alt="qoute" width={16} height={16} />
            </span>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
