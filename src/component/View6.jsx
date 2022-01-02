import React, { useState } from "react";
import { Menu } from "antd";
import "./view6.css";

export default function View6(props) {
  const { data } = props;
  const [selectedSymbol, setSelectedSymbol] = useState([data[0]]);

  const selectSymbol = (symbol) => {
    props.changeSelectSymbol(symbol);
  };

  const handleClick = (e) => {
    const symbol = e.key;
    setSelectedSymbol([symbol]);
    selectSymbol(symbol);
  };

  return (
    <div id="view6" className="pane">
      <div className="header">Stock List</div>
      <Menu onClick={handleClick} selectedKeys={selectedSymbol}>
        {data.map((symbol) => {
          return <Menu.Item key={symbol}>{symbol}</Menu.Item>;
        })}
      </Menu>
    </div>
  );
}
