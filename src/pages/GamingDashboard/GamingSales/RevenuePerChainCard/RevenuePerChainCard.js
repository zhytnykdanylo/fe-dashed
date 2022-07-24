import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "reactstrap";
import * as echarts from "echarts";

import ChartActionButtons from "components/Common/ChartActionButtons";

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
        formatter: "{b} {c}%",
      },
      legend: {
        top: "bottom",
        itemGap: 25,
        icon: "circle",
        formatter: name => {
          var series = options.series[0];
          var value = series.data.filter(row => row.name === name)[0].value;
          // var itemStyle = series.data.filter(row => row.name === name)[0].itemStyle;
          return [`{a|${name}}`, `{b|${value}%}`].join("\n");
        },
        textStyle: {
          color: "white",
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: 700,
          width: 20,
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
              align: "left",
              lineHeight: 16,
            },
            b: {
              color: "white",
              fontFamily: "Inter",
              fontSize: 12,
              align: "left",
              lineHeight: 16,
            },
          },
        },
      },
      series: [
        {
          name: "Revenue per chain",
          type: "pie",
          radius: "50%",
          data: [
            {
              value: 37.7,
              name: "Ethereum",
              itemStyle: {
                color: "#2ECAEC",
              },
            },
            {
              value: 16.67,
              name: "Solana",
              itemStyle: {
                color: "#58D764",
              },
            },
            {
              value: 42.33,
              name: "Polygon",
              itemStyle: {
                color: "#9548FC",
              },
            },
            {
              value: 4.14,
              name: "Avalanche",
              itemStyle: { color: "#FF3E3E" },
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
    <>
      <ChartActionButtons />
      <Card className="revenu-per-chain">
        <CardBody>
          <h4 className="title">Revenue per Chain</h4>
          <div id="revenu-per-chain"></div>
        </CardBody>
      </Card>
    </>
  );
}