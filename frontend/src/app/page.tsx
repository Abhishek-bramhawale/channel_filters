"use client";

import React, { useState } from "react";

interface Video {
  thumbnail: string;
  title: string;
  views: number;
  duration: string;
  url: string;
  uploadDate: string;
  uploadDateFormatted: string;
}

export default function Home() {

  let [channelUrl,setChannelUrl]=useState("");
let [dateFrom,setDateFrom]=useState("");
let [dateTo,setDateTo]=useState("");
let [durationMin,setDurationMin]=useState(0);
let [durationMax,setDurationMax]=useState(0);
let [excludeShorts,setExcludeShorts]=useState(false);


  const [loading, setLoading] =useState(false);
  const [error, setError]= useState("");
  const [videos, setVideos]= useState<Video[]>([]);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideos([]);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/youtube/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelUrl,
          dateRange: {
            start: dateFrom || null,
            end: dateTo || null
          },
          minDuration: durationMin,
          maxDuration: durationMax,
          excludeShorts,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-2 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">YouTube Channel Video Analyzer</h1>
      <form onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl flex flex-col gap-4 mb-8"
      >
        <label className="flex flex-col gap-1">
          Channel URL
          <input
            type="url"
            required
            className="border rounded px-3 py-2"
            placeholder="https://www.youtube.com/@SETIndia"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
          />
        </label>
        <div className="flex gap-4">
          <label className="flex flex-col gap-1 flex-1">
            From Date
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            To Date
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
        </div>
        <div className="text-sm text-gray-600">
          Leave both dates empty to get all videos of channel or set a date range to filter videos
        </div>
        <div className="flex gap-4">
          <label className="flex flex-col gap-1 flex-1">
            Duration min (minutes)
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            Duration max (minutes)
            <input
              type="number"
              min={durationMin}
              className="border rounded px-3 py-2"
              value={durationMax}
              onChange={(e) => setDurationMax(Number(e.target.value))}
            />
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeShorts}
            onChange={(e) => setExcludeShorts(e.target.checked)}
          />
          Exclude Shorts
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Loading..." : "Analyze"}
        </button>
        {error && <div className="text-red-600 font-medium">{error}</div>}
      </form>


      <div className="w-full max-w-5xl">
        {videos.length > 0 && (
          <table className="w-full border-collapse bg-white shadow rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Thumbnail</th>
                <th className="p-2">Title</th>
                <th className="p-2">Views</th>
                <th className="p-2">Duration</th>
                <th className="p-2">Upload Date</th>
                <th className="p-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <img src={v.thumbnail} alt={v.title} className="w-24 h-14 object-cover rounded" />
                  </td>
                  <td className="p-2 max-w-xs truncate" title={v.title}>{v.title}</td>
                  <td className="p-2 text-right">{v.views?.toLocaleString()}</td>
                  <td className="p-2 text-center">{v.duration}</td>
                  <td className="p-2 text-center">{v.uploadDateFormatted}</td>
                  <td className="p-2 text-center">
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Watch
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {videos.length === 0 && !loading && (
          <div className="text-black text-center">No videos to display.</div>
        )}
      </div>

    </div>
  );
}