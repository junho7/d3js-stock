import React, { Component } from 'react';
import './view2.css';
import PieChart from './charts/PieChart';

export default function View2 (props) {
  const {data} = props;
  const width = 260;
  const height = 260;
  return (
      <div id='view2' className='pane'>
          <div className='header'>Gender</div>
          <PieChart data={data} width={width} height={height} />
      </div>
  )
}