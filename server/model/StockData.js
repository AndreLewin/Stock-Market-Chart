const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    expire_at: {type: Date, default: Date.now, expires: 86400},
    content: { type: Array, required: true }
  }
);

const StockData = mongoose.model('StockData', schema, 'stockDatas');

module.exports = StockData;