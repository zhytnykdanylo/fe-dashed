import React, { useState, useEffect } from "react";
import ReactHighcharts from "react-highcharts";
import moment from "moment";
import _ from "lodash";
import { supabase } from "supabaseClient"


var categories = [
  { name: "Ethereum", slug: "ethereum", code: "ETH", rank: 1 },
  { name: "Cardano", slug: "cardano", code: "ADA", rank: 2 },
  { name: "Solana", slug: "solana", code: "SOL", rank: 3 },
  { name: "Polkadot", slug: "polkadot", code: "DOT", rank: 4 },
  { name: "Avalanche", slug: "avalanche-2", code: "AVAX", rank: 5 },
  { name: "Polygon", slug: "matic-network", code: "MATIC", rank: 6 },
  { name: "Stellar", slug: "stellar", code: "XLM", rank: 9 },
  { name: "Algorand", slug: "algorand", code: "ALGO", rank: 10 },
  { name: "Cosmos Hub", slug: "cosmos", code: "ATOM", rank: 8 },
  { name: "NEAR Protocol", slug: "near", code: "NEAR", rank: 7 },
];

export default function ButterflyChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getChartData = async () => {
      const promises = categories.map(({ slug, code }) =>
        getButterflyApiData({ ticker: slug, code })
      );

      Promise.all(promises)
        .then(values => {
          setChartData(
            values.sort(
              (a, b) =>
                a.seriesA?.market_caps - b.seriesA?.market_caps ||
                a.seriesB?.market_caps - b.seriesB?.market_caps
            )
          );
          setIsLoading(false);
        })
        .catch(error => {
          console.log(error);
        });
    };
    getChartData();
  }, []);

  const sum = quarterSumData => {
    return quarterSumData.reduce((a, b) => a + b["market_caps"], 0);
  };

  const getSeriesData = seriesName => {
    return chartData.map(data => data[seriesName].market_caps);
  };

  const sortedSeriesA = getSeriesData("seriesA").sort((a, b) => b - a);
  const sortedSeriesB = getSeriesData("seriesB").sort((a, b) => b - a);

  const getRank = code => {
    const category = categories.find(cat => cat.code === code);
    return category.rank;
  };

  if (isLoading) return "Loading...";

  return (
    <ReactHighcharts
      config={{
        chart: {
          type: "bar",
          margin: 60,
          backgroundColor: "transparent",
        },
        containerProps: {
          style: {
            width: "100%",
            height: "100%",
            fontFamily: "'sequel_sansbold_body', sans-serif",
          },
        },
        legend: {
          enabled: true,
          verticalAlign: "top",
          align: "left",
          y: -20,
          itemStyle: {
            color: "white",
            fontFamily: "'sequel_sansbold_body', sans-serif",
          },
        },
        tooltip: {
          borderColor: "none",
          backgroundColor: "#484848",
          style: {
            color: "white",
            fontFamily: "'sequel_sansbold_body', sans-serif",
          },
          formatter: function () {
            return (
              "<b>" +
              this.series.name +
              "<br/> Rank: " +
              getRank(this.x) +
              "</b><br/>" +
              "Market Cap: " +
              Intl.NumberFormat("en", { notation: "compact" }).format(
                this.point.y
              )
            );
          },
        },
        title: {
          text: "Market Cap (Billions)",
          verticalAlign: "bottom",
          align: "center",
          style: {
            color: "#919192",
            fontFamily: "'sequel_sansbold_body', sans-serif",
            fontSize: "12px",
          },
          y: 0,
        },
        subtitle: {
          text: null,
        },
        xAxis: [
          {
            categories: chartData.map(({ code }) => code),
            reversed: false,
            labels: {
              align: "center",
              step: 1,
              style: {
                color: "white",
                fontFamily: "'sequel_sansbold_body', sans-serif",
              },
            },
            lineWidth: 0,
            tickWidth: 0,
            left: "53%",
            verticalAlign: "top",
            y: 50,
          },
          ,
        ],
        yAxis: [
          {
            title: {
              text: null,
            },

            // max: null,
            gridLineColor: "transparent",
            labels: {
              align: "left",
              style: {
                color: "#919192",
                fontFamily: "'sequel_sansbold_body', sans-serif",
              },
              formatter: function () {
                return Intl.NumberFormat("en", { notation: "compact" }).format(
                  this.isLast ? 350000000000 : this.value
                );
              },
            },
            left: 10,
            width: "45%",
            reversed: true,
          },
          {
            gridLineColor: "transparent",
            labels: {
              style: {
                color: "#919192",
                fontFamily: "'sequel_sansbold_body', sans-serif",
              },
              formatter: function () {
                return Intl.NumberFormat("en", { notation: "compact" }).format(
                  this.isLast ? 350000000000 : this.value
                );
              },
            },
            offset: 0,
            title: { text: null },
            left: "58%",
            width: "45%",
          },
          {
            title: {
              text: null,
            },
            gridLineColor: null,
            labels: {
              enabled: false,
            },
            left: 0,
            width: "150%",
            lineWidth: 1,
            lineColor: "#333333",
            offset: 0,
          },
        ],

        plotOptions: {
          series: {},
          bar: {
            grouping: true,
            groupPadding: 0.01,
            pointPadding: 0.01,
            pointWidth: 24,
            borderWidth: 0,
            borderRadius: 2,
          },
        },

        series: [
          {
            name: "August 2021",
            color: "#68A9F7",
            yAxis: 0,
            data: [...sortedSeriesA].reverse(),
          },
          {
            name: moment(new Date()).format("MMMM yyyy"),
            color: "#A2FFA1",
            yAxis: 1,
            data: [...sortedSeriesB].reverse(),
          },
        ],
        credits: { enabled: false },
      }}
    />
  );
}

export const getButterflyApiData = async ({
  startDate = "1627776000",
  endDate = "1659312000",
  ticker = "bitcoin",
  code = "BTC",
}) => {

  try {
    const { data } = await supabase.functions.invoke('market_chart',{
      body: JSON.stringify({ticker, from: startDate, to: endDate }),
      headers: {
        "Content-Type": "application/json",
      },
      mode: 'no-cors'
    })
    console.log(data)
    const mappedData = [];

    for (const i in data.prices) {
      const payload = {
        price: data.prices[i][1],
        date: moment(data.prices[i][0]).format("yyyy-MM-DD"),
        market_caps: data.market_caps[i][1],
        total_volumes: data.total_volumes[i][1],
      };
      mappedData.push(payload);
    }

    return {
      ticker,
      code,
      seriesA: mappedData[0],
      seriesB: mappedData[mappedData.length - 1],
    };
  } catch (error) {
    console.log(error);
  }
};
