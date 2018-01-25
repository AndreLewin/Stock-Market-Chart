import React from 'react';
import { List } from 'semantic-ui-react';

import Stock from './Stock.jsx';


const StockList = ({stocks, handleDeleteStock}) => {
  const stockList = stocks.map((stock, index) => {
    return (
      <div key={stock}>
        <Stock
          name={stock}
          handleDeleteStock={handleDeleteStock}
        />
      </div>
  );
  });

  return (
    <List divided relaxed>
      {stockList}
    </List>
  );
};

export default StockList;
