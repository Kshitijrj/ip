import { use, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

 
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})
// export function ProfileForm() {
  // 1. Define your form.
  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     username: "",
  //   },
  // })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
// }

export default function Serve() {
  const [data, setData] = useState(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const form=useForm()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/clicks");
        const result = await response.json();

        console.log("📌 API Response:", result); // Debugging log

        setData(result); // ✅ Store as an object
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleClick = async () => {
    if (data?.count >= 10 && !captchaToken) {
      alert("Please verify CAPTCHA first!");
      return;
    }

    try {
      const response = await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken }),
      });

      const result = await response.json();
      console.log("📌 Click Response:", result); // Debugging log

      setData(result);
      setCaptchaToken(""); // Reset CAPTCHA token
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  };

  console.log("Current Data:", data);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg mt-10 flex flex-col md:flex-row justify-between items-start gap-10">
  
    {/* Left Section - User Data */}
    <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800">User Behavior</h1>
      {data && data.ip ? (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-lg font-semibold">IP Address: <span className="font-normal">{data.ip}</span></p>
          <p className="text-lg font-semibold">Click Count: <span className="font-normal">{data.count}</span></p>
          <p className="text-lg font-semibold">No. of times CAPTCHA used: <span className="font-normal">{data.requiresCaptcha}</span></p>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">Loading...</p>
      )}
    </div>
  
    {/* Right Section - Form */}
    <div className="w-full md:w-1/2 bg-amber-600 p-6 rounded-lg shadow-md border-l-4 border-gray-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Details</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm">
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200">Submit</Button>
        </form>
      </Form>
    </div>
  
  </div>
  
  
  );
}
