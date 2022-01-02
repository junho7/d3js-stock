import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import "moment-timezone";
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
    keyId: 'PK5PVV29XY9DINIHIS47',
    secretKey: 'ykYRnHbkpEFPw3Hf6bLMaRWY7pbIciLYr4WVIxXz',
    paper: true
})

export const initialPriceData =
[
    { Timestamp: "2021-08-30T04:00:00Z", ClosePrice: 100, Volume: 50 },
    { Timestamp: "2021-08-31T04:00:00Z", ClosePrice: 200, Volume: 100 },
    { Timestamp: "2021-09-01T04:00:00Z", ClosePrice: 100, Volume: 500 },
  ]
export const initialOldPriceData =
[
    { Timestamp: "2021-08-30T04:00:00Z", ClosePrice: 50, Volume: 100 },
    { Timestamp: "2021-08-31T04:00:00Z", ClosePrice: 90, Volume: 50 },
    { Timestamp: "2021-09-01T04:00:00Z", ClosePrice: 75, Volume: 75 },
  ]

  function useWindowSize() {
      
      const [size, setSize] = useState([0, 0]);
      useLayoutEffect(() => {
          function updateSize() {
          const parentDiv = document.getElementsByClassName("ant-layout");
          const parentWidth = parentDiv[1]?.clientWidth;
          const parentHeight = parentDiv[0]?.clientHeight;
          const margin = { top: 20, right: 20, bottom: 40, left: 70 };
          const width = parentWidth - margin.left - margin.right - 100;
          const height = parentHeight - margin.top - margin.bottom - 55;

        setSize([width, height]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }

export default function LineChart(props) {
  const [width, height] = useWindowSize();
  const [priceData, setPriceData] = useState([]);
  const [oldPriceData, setOldPriceData] = useState([]);

  const margin = { top: 20, right: 20, bottom: 40, left: 70 };


  const { symbol } = props;
  const getDataFromAlpaca = async () => {
      let resp = alpaca.getBarsV2(
          symbol,
          {
              start: moment().subtract(120, 'days').format("yyyy-MM-DD"),
              end: moment().subtract(1, 'days').format("yyyy-MM-DD"),
              limit: 120,
              timeframe: "1Day",
              adjustment: "all",
          },
          alpaca.configuration
      );
      const bars = [];
  
      for await (let b of resp) {
          bars.push(b)        
      }
          if(bars.length && !_.isEqual(bars, priceData) ){
              const tempPriceData = [...priceData]
              if(priceData.length){
               console.log(2)
               setPriceData([...bars]);
               setOldPriceData([...tempPriceData])
            }else{

              console.log(3, priceData)
              setPriceData([...bars]);
              setOldPriceData([...bars])
          }
      }
    }

  useEffect(()=>{
        getDataFromAlpaca();
  }, [symbol]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{
      draw();
  }, [oldPriceData, width, height]); // eslint-disable-line react-hooks/exhaustive-deps


  function transition() {
    const svg = d3.select(".svg");

    priceData.forEach(function (d) {
      d.date = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(d?.Timestamp);
    });

    let x = d3
      .scaleTime()
      .domain(
        d3.extent(priceData, function (d) {
          return d.date;
        })
      )
      .range([0, width])
      .nice();

    let y = d3
      .scaleLinear()
      .domain([
        d3.min(priceData, function (d) {
          return +d.ClosePrice;
        }) - 10,
        d3.max(priceData, function (d) {
          return +d.ClosePrice;
        }) + 10,
      ])
      .range([height, 0]);
    d3.select(".yaxis").transition().duration(1000).call(d3.axisLeft(y));

    let bisect = d3.bisector(function (d) {
      return d.date;
    }).left;


    d3.selectAll(".line")
      .datum(priceData)
      .transition()
      .duration(1000)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.ClosePrice);
          })
      );

   let xBar = d3
      .scaleBand()
      .range([0, width])
      .paddingInner(0.5)
      .paddingOuter(5);
    let yBar = d3.scaleLinear().range([height, 0]);

    xBar.domain(
      priceData.map(function (d) {
        return d.date;
      })
    )
    yBar
      .domain([
        0,
        d3.max(priceData, function (d) {
          return d.Volume;
        }),
      ])
      .nice();

    d3.select(".yaxis1").transition().duration(1000).call(d3.axisRight(yBar));

    let rect = svg.selectAll(".bar").data(priceData);

    rect
      .enter()
      .append('rect')
      .merge(rect)
      .transition()
      .duration(1000)
      .style("stroke", "none")
      .style("fill", "#ccc")
      .attr("x", function (d) {
        return x(d.date) - xBar.bandwidth() / 2;
      })
      .attr("width", function (d) {
        return xBar.bandwidth();
      })
      .attr("y", function (d) {
        return yBar(d.Volume);
      })
      .attr("height", function (d) {
        return height - yBar(d.Volume);
      });

    let focus = svg
      .append("g")
      .append("circle")
      .style("fill", "#E44444")
      .attr("stroke", "none")
      .attr("class", "tooltip_circle")
      .attr("r", 4)
      .style("opacity", 0);

    let focusBox = svg
      .append("g")
      .append("rect")
      .style("fill", "#80FFBC")
      .style("stroke", "none")
      .style("opacity", 0)
      .attr("width", 250)
      .attr("height", 70)
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("ry", 4);

    let focusLine = svg
      .append("g")
      .append("line")
      .style("opacity", 0)
      .attr("class", "hover-line")
      .attr("stroke", "#E44444")
      .attr("x1", 10)
      .attr("x2", 10)
      .attr("y1", 0)
      .attr("y2", height);

    let focusText1 = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");
    let focusText2 = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");
    let focusText3 = svg
      .append("g")
      .append("text")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");

    focusText1
      .append("rect")
      .attr("class", "tooltip")
      .attr("width", 100)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("stroke", "#000");

    svg
      .append("g")
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    function mouseover() {
      focus.style("opacity", 0.5);
      focusBox.style("opacity", 0.5);
      focusLine.style("opacity", 0.5);
      focusText1.style("opacity", 0.5);
      focusText2.style("opacity", 0.5);
      focusText3.style("opacity", 0.5);
    }

    function mousemove(event) {
      let mouse_x = d3.pointer(event, this)[0];
      let xposition = -260;
      if (mouse_x < 200) {
        xposition = 20;
      }
      let x0 = x.invert(mouse_x);
      let i = bisect(priceData, x0, 0);
      let selectedData = priceData[i] ? priceData[i] : priceData[i - 1];
      focus
        .attr("cx", x(selectedData?.date))
        .attr("cy", y(selectedData?.ClosePrice));

      focusBox
        .attr("x", x(selectedData?.date) + xposition)
        .attr("y", y(selectedData?.ClosePrice) - 22);

      focusLine
        .attr("x1", x(selectedData?.date))
        .attr("x2", x(selectedData?.date));
      focusText1
        .text(
          "Datetime: " +
            moment(selectedData?.date).format("yyyy-MM-DD") +
            " " +
            moment.tz(moment.tz.guess()).zoneAbbr()
        )
        .attr("x", x(selectedData?.date) + 15 + xposition)
        .attr("y", y(selectedData?.ClosePrice));
      focusText2
        .text("ClosePrice: $" + selectedData?.ClosePrice?.toFixed(2))
        .attr("x", x(selectedData?.date) + 15 + xposition)
        .attr("y", y(selectedData?.ClosePrice) + 15);
      focusText3
        .text("Volume: " + selectedData?.Volume?.toLocaleString("en-US"))
        .attr("x", x(selectedData?.date) + 15 + xposition)
        .attr("y", y(selectedData?.ClosePrice) + 30);
    }

    function mouseout() {
      focus.style("opacity", 0);
      focusBox.style("opacity", 0);
      focusLine.style("opacity", 0);
      focusText1.style("opacity", 0);
      focusText2.style("opacity", 0);
      focusText3.style("opacity", 0);
    }

  }

  const draw = () => {
      console.log('draw: ', oldPriceData[0])
    let data = [];

    if (width && height) {
      data = oldPriceData;

      d3.select(".vis-linechart > *").remove();

      let svg = d3
        .select(".vis-linechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

      data.forEach(function (d) {
        d.date = d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(d.Timestamp);
        d.count = +d.ClosePrice;
      });

      let x = d3
        .scaleTime()
        .domain(
          d3.extent(data, function (d) {
            return d.date;
          })
        )
        .range([0, width])
        .nice();

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("ClosePrice");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right + 60)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Volume");

      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")"
        )
        .style("text-anchor", "middle")
        .text("Datetime");

      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('y', 0)
        .attr('x', -40)
        .attr('dy', '.35em')
        .attr("transform", "rotate(-90)")
        .style('text-anchor', 'start')

      var y = d3
        .scaleLinear()
        .domain([
          d3.min(data, function (d) {
            return +d.count;
          }) - 10,
          d3.max(data, function (d) {
            return +d.count;
          }) + 10,
        ])
        .range([height, 0]);
      svg.append("g").attr("class", "yaxis").call(d3.axisLeft(y));

      let rect = svg.selectAll("rect").data(data);
      let xBar = d3
        .scaleBand()
        .range([0, width])
        .paddingInner(0.5)
        .paddingOuter(5);
      let yBar = d3.scaleLinear().range([height, 0]);

      xBar.domain(
        data.map(function (d) {
          return d.date;
        })
      );
      yBar
        .domain([
          0,
          d3.max(data, function (d) {
            return d.Volume;
          }),
        ])
        .nice();

      rect
        .enter()
        .append("rect")
        .merge(rect)
        .attr("class", "bar")
        .style("stroke", "none")
        .style("fill", "#ccc")
        .attr("x", function (d) {
          return x(d.date) - xBar.bandwidth() / 2;
        })
        .attr("width", function (d) {
          return xBar.bandwidth();
        })
        .attr("y", function (d) {
          return yBar(d.Volume);
        })
        .attr("height", function (d) {
          return height - yBar(d.Volume);
        });

      svg
        .append("g")
        .attr("class", "yaxis1")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(yBar));

      svg
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.date);
            })
            .y(function (d) {
              return y(d.count);
            })
        );

      transition();
    } else {
      return 0;
    }
  };

  return <div className="vis-linechart" />;
}
