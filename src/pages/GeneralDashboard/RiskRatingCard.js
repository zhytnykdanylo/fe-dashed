import React, { useEffect, useState, createRef } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import * as d3 from "d3";

const data = [
  {
    label: "Funding (APR)",
    diff: "Medium",
    color: "#FCF99C",
  },
  {
    label: "Leverage",
    diff: "Rising",
    color: "#EF923B",
  },
  {
    label: "Sell Pressure",
    diff: "Medium",
    color: "#EF923B",
  },
];

const transitions = [61, 60, 61, 60, 59, 61, 62, 61, 62, 61, 60];
const throttle_duration = 2000;

export default function RiskRatingCard() {
  const chartRef = createRef(null);
  const [width, setwidth] = useState(200);
  const [height, setheight] = useState(250);
  const sm = width < 250;
  const [value, setvalue] = useState(0);

  const circle_size = 0.75;
  const start_engle = -Math.PI * circle_size;
  const end_engle = Math.PI * circle_size;
  const i = d3.interpolateNumber(start_engle, end_engle);

  useEffect(() => {
    const card = document.querySelector(".card.risk-rating");
    const resizeObserver = new ResizeObserver(event => {
      const { width, height } = event[0].target.getBoundingClientRect();
      setwidth(width - 48); // padding
      setheight(height - 48 - 48); // padding + title
    });

    resizeObserver.observe(card);
  });

  useEffect(() => {
    d3.select(chartRef.current).select("svg").remove();
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("viewBox", [0, 0, 300, 400])
      .attr("width", Math.min(width, 300))
      .attr("height", height);

    const outerRadius = 150; // width / 2.5;
    const innerRadius = outerRadius - (sm ? 20 : 25);
    const offsetX = width / 2 - outerRadius;

    // Text
    svg
      .append("text")
      .style("font-size", sm ? "18px" : "33px")
      // .style("font-weight", "bold")
      .style("font-family", "sequel_100_wide45, sans-serif")
      .style("fill", "white")
      .attr("text-anchor", "middle")
      .attr("x", 150)
      .attr("y", outerRadius)
      .text("Medium");

    const meterText = svg
      .append("text")
      .style("font-size", sm ? "20px" : "25px")
      .style("font-family", "sequel_100_wide45, sans-serif")
      .style("fill", "white")
      .attr("text-anchor", "middle")
      .attr("x", 150)
      .attr("y", 2 * outerRadius - 30);

    svg
      .selectAll("p")
      .data(data)
      .enter()
      .append("text")
      .style("font-size", "12px")
      .style("font-family", "sequel_sansbold_body")
      .style("fill", "#ACACAC")
      .attr("x", 0)
      .attr("y", (d, i) => 2 * innerRadius + 80 + 28 * i)
      .text(d => d.label);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .style("fill", "#A6ACC4")
      .attr("width", 60)
      .attr("height", 21)
      .style("fill", d => d.color)
      .attr("x", 300 - 60)
      .attr("y", (d, i) => 2 * innerRadius + 65 + 28 * i)
      .attr("rx", 5);

    svg
      .selectAll("p")
      .data(data)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-family", "sequel_sansbold_body")
      .style("fill", "#15171F")
      .attr("x", 300 - 30)
      .attr("y", (d, i) => 2 * innerRadius + 80 + 28 * i)
      .text(d => d.diff);

    // Gradient

    const grad = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "grad")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    const colors = ["#FF596A", "#FF8C61", "#FFA15D", "#AFFEA2"];

    grad
      .selectAll("stop")
      .data(colors)
      .enter()
      .append("stop")
      .style("stop-color", function (d) {
        return d;
      })
      .attr("offset", function (d, i) {
        return 100 * (i / (colors.length - 1)) + "%";
      });

    // Circle

    const arcGenerator = d3
      .arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .cornerRadius(20)
      .startAngle(i(0))
      .endAngle(i(1));

    svg
      .append("path")
      .attr("transform", `translate(${outerRadius},${outerRadius})`)
      .attr("d", arcGenerator())
      .style("fill", "#2B2F39");

    const arcProgress = d3
      .arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .cornerRadius(20)
      .startAngle(i(0))
      .endAngle(i(value / 100));

    const arc = d3
      .arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .cornerRadius(20)
      .startAngle(i(0));

    const progressCircle = svg
      .append("path")
      .attr("transform", `translate(${outerRadius},${outerRadius})`)
      .attr("rx", 4)
      .style("fill", "url(#grad)")
      .attr("d", arcProgress());

    let values = [];

    for (let index = 0; index < transitions.length - 1; index++) {
      values.push({
        from: transitions[index],
        to: transitions[index + 1],
      });
    }

    progressCircle
      .transition()
      .delay(0)
      .duration(throttle_duration)
      .attrTween("d", function (d) {
        return function (t) {
          const i2 = d3.interpolateNumber(i(0 / 100), i(transitions[0] / 100));
          const iv = d3.interpolateNumber(0, transitions[0]);
          const progress = arc.endAngle(i2(t));
          meterText.text(`${Math.round(iv(t))}%`);
          return progress();
        };
      })
      .on("end", repeat);

    function repeat() {
      values.map(({ from, to }, index) => {
        const tr = progressCircle
          .transition()
          .delay((index + 1) * throttle_duration)
          .duration(throttle_duration)
          .attrTween("d", function (d) {
            return function (t) {
              const i2 = d3.interpolateNumber(i(from / 100), i(to / 100));
              const iv = d3.interpolateNumber(from, to);
              const progress = arc.endAngle(i2(t));
              meterText.text(`${Math.round(iv(t))}%`);
              return progress();
            };
          });
        if (index == values.length - 1) {
          tr.on("end", repeat);
        }
      });
    }

    repeat();
  }, [width, height]);

  return (
    <Card className="risk-rating">
      <CardBody>
        <CardTitle className="mb-4">Risk Rating</CardTitle>
        <div className="d-flex align-items-center justify-content-center">
          <div ref={chartRef}></div>
        </div>
      </CardBody>
    </Card>
  );
}
