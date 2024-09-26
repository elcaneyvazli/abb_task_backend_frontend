import { ChartPieIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div
          className={`flex flex-row items-center gap-8 border border-input-border dark:border-dark-input-border bg-white dark:bg-primary px-8 py-4 rounded-[5px] shadow-lg`}
        >
          <div className="min-w-[5px] w-[6px] h-[30px] min-h-full bg-blue-primary rounded-main"></div>
          <div className="flex flex-col gap-0 items-start">
            <h1 className="text-xs text-primary dark:text-input-bg">
              Average Message Length
            </h1>
            <div className="flex flex-row items-center gap-8">
              <p className="label">{`${payload[0].name}`}:</p>
              <p className="intro">{`${Math.round(
                payload[0].value
              )} characters`}</p>
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
            className="w-24 h-24 mr-2 rounded-[8px]"
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

const HalfPieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    calculateData();
  }, []);

  const calculateData = () => {
    const chatState = JSON.parse(localStorage.getItem("chatState"));
    if (!chatState || !chatState.chats) {
      setData([]);
      return;
    }

    const userMessages = chatState.chats.flatMap((chat) =>
      chat.messages.filter((msg) => msg.type === "user")
    );

    const assistantMessages = chatState.chats.flatMap((chat) =>
      chat.messages.filter((msg) => msg.type === "assistant")
    );

    const avgUserLength =
      userMessages.length > 0
        ? userMessages.reduce((sum, msg) => sum + msg.text.length, 0) /
          userMessages.length
        : 0;

    const avgAssistantLength =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, msg) => sum + msg.text.length, 0) /
          assistantMessages.length
        : 0;

    setData([
      { name: "User Messages", value: avgUserLength },
      { name: "Assistant Responses", value: avgAssistantLength },
    ]);
  };

  const COLORS = ["#f59e0b", "#047857"];

  return (
    <div className="h-[500px] w-full border border-input-border bg-white dark:bg-primary dark:border-dark-input-border rounded-main flex flex-col p-16 shadow-md">
      <div className="flex flex-row items-start gap-12 mb-8">
        <div className="p-8 bg-blue-light border border-blue-primary rounded-main">
          <ChartPieIcon className="h-24 w-24 text-blue-primary" />
        </div>
        <div className="flex flex-col gap-0">
          <h1 className="text-xl font-medium text-black dark:text-white">
            Average Message Length Comparison
          </h1>
          <p className="text-md font-normal text-light">
            Compare the average length of messages sent by users and the
            assistant
          </p>
        </div>
      </div>
      {data.length > 0 ? (
        <div className="flex-grow flex flex-col">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              width="100%"
              height="100%"
            >
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={1800}
                endAngle={0}
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <CustomLegend
            payload={data.map((entry, index) => ({
              value: entry.name,
              color: COLORS[index % COLORS.length],
            }))}
          />
        </div>
      ) : (
        <p className="text-center mt-8">No data available</p>
      )}
    </div>
  );
};

export default HalfPieChart;
