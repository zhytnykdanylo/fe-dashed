import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "reactstrap";
import * as echarts from "echarts";

import "./RevenuePerChainCard.scss";

export default function RevenuePerChainCard() {
  const [chart, setChart] = useState();

  const options = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        show: false,
      },
      label: {
        color: "rgba(255, 255, 255, 0.6)",
        fontFamily: "Inter",
        fontSize: 12,
        formatter: "{b} ({c}%)",
      },
      legend: {
        top: "bottom",
        itemGap: 25,
        icon: "circle",
        formatter: name => {
          var series = options.series[0];
          var value = series.data.filter(row => row.name === name)[0].value;
          // return `${name}`;
          return [`{a|${name}}`, `{b|${value}%}`].join("\n");
        },
        textStyle: {
          color: "white",
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: 700,
          // width: 20,
          rich: {
            x: {
              width: 30,
              height: 30,
              backgroundColor: "red",
            },
            a: {
              color: "white",
              fontFamily: "Inter",
              fontSize: 12,
              fontWeight: 700,
              align: "center",
              lineHeight: 16,
            },
            b: {
              color: "white",
              fontFamily: "Inter",
              fontSize: 12,
              align: "center",
              lineHeight: 16,
            },
          },
        },
      },
      series: [
        {
          center: ["50%", "40%"],
          name: "Revenue per chain",
          type: "pie",
          radius: "55%",
          itemStyle: {
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          },
          data: [
            {
              value: 37.7,
              name: "Ethereum",
              itemStyle: {
                color: "#36F097",
              },
            },
            {
              value: 16.67,
              name: "Solana",
              itemStyle: {
                color: "#3DFFDC",
              },
            },
            {
              value: 42.33,
              name: "Polygon",
              itemStyle: {
                color: "#1ED6FF",
              },
            },
            {
              value: 4.14,
              name: "Avalanche",
              itemStyle: { color: "#268AFF" },
            },
          ].sort(function (a, b) {
            return b.value - a.value;
          }),
          labelLine: {
            length: 10,
            length2: 5,
            lineStyle: {
              color: "rgba(255, 255, 255, 0.6)",
            },
          },
          startAngle: 0,
        },
      ],
    }),
    []
  );

  useEffect(() => {
    const el = document.getElementById("revenu-per-chain");
    if (chart) {
      chart.clear();
    }

    const newChart = echarts.init(el, "dark");
    newChart.setOption(options);
    setChart(newChart);
  }, [options]);

  useEffect(() => {
    const el = document.getElementById("revenu-per-chain");

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (chart) {
          chart.resize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.unobserve(el);
    };
  }, [chart]);

  return (
    <Card className="revenu-per-chain">
      <CardBody>
        <h4 className="title">Revenue per Chain</h4>
        <div id="revenu-per-chain"></div>
      </CardBody>
    </Card>
  );
}
