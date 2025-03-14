"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import serve from "../../pages/serve";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { handleClick } from "./cleintcomp/handleClick.js";

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

      <Link href="/serve/">
        <div onClick={(e) => handleLinkClick(e, "/serve/")} className="px-30 py-15 bg-gray-100 rounded-lg justify-center text-center h-100 w-400 border-2 border-amber-900 m-2">
          <div className="flex justify-between items-center">
            <img src="/download.jpg" alt="Image" className="w-70"></img>
            <div className="flex justify-center items-center flex-col">
              <img src="/downloads.jpg" alt="Image" className="w-40 mb-3"></img>
              <h1 className="text-4xl text-amber-900 font-bold">Brand New Cool anime T-shirt</h1>
            </div>
            <img src="/downloadw.jpg" alt="Image" className="w-50"></img>
          </div>
        </div>
      </Link>

      <Link href="/serve/">
        <div onClick={(e) => handleLinkClick(e, "/serve/")} className="px-30 py-15 bg-gray-100 rounded-lg justify-center text-center h-100 w-400 m-2 border-2 border-amber-900">
          <div className="flex justify-between items-center">
            <img src="/secondf.jpg" alt="Image" className="w-70"></img>
            <div className="flex justify-center items-center flex-col">
              <img src="/seconds.jpg" alt="Image" className="w-40 mb-3"></img>
              <h1 className="text-4xl text-amber-900 font-bold">Check New Phones on Our Website</h1>
            </div>
            <img src="/secondt.jpg" alt="Image" className="w-50"></img>
          </div>
        </div>
      </Link>
    </div>
  );
}
