import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button, Dimmer, Loader } from 'semantic-ui-react';
import axios from 'axios';
import io from "socket.io-client";

import StockList from './components/StockList.jsx';
import SimpleLineChart from './components/SimpleLineChart.jsx'

const STOCK_LIMIT = 5;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      stocks: [],
      data: [],
      error: false
    };

    this.handleNewStock = this.handleNewStock.bind(this);
    this.handleDeleteStock = this.handleDeleteStock.bind(this);
  }

  componentDidMount() {
    this.socket = io();
    this.socket.on('reloadPage', msg => {
      window.location.reload();
    });

    axios.get('/stock-names')
      .catch((error) => (console.log(error)))
      .then((response) => {

        axios.get('/stock-data-cache')
          .catch((error) => (console.log(error)))
          .then((response2) => {

            this.setState({
              loading: false,
              stocks: response.data,
              data: response2.data
            });
        });
    });
  }

  handleNewStock() {
    axios.post('/stock/new', { stockName: $("#newStock").val() })
      .then((response) => {
        this.socket.emit('stockUpdated', 'msg');
      })
      .catch((error) => {
        this.setState({
          error: true
        });
      });
  }


  handleDeleteStock(stockName) {
    return () => {
      axios.delete('/stock/delete/'+stockName)
        .catch((error) => (console.log(error)))
        .then((response) => {
          this.socket.emit('stockUpdated', 'msg');
        });
    }
  }

  render() {
    return (
      <div style={{"padding": "2rem"}}>
        <Dimmer inverted active={this.state.loading}>
          <Loader size="big">Loading</Loader>
        </Dimmer>
        <div>
          <SimpleLineChart stocks={this.state.stocks} data={this.state.data} />
          <br/>
          <StockList
            stocks={this.state.stocks}
            handleDeleteStock={this.handleDeleteStock}
          />
        </div>

        { /* Don't show the field to add a stock if there are already 5 stocks */
          this.state.stocks.length < STOCK_LIMIT ? (
            <div style={{"paddingTop": "2rem"}}>
              <Input error={this.state.error} placeholder='STOCKCODE' id='newStock' />
              <Button color="blue" onClick={this.handleNewStock}>Add new stock</Button>
            </div>
          ) : (
            <h5>Only {STOCK_LIMIT} stocks can be displayed at the same time. Please delete one first if you want to add another one.</h5>
          )
        }

        <h5><a target="_blank" href="https://www.quandl.com/data/WIKI-Wiki-EOD-Stock-Prices/documentation/database-overview">Stock prices from Quandl</a></h5>
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));