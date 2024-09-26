"use client";
import React, { useState, useMemo } from "react";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomSelect from "@/ui/block/SelectInput/SelectInput";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div
          className={`flex flex-row items-center gap-8 border border-input-border dark:border-dark-input-border bg-white dark:bg-primary px-8 py-4 rounded-[5px] shadow-lg`}
        >
          <div className="min-w-[5px] w-[6px] h-[30px] min-h-full bg-blue-primary rounded-main"></div>
          <div className="flex flex-col gap-0 items-start">
            <h1 className="text-xs text-primary dark:text-input-bg">
              New Chats
            </h1>
            <div className="flex flex-row items-center gap-8">
              <p className="text-xs font-medium text-light">
                {new Date(label).toLocaleDateString("en-UK", {
                  month: "short",
                  day: "numeric",
                })}
                :
              </p>
              <p className="text-xs text-light">{payload[0].value} chats</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const rangeOptions = ["Last 7 days", "Last 30 days", "Last 90 days"];

export default function ChatAnalysisChart() {
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(2); // Default to "Last 90 days"

  const chatData = useMemo(() => {
    const chats = JSON.parse(localStorage.getItem("chatState"))?.chats || [];
    const chatCounts = {};

    chats.forEach((chat) => {
      const date = new Date(parseInt(chat.id)).toISOString().split("T")[0];
      chatCounts[date] = (chatCounts[date] || 0) + 1;
    });

    return Object.entries(chatCounts)
      .map(([date, count]) => ({
        date,
        newChats: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort from oldest to newest
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    let daysToShow = 90;

    switch (selectedRangeIndex) {
      case 0:
        daysToShow = 7;
        break;
      case 1:
        daysToShow = 30;
        break;
      default:
        daysToShow = 90;
    }

    const startDate = new Date(
      now.getTime() - daysToShow * 24 * 60 * 60 * 1000
    );
    return chatData
      .filter((item) => new Date(item.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure filtered data is also sorted
  }, [selectedRangeIndex, chatData]);

  const handleRangeChange = (index) => {
    setSelectedRangeIndex(index);
  };

  return (
    <div className="h-[500px] w-full border border-input-border bg-white dark:bg-primary dark:border-dark-input-border rounded-main flex flex-col gap-16 p-16 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-16 sm:gap-0">
        <div className="flex flex-row items-center gap-12">
          <div className="p-8 bg-blue-light border border-blue-primary rounded-main">
            <PresentationChartLineIcon className="h-24 w-24 text-blue-primary" />
          </div>
          <div className="flex flex-col gap-0">
            <h1 className="text-xl font-medium text-black dark:text-white">
              New Chats Analysis
            </h1>
            <p className="text-md font-normal text-light">
              Showing new chats opened for the{" "}
              {rangeOptions[selectedRangeIndex].toLowerCase()}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-[50%]">
          <CustomSelect
            options={rangeOptions}
            defaultValue={selectedRangeIndex}
            onChange={handleRangeChange}
            variant="component"
          />
        </div>
      </div>
      <div className="w-full h-full">
        <ResponsiveContainer>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#037ef3" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#037ef3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#2D2D2D"
              strokeOpacity={0.5}
              strokeDasharray="5 5"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-UK", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="newChats"
              stroke="#037ef3"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
