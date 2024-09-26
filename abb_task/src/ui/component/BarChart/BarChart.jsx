import React, { useState, useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { motion } from "framer-motion";
import { ChartBarIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";
import CustomSelect from "@/ui/block/SelectInput/SelectInput";

const processData = (messageLikes) => {
  const data = {};
  Object.entries(messageLikes).forEach(([timestamp, likes]) => {
    const date = timestamp.split("T")[0];
    if (!data[date]) {
      data[date] = { date, tasks: 0, likes: 0, dislikes: 0 };
    }
    data[date].tasks += 1;
    if (likes.liked) data[date].likes += 1;
    if (likes.disliked) data[date].dislikes += 1;
  });
  return Object.values(data).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="flex flex-row items-center gap-8 border border-input-border dark:border-dark-input-border bg-white dark:bg-primary px-8 py-4 rounded-[5px] shadow-lg">
          <div className="min-w-[5px] w-[6px] h-[30px] min-h-full bg-blue-primary rounded-md"></div>
          <div className="flex flex-col gap-0 items-start">
            <h1 className="text-xs text-primary dark:text-input-bg">
              Feedback
            </h1>
            <div className="flex flex-row items-center gap-8">
              <p className="text-xs font-medium text-light">
                {new Date(label).toLocaleDateString("en-UK", {
                  month: "short",
                  day: "numeric",
                })}
                :
              </p>
              <p className="text-xs text-primary dark:text-input-bg">
                Likes: {payload[0].value}, Dislikes: {payload[1].value}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-col sm:flex-row w-full gap-16 justify-center mt-12">
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex flex-row gap-12 items-center"
        >
          <div
            className="w-16 h-16 rounded-[5px]"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-md text-primary dark:text-input-bg">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const rangeOptions = ["Last 7 days", "Last 30 days", "Last 90 days"];

export default function LikesDislikesChart() {
  const [chartData, setChartData] = useState([]);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(2);

  useEffect(() => {
    const messageLikes = JSON.parse(
      localStorage.getItem("messageLikes") || "{}"
    );
    const processedData = processData(messageLikes);
    setChartData(processedData);
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
    return chartData
      .filter((item) => new Date(item.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [selectedRangeIndex, chartData]);

  const totalTasks = filteredData.reduce((sum, day) => sum + day.tasks, 0);
  const totalLikes = filteredData.reduce((sum, day) => sum + day.likes, 0);
  const totalDislikes = filteredData.reduce(
    (sum, day) => sum + day.dislikes,
    0
  );

  const likePercentage = totalTasks
    ? ((totalLikes / totalTasks) * 100).toFixed(1)
    : 0;

  const handleRangeChange = (index) => {
    setSelectedRangeIndex(index);
  };

  const COLORS = ["#1d4ed8", "#be123c"];

  return (
    <motion.div
      className="h-[600px] w-full border border-input-border dark:border-dark-input-border bg-white dark:bg-primary rounded-lg flex flex-col gap-16 p-16 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex flex-row items-center gap-12">
          <div className="p-8 bg-blue-light border border-blue-primary rounded-main">
            <ChartBarIcon className="h-24 w-24 text-blue-primary" />
          </div>
          <div className="flex flex-col gap-0">
            <h1 className="text-xl font-medium text-black dark:text-white">
              Likes/Dislikes Analysis
            </h1>
            <p className="text-md font-normal text-light">
              Showing feedback for the{" "}
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
          <ComposedChart
            data={filteredData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            width="100%"
            height="100%"
          >
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
            <YAxis hide={true} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="likes"
              fill={COLORS[0]}
              name="Likes"
              width={20}
              maxBarSize={80}
              activeBar={false}
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="dislikes"
              fill={COLORS[1]}
              name="Dislikes"
              maxBarSize={80}
              activeBar={false}
              radius={[10, 10, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend
        payload={[
          { value: "Likes", color: COLORS[0] },
          { value: "Dislikes", color: COLORS[1] },
        ]}
      />

      <motion.div
        className="mt-4 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 font-medium mb-2">
          <p className="text-lg text-primary dark:text-input-bg">
            {likePercentage}% positive feedback
          </p>
        </div>
        <p className="text-sm text-primary dark:text-input-bg">
          Total tasks: {totalTasks}, Likes: {totalLikes}, Dislikes:{" "}
          {totalDislikes}
        </p>
      </motion.div>
    </motion.div>
  );
}
