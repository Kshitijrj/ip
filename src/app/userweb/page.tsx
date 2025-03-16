import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 overflow-y-auto">
      {/* Hero Section */}
      <section
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          // backgroundImage: "url('/fashion-3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundColor: "rgba(0.3, 0.2, 0.4)",
        }}
      >
        <div className="bg-black bg-opacity-50 text-white p-10 rounded-lg text-center">
          <h1 className="text-5xl font-bold">Unleash Your Style</h1>
          <p className="mt-4 text-lg">Discover the latest fashion trends</p>
          <button className="mt-6 px-6 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition">
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6 border border-red-500">
        <h2 className="text-3xl font-bold text-center mb-10">Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-5 shadow-lg rounded-lg">
              <img
                src={`/fashion-${item}.jpg`}
                alt="Fashion Item"
                className="w-full h-64 object-cover rounded-lg"
              />
              <h3 className="mt-4 text-xl font-semibold">Stylish Outfit</h3>
              <p className="text-gray-500">$49.99</p>
              <button className="mt-4 w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6 bg-gray-200 border border-blue-500">
        <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Men", "Women", "Accessories", "Shoes"].map((category) => (
            <div key={category} className="bg-white p-6 shadow-lg text-center rounded-lg">
              <h3 className="text-xl font-semibold">{category}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black text-white text-center">
        <h2 className="text-3xl font-bold">Stay Updated</h2>
        <p className="mt-2">Sign up for our newsletter to get the latest deals.</p>
        <div className="mt-6 flex justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 w-64 rounded-l-lg text-gray-200"
          />
          <button className="bg-amber-500 px-6 py-2 rounded-r-lg font-bold">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
};

export default Page;
