"use client";
import TaskLikesDislikesChart from "@/ui/component/BarChart/BarChart";
import LineChartContainer from "@/ui/component/LineChart/LineChart";
import HalfPieChart from "@/ui/component/PieChart/PieChart";
import React from "react";

export default function dashboard() {
  return (
    <div className="grid grid-cols-12 gap-16 w-full h-full p-32">
      <div className="col-span-12 lg:col-span-8">
        <LineChartContainer />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <HalfPieChart />
      </div>
      <div className="col-span-12">
        <TaskLikesDislikesChart />
      </div>
    </div>
  );
}
