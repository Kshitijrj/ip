"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import serve from "./serve/page";

import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { handleClick } from "./cleintcomp/handleClick.js";
const ads = [
  {
    title: "50% Off on T-shirts!",
    image: "/download.jpg",
    description: "Get the best deals on gadgets, only for today!",
    link: "#",
  },
  {
    title: "Buy 1 Get 1 Free - Fashion Sale",
    image: "/downloads.jpg",
    description: "Trendy clothes at unbeatable prices!",
    link: "#",
  },
  {
    title: "Exclusive Travel Discounts",
    image: "/downloader.jpg",
    description: "Plan your dream vacation at half the price!",
    link: "#",
  },
  {
    title: "Buy One get One free",
    image: "/seconds.jpg",
    description: "Luxury furniture at discounted prices!",
    link: "#",
  },
  {
    title: "25% Off on Electronics",
    image: "/secondf.jpg",
    description: "Luxury furniture at discounted prices!",
    link: "#",
  },
  {
    title: "50% Off on Iphone!",
    image: "/secondt.jpg",
    description: "Luxury furniture at discounted prices!",
    link: "#",
  },
];

export default function Home() {
  const [clickCount, setClickCount] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const router = useRouter();
  

  // Fetch user's visit count from API
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/clicks"); // API to get visit count
      const result = await response.json();
      setClickCount(result.clickCount || 0);
    };
    fetchData();
  }, []);

  // Handle CAPTCHA Verification
  const handleVerify = async (token) => {
    const res = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const result = await res.json();
    if (result.success) {
      setCaptchaVerified(true);
      setShowCaptcha(false);
      if (redirectUrl) {
        router.push(redirectUrl); // Redirect after passing CAPTCHA
      }
    }
  };

  // Handle Click Event
  const handleLinkClick = async (e, url) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment", captchaToken: captchaVerified ? "valid" : null }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error("Failed to update click count:", result, "Status Code:", response.status);
        if (result.requiresCaptcha) {
          setShowCaptcha(true); // Show CAPTCHA prompt
          setRedirectUrl(url); // Store URL for redirection after verification
        }
        return;
      }
      setClickCount(result.clickCount); // Update click count state
  
      if (result.requiresCaptcha && !captchaVerified) {
        setShowCaptcha(true);
        setRedirectUrl(url);
      } else {
        router.push(url);
      }
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  };
  
  
  return (
    <div>
      {showCaptcha && !captchaVerified && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="p-5 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-3">Verify you are human</h2>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={handleVerify}
            />
          </div>
        </div>
      )}
        <div className="min-h-screen bg-amber-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <header className="w-full py-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
        <h1 className="text-4xl font-bold">🔥 Get the Best Deals Now! 🔥</h1>
        <p className="mt-2 text-lg">Exclusive discounts & limited-time offers</p>
      </header>

      {/* Ads Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Featured Ads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad, index) => (
            <div
            onClick={(e) => handleLinkClick(e, "/userweb")}
              key={index}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-xl transition duration-200"
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="mt-4 text-lg font-bold">{ad.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{ad.description}</p>
              <a
                href={ad.link}
                className="mt-3 inline-block text-blue-600 dark:text-blue-400 font-medium"
              >
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 bg-gray-200 dark:bg-gray-800">
        <p>© 2025 AdWorld. All rights reserved.</p>
      </footer>
    </div>
    </div>
  );
}
