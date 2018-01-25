import React from 'react';
import { List, Image, Button } from 'semantic-ui-react';

const Stock = ({name, handleDeleteStock}) => {
  return (
    <List.Item>
      <Button
        onClick={handleDeleteStock(name)}
        style={{"display": "inline"}}
        basic size='mini'
        circular
        icon='close'
      />
      {" "+name}
    </List.Item>
  );
};

export default Stock;
