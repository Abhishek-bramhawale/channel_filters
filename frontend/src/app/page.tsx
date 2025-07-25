"use client";

import React, { useState } from "react";




export default function Home() {

  let [channelUrl,setChannelUrl]=useState("");
let [days,setDays]=useState(1);
let [durationMin,setDurationMin]=useState(0);
let [durationMax,setDurationMax]=useState(0);
let [excludeShorts,setExcludeShorts]=useState(false);
  return (
    <div>
      <form
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
        <label className="flex flex-col gap-1">
          Number of days
          <input
            type="number"
            min={1}
            max={30}
            className="border rounded px-3 py-2"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>
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
        >
          Submit
        </button>
       
      </form>
    </div>
  );
}