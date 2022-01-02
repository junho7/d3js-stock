import React, { Component } from 'react';
import './view4.css';
import LineChart from './charts/LineChart';

export default function View4 (props) {
  const {data, symbol} = props;
//   const width = 1100;
//   const height = 250;
  return (
      <div id='view4' className='pane' >
          <div className='header'>Chart</div>
          <div style={{ overflowX: 'scroll',overflowY:'hidden' }}>
              <LineChart data={data} symbol={symbol} />
              {/* <LineChart data={data} width={width} height={height} /> */}
          </div>
      </div>
  )
}