'use client'
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  ip: z.string().min(2, {
    message: 'IP must be at least 2 characters.',
  }),
});

export default function Serve() {
  interface Visit {
    ip: string;
    count: number;
    requiresCaptcha: number;
    createdAt: string;
  }

  const [data, setData] = useState<Visit[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [fixedLimit, setFixedLimit] = useState('');
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    fetchData();
    fetchCurrentLimit();
  }, []);

  const fetchData = async (date?: string) => {
    try {
      const response = await fetch(`/api/clicks?date=${date || ''}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDateFilter = () => {
    fetchData(filterDate);
  };

  const updateLimit = async () => {
    try {
      const response = await fetch('/api/fixedlimit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newLimit: Number(fixedLimit) }),
      });
      const result = await response.json();
      alert(`Limit updated to ${result.fixedcount}`);
      setCurrentLimit(result.fixedcount);
    } catch (err) {
      console.error(err);
      alert('Failed to update limit');
    }
  };

  const fetchCurrentLimit = async () => {
    const res = await fetch('/api/fixedlimit');
    const data = await res.json();
    setCurrentLimit(data.fixedcount);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setAiResponse('Fetching AI response...');
    try {
      const response = await fetch('/api/aihelp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: values.ip }),
      });
      const result = await response.json();
      setAiResponse(result.behaviorAnalysis || 'No analysis available. IP not found in database');
    } catch (error) {
      console.error('Error updating click count:', error);
      setAiResponse('Failed to get response.');
    }
  }

  return (
    <div className="min-h-screen w-screen bg-yellow-100 flex flex-col">
      {/* Date Filter Section */}
      <div className="p-4 mb-4 flex items-center gap-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border p-2 rounded-lg"
        />
        <Button onClick={handleDateFilter} className="bg-blue-600 text-white py-2 px-4 rounded-md">
          Filter by Date
        </Button>
      </div>

      {/* Click Limit Section */}
      <div className="flex items-center gap-4 mt-4 px-4">
        <input
          type="number"
          value={fixedLimit}
          onChange={(e) => setFixedLimit(e.target.value)}
          placeholder="Set new click limit"
          className="border p-2 rounded-lg"
        />
        <Button onClick={updateLimit} className="bg-green-600 text-white py-2 px-4 rounded-md">
          Update Limit
        </Button>
        {currentLimit !== null && (
          <span className="ml-2 text-gray-700">Current Limit: {currentLimit}</span>
        )}
      </div>

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
                <p className="text-lg font-semibold">Created At: <span className="font-normal">{visit.createdAt}</span></p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-4">No data available or loading...</p>
          )}
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 bg-amber-200 p-6 rounded-lg shadow-md border-l-4 border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Details</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 gap-3">IP Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the IP address"
                        {...field}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
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
