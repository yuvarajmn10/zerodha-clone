const { Schema } = require("mongoose");

const OrdersSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: String,
    qty: Number,
    price: Number,
    mode: String,
  },
  { timestamps: true },
);

module.exports = { OrdersSchema };
