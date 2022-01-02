import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import axios from 'axios';
import moment from 'moment';
import data from './data';
import View1 from './View1';
import View2 from './View2';
import View3 from './View3';
import View4 from './View4';
import View5 from './View5';
import View6 from './View6';
import './dashboard.css';
import 'antd/dist/antd.css'
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
    keyId: 'PK5PVV29XY9DINIHIS47',
    secretKey: 'ykYRnHbkpEFPw3Hf6bLMaRWY7pbIciLYr4WVIxXz',
    paper: true
})
//Live
// keyId: 'AKL4Y1UFKIDA0TR62XJ5',
// secretKey: 'SIlWewc5d8Kl3IMB4uijPba3u06cPMTUR5wDibiZ',
// clientId:  982777b6c0b6ab8ca0dd15095d268a99
// client secret: 24fc2c1abb37cfe31540b440eb1e3be83a6bfc84



const { Sider, Content, Footer } = Layout;

const initialStockList = [
    'AAPL',
    'MSFT',
    'TSLA'
];

export default function Dashboard () {
  const [symbol, setSymbol] = useState('AAPL')
  const [minuteData, setMinuteData] = useState();
  const [selectedUser, setSelectedUser] = useState(data[0]);
  const [greaterThenAge, setGreaterThenAge] = useState(0);
  const [includedGender, setIncludedGender] = useState(['Male', 'Female','Unknown']);

  useEffect(()=>{
    getDataFromAlpaca();
  }, [symbol])

//   const getStockDataFromPolygon = async () => {
//     const polygonUrl = 'https://api.polygon.io/v2/aggs/ticker/'
//     const ticker = 'X:BTCUSD/';
//     const range = 'range/1/minute/';
//     const from = moment().add(-30, 'days').format('YYYY-MM-DD')+'/';
//     const to = moment(new Date()).format('YYYY-MM-DD')+'?';
//     const configs = 'adjusted=true&sort=asc&limit=120&';
//     const apiKey = 'apiKey=xksrOIBgAp64YKpGr8pQtrSTMtRktvAQ';
//     const axiosUrl = polygonUrl + ticker + range + from + to + configs + apiKey;
//     // console.log(axiosUrl)
//     const axiosResult = await axios(axiosUrl);
//     // console.log(axiosResult.data.results)
//     const results = axiosResult.data.results;
//     // console.log(results.length)
//     console.log('results: ', results[0])
//     const closes = results.map(e=>e.c);
//     console.log('closes: ', closes)
//     setMinuteData(closes);
//     // setStockCloses(closes);
//   };

  const getDataFromAlpaca = async () => {
    // const alpacaAccount = await alpaca.getAccount()
    //     console.log('Current Account:', alpacaAccount)
        // start: moment().subtract(3, 'hours').format("yyyy-MM-DD"),
    let resp = alpaca.getBarsV2(
        symbol,
        // "BTCUSD",
        {
            // start: moment().subtract(3, 'hours').format(),
            // end: moment().subtract(20, 'minutes').format(),
            // start: moment().subtract(3, 'days').format("yyyy-MM-DD"),
            // end: moment().format("yyyy-MM-DD"),
            // start: "2021-12-01",
            start: moment().subtract(120, 'days').format("yyyy-MM-DD"),
            // end: "2021-12-10",
            end: moment().subtract(1, 'days').format("yyyy-MM-DD"),
            limit: 120,
            timeframe: "1Day",
            // timeframe: "1Minute",
            adjustment: "all",
        },
        alpaca.configuration
    );
    const bars = [];

    // console.log('resp: ', resp)
    
    for await (let b of resp) {
        bars.push(b)        
    }
    setMinuteData(bars);
    // console.log('minuteData: ', minuteData? minuteData[0]:null)
  };



  const filteredData = data.filter(user=>includedGender.indexOf(user.gender)!==-1)
                                 .filter(user=>user.age>greaterThenAge);

  const changeSelectUser = value => {
    setSelectedUser(value);
  }

  const changeSelectSymbol = value => {
    setSymbol(value);
  }

  const changeGreaterThenAge = value => {
    setGreaterThenAge(value);
  }

  const changeIncludedGender = value => {
    setIncludedGender(value);
  }

  return (
    <div>
        <Layout style={{height:"90vh"}}>
            <Sider height={"90vh"} width={"20vw"} style={{backgroundColor:'#eee'}}>
                <View6 data={initialStockList} changeSelectSymbol={changeSelectSymbol}/>
            </Sider>
            <Layout id='chart-area'>
                <Content >
                    <View4 data={minuteData} symbol={symbol}/>
                </Content>
            </Layout>
        </Layout>
            <Footer >
                <div style={{marginTop: -10, textAlign: 'left'}}>
                    <a href='https://github.com/junho7/d3js-stock'>Source Code </a>
                    by <a href='https://www.linkedin.com/in/jpark7/'>Junho Park</a>
                </div>
            </Footer>
    </div>
  )

}