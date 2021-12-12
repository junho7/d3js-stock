import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

function Stock() {
  const [stockCloses, setStockCloses] = useState([]);

  useEffect(()=>{
    getStockData();
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
    console.log(axiosUrl)
    const axiosResult = await axios(axiosUrl);
    console.log(axiosResult.data.results)
    const results = axiosResult.data.results;
    const closes = results.map(e=>e.c);
    console.log('closes: ', closes)
    setStockCloses(closes);
  };

  return (
    <div>
      <header>
        <div>
          {stockCloses}
        </div>
      </header>
    </div>
  );
}

export default Stock;
