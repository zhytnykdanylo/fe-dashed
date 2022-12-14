import React, { useEffect, useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import { supabase } from "supabaseClient";

const PriceLineChart = ({ chartData, color1, color2 }) => {
  const style = {
    height: "100%",
    width: "100%",
  };

  const option = useMemo(() => {
    if (chartData?.length)
      return {
        backgroundColor: "transparent",
        toolbox: {
          show: false,
        },
        grid: {
          left: 44,
          right: 44,
          top: 44,
          bottom: 44
        },
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(61, 72, 90, 0.95)",
          padding: 8,
          borderRadius: 8,
          show: false
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            axisTick: {
              show: false,
            },
            axisLabel: {
              fontWeight: "700",
              fontSize: 14,
              lineHeight: 17,
              color: "#5B6178",
            },
            data: chartData?.map(x => x.date),
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLine: {
              show: false,
            },
            axisLabel: {
              fontWeight: "700",
              fontSize: 12,
              lineHeight: 24,
              color: "rgba(255, 255, 255, 0.6)",
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: "rgba(255, 255, 255, 0.2)",
                type: [2, 2],
              },
            },
            splitNumber: 5,
          },
          {
            type: "value",
            axisLine: {
              show: false,
            },
            axisLabel: {
              fontWeight: "700",
              fontSize: 12,
              lineHeight: 24,
              color: "rgba(255, 255, 255, 0.6)",
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            splitNumber: 5,
          },
        ],
        series: [
          {
            name: "Price",
            type: "line",
            showSymbol: false,
            xAxisIndex: 0,
            yAxisIndex: 1,
            data: chartData?.map(x => x.price),
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: color1,
                },
                {
                  offset: 1,
                  color: color2,
                },
              ],
              global: false,
            },
          },
        ],
      };
  }, [chartData]);
  if (!chartData?.length) return <p>Loading data...</p>;

  return <ReactEcharts option={option} style={style} className="bar-chart" />;
};

export default PriceLineChart;

export const getCoinMarketPriceApi = async ({
  startDate = "2017-01-01",
  endDate = "2022-12-31",
  ticker = "solana",
}) => {
  const from = moment(startDate).unix()
  const to = moment(endDate).unix()
  try {
    const { data } = await supabase.functions.invoke('market_chart',{
      body: JSON.stringify({ticker, from, endDate }),
      headers: {
        "Content-Type": "application/json",
      }
    })
    const mappedData = [];

    for (const i in data.prices) {
      const payload = {
        price: data.prices[i][1],
        date: moment(data.prices[i][0]).format("DD/MM/yyyy"),
        market_caps: data.market_caps[i][1],
        total_volumes: data.total_volumes[i][1],
      };
      mappedData.push(payload);
    }

    return mappedData;
  } catch (error) {
    console.log(error);
  }
};

export const searchCoins = async (query) => {
  try {
    const { data } = await supabase.functions.invoke('search',{
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      }
    })
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getCoins = async () => {
  try {
    const { data } = await supabase.functions.invoke('coins',{
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
      }
    })
    return data;
  } catch (error) {
    console.log(error);
  }
};