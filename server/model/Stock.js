const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  }
);

const Stock = mongoose.model('Stock', schema, 'stocks');

module.exports = Stock;