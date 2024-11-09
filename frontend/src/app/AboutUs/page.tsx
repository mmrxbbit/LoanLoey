"use client";
import NavBarB from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function AboutUs() {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Navigation Bar */}
      <NavBarB username={null} />

      {/* Image Section */}
      <div
        className="relative bg-cover bg-center"
        style={{
          height: "400px",
          backgroundImage: "url(/img2.png)",
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <h1 className="font-bold text-8xl text-white">About Us</h1>
        </div>
      </div>

      {/* Our Story */}
      <div className="px-8 py-16">
        <h2 className="mb-4 ml-20 font-bold text-3xl">Our Story</h2>
        <p className="mt-5 ml-36 max-w-6xl text-left text-lg italic leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
          pellentesque ut nisi quis sollicitudin. Mauris ex risus, rutrum ac
          nunc sed, rutrum sodales nisl. Mauris eu neque tristique, ultricies
          urna at, condimentum nulla. Nunc sit amet sapien venenatis nulla
          blandit placerat. Nunc semper tincidunt ligula, at dictum neque
          euismod at. Cras quis velit turpis. Sed et mollis neque. Nulla ipsum
          elit, consectetur vitae suscipit vel, venenatis id enim. Sed ultrices
          posuere eros id sodales. Aenean in gravida orci.
        </p>
        <p className="mt-5 ml-36 max-w-6xl text-left text-lg italic leading-relaxed">
          Morbi ultricies nisi magna, sed feugiat ligula pharetra sit amet.
          Aenean ut tellus maximus, vehicula nunc at, cursus ipsum. Phasellus ut
          urna justo. Nunc dapibus ipsum non diam ullamcorper, vitae dapibus
          quam mollis. Etiam tempor vulputate dignissim. Etiam nec urna turpis.
          Ut cursus lorem neque, quis iaculis ante rutrum quis. Ut ullamcorper
          metus vitae malesuada facilisis. Quisque nunc ligula, lobortis ac
          porttitor euismod, hendrerit a diam. Mauris sollicitudin iaculis
          ipsum. Sed cursus eget massa non consequat. Nam maximus ipsum eu justo
          ultricies placerat. Nunc fringilla orci at efficitur lobortis.
        </p>
        <p className="mt-5 ml-36 max-w-6xl text-left text-lg italic leading-relaxed">
          Nam aliquam purus lectus. Fusce tincidunt nunc tempor neque tincidunt,
          at mollis ex mollis. Phasellus id accumsan metus, ut tempus arcu. Nam
          dapibus vel risus id mollis. Donec interdum a felis ac semper. In a
          porta orci. Nam condimentum ex a vehicula consequat. Duis aliquet urna
          in eros luctus molestie. Etiam sit amet bibendum tellus. Mauris nec
          venenatis ex. Integer convallis lacus at sapien dignissim luctus.
        </p>
      </div>

      {/* Our Co-founder */}
      <div className="bg-black px-8 py-16 text-center">
        <h2 className="mb-8 font-bold text-3xl">Our Co-founder</h2>
        <div className="flex justify-center space-x-8">
          {["Boss Pui", "Boss Ming", "Boss Film"].map((name) => (
            <div key={name} className="flex flex-col items-center">
              <div className="bg-gray-500 mb-4 rounded-full w-32 h-32" />
              <p>{name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
