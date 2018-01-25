import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const colorPalette = ["#4D9DE0", "#E15554", "#E1BC29", "#3BB273", "#7768AE" ];

class SimpleLineChart extends React.Component {
  render () {
    const lines = this.props.stocks.map((stockName, i) => {
      return <Line type="monotone" dataKey={stockName} key={stockName} stroke={colorPalette[i]} dot={false} isAnimationActive={false} />
    });

    return (
      <LineChart width={900} height={300} data={this.props.data}
                 margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        <XAxis dataKey="name"/>
        <YAxis/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Legend />
        {lines}
      </LineChart>
    );
  }
}

export default SimpleLineChart;