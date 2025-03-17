"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";


export default function Home() {
  const [clickCount, setClickCount] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

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
        body: JSON.stringify({
          action: "increment",
          captchaToken: captchaVerified ? "valid" : null,
        }),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        console.error(
          "Failed to update click count:",
          result,
          "Status Code:",
          response.status
        );
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
        if (result.clickCount >= result.maxlimit) {
          setShowAlert(true);
        } else {
          router.push(url);
        }
      }
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  };
  console.log(showAlert);

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
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogTrigger className="hidden" />{" "}
        {/* Hidden trigger, but required */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Click Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have reached the maximum number of allowed clicks. Further
              clicks are restricted. Contact the administrator for more
              information at xyz@gmail.com.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white py-4 text-center text-2xl font-bold shadow-lg">
          Wikipedia: The Free Encyclopedia
        </nav>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-10 text-center">
          <h1 className="text-4xl font-bold">Welcome to Wikipedia</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            The free encyclopedia that anyone can edit.
          </p>
          <form className="mt-6 flex">
            <input
              type="text"
              placeholder="Search Wikipedia..."
              className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded-r-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>
        <div className="flex  justify-between items-center">
          {/* Featured Article */}
          <section className="max-w-5xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow ">
            <h2 className="text-2xl font-bold">Featured Article</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Project Goal:</strong>
              The primary objective of this project is to track user visits
              based on IP addresses and detect bot activity to prevent
              fraudulent traffic in an ad-based revenue model. This ensures that
              only genuine user interactions contribute to revenue generation,
              reducing false impressions and click fraud.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Key Features & Implementation:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>IP Address Tracking & Visit Counting:</strong> Stores
                each visitor's IP address in MongoDB to track visit counts. Uses
                Next.js API routes to fetch and update visit logs efficiently.
                Implements rate limiting to prevent excessive visits from a
                single IP.
              </li>
              <li>
                <strong>Bot Detection & CAPTCHA Validation:</strong> If a user's
                visit count exceeds a threshold (e.g., 10 visits), they are
                required to complete a Google reCAPTCHA before proceeding.
                Invisible CAPTCHA triggers when suspicious behavior is detected
                (e.g., multiple rapid clicks). Prevents automated bots from
                generating false ad impressions.
              </li>
              <li>
                <strong>Click Fraud Prevention:</strong> Limits the number of
                clicks per IP within a defined time window. Implements
                behavioral analysis using ChatGPT API to analyze unusual
                activity patterns. Blocks access if fraudulent activity is
                detected.
              </li>
              <li>
                <strong>Ad Protection & Revenue Security:</strong> Ensures only
                real users contribute to ad-based revenue. Reduces ad fraud
                losses by detecting fake clicks and bot-generated traffic.
                Provides an alert system for monitoring suspicious activities.
              </li>
            </ul>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Tech Stack Used:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300">
              <li>Next.js – Frontend & API routes</li>
              <li>MongoDB – Storing IP addresses & visit logs</li>
              <li>Google reCAPTCHA – Bot detection & verification</li>
              <li>Tailwind CSS – UI design</li>
              <li>TypeScript – Code reliability & scalability</li>
            </ul>
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 mt-2 inline-block"
            >
              Read more →
            </a>
          </section>
          <div
            onClick={(e) => handleLinkClick(e, "/userweb")}
            className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-xl transition duration-200 mx-4"
          >
            <Image
              src="/download.jpg"
              alt="50% Off on T-shirts!"
              width={500}  // Required
  height={224} // Required
              className="w-full h-56 object-cover rounded-md"
            />
            <h3 className="mt-4 text-lg font-bold">Buy Cool Anime T-shirt</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
            "Don't start a fight if you can't end it" 
            </p>
            <a className="mt-3 inline-block text-blue-600 dark:text-blue-400 font-medium">
              Learn More →
            </a>
          </div>
          </div>

          {/* Categories */}
          <section className="max-w-4xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {["Science", "History", "Technology", "Geography"].map(
              (category) => (
                <a
                  key={category}
                  href="#"
                  className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {category}
                </a>
              )
            )}
          </section>

          {/* Random Article Button */}
          <div className="text-center mt-10">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Random Article
            </button>
          </div>

          {/* Footer */}
          <footer className="text-center py-6 bg-gray-200 dark:bg-gray-800 mt-12">
            <p>Wikipedia | Built with Next.js & Tailwind CSS</p>
          </footer>
         
        </div>
      </div>
  
  );
}
