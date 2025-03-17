'use client'
import {  useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
const formSchema = z.object({
  ip: z.string().min(2, {
    message: "IP must be at least 2 characters.",
  }),
});
export default function Serve() {
  interface Visit {
    ip: string;
    count: number;
    requiresCaptcha: number;
  }

  const [data, setData] = useState<Visit[]>([]);

  // const [captchaToken, setCaptchaToken] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const form = useForm({
    resolver: zodResolver(formSchema),
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/clicks");
        const result = await response.json();
        console.log("📌 API Response:", result); // Debugging log
        setData(result); // ✅ Store as an array
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  // const formSchema = z.object({
  //   ip: z.string().min(2, {
  //     message: "Ip must be at least 2 characters.",
  //   }),
  // });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // const [analysis, setAnalysis] = useState("");
    setAiResponse("Fetching AI response...");
    try {
      const response = await fetch("/api/aihelp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: values.ip }),
      });
      const result = await response.json();
      console.log("📌 Response:", result); // Debugging log
      setAiResponse(result.behaviorAnalysis || "No analysis available.IP NOT FOUND IN DATABASE");
      // setData(result);
      //   setAnalysis(result.behaviorAnalysis);
    } catch (error) {
      console.error("Error updating click count:", error);
      setAiResponse("Failed to get response.");
    }
    // }
  }
  // const handleClick = async () => {
  //   if (data?.count >= 10 && !captchaToken) {
  //     alert("Please verify CAPTCHA first!");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/clicks", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ captchaToken }),
  //     });

  //     const result = await response.json();
  //     console.log("📌 Click Response:", result); // Debugging log

  //     setData(result);
  //     setCaptchaToken(""); // Reset CAPTCHA token
  //   } catch (error) {
  //     console.error("Error updating click count:", error);
  //   }
  // };

  console.log("Current Data:", data);

  return (
    <div className="min-h-screen w-screen bg-yellow-100 flex flex-col">

    <div className="w-full max-w-[1400px] mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-10 flex flex-col md:flex-row justify-between items-start gap-10">
      {/* Left Section - User Data */}
      <div className="w-full md:w-5/12 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">User Behavior</h1>
        {Array.isArray(data) && data.length > 0 ? (
  data.map((visit, index) => (
    <div key={index} className="bg-gray-50 p-4 rounded-lg shadow mt-2">
      <p className="text-lg font-semibold">IP Address: <span className="font-normal">{visit.ip}</span></p>
      <p className="text-lg font-semibold">Click Count: <span className="font-normal">{visit.count}</span></p>
      <p className="text-lg font-semibold">No. of times CAPTCHA used: <span className="font-normal">{visit.requiresCaptcha}</span></p>
    </div>
  ))
) : (
  <p className="text-gray-500 mt-4">Loading...</p>
)}

      </div>
      <div className="w-full md:w-1/2 bg-amber-600 p-6 rounded-lg shadow-md border-l-4 border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Details</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 gap-3">Ip Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the ip address"
                      {...field}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500 text-sm">
                    Get More knowledge from Our Ai agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Submit
            </Button>
          </form>
        </Form>
        {aiResponse && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800">AI Analysis:</h3>
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
