import { useEffect, useState, createRef, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
// import * as d3 from 'd3';
import { select } from 'd3';
// import { svg } from 'd3';

function Stock() {
  // const [stockCloses, setStockCloses] = useState([]);
  const [data, setData] = useState([24, 30, 45, 70, 26]);
  // const ref = createRef();
  const svgRef = useRef();
  const svg = select(svgRef.current);

  useEffect(()=>{
    getStockData();
  }, [])

  useEffect(()=>{
    draw();
  }, [])

  const getStockData = async () => {
    const polygonUrl = 'https://api.polygon.io/v2/aggs/ticker/'
    const ticker = 'X:BTCUSD/';
    const range = 'range/1/day/';
    const from = moment().add(-30, 'days').format('YYYY-MM-DD')+'/';
    const to = moment(new Date()).format('YYYY-MM-DD')+'?';
    const configs = 'adjusted=true&sort=asc&limit=120&';
    const apiKey = 'apiKey=xksrOIBgAp64YKpGr8pQtrSTMtRktvAQ';
    const axiosUrl = polygonUrl + ticker + range + from + to + configs + apiKey;
    // console.log(axiosUrl)
    const axiosResult = await axios(axiosUrl);
    // console.log(axiosResult.data.results)
    const results = axiosResult.data.results;
    // console.log(results.length)
    const closes = results.map(e=>e.c);
    console.log('closes: ', closes)
    // setStockCloses(closes);
  };

  const dimensions = { width: 500, height: 400, left: 10, right: 10}

  const draw = () => {
    svg
      .selectAll("circle")
      .data(data)
      .join(
        (enter) => enter.append("circle"),
        (update) => update.attr('class', 'updated'),
        (exit) => exit.remove()
      )
      .attr("r", (value) => value)
      .attr("cx", (value) => value * 2)
      .attr("cy", (value) => value * 2)
      .attr("stroke", "red");
  }

  return (
    <>
      {/* <header> */}
        {/* <div ref={ref} /> */}
          {/* {stockCloses} */}
      {/* </header> */}
      <svg ref={svgRef}></svg>
    </>
  );
}

export default Stock;
