const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');


const OrderSchema = new Schema({
  userId: String,
  status: String,
  orderId: String,
  items: [
    {
      itemId: String,
      title: String,
      actualPrice: Number,
      offeredPrice: Number
    }
  ],
  totalPrice: Number,
  payment :{
    TXNID: String,
    BANKTXNID: String,
    TXNAMOUNT: String,
    CURRENCY: String,
    STATUS: String,
    TXNTYPE: String,
    GATEWAYNAME: String,
    RESPCODE: String,
    RESPMSG: String,
    BANKNAME: String,
    MID: String,
    PAYMENTMODE: String,
    REFUNDAMT: String,
    TXNDATE: String 
  },
  error : {
    type: Schema.Types.Mixed
  },
  createdBy: {
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date: { type: Date, default: Date.now }
   }, 
   updatedBy:{
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date: { type: Date }
   },
   deletedBy:{
     id: { type: Schema.Types.ObjectId, ref: 'users'},
     role: { type : String },
     name: { type: String },
     date:{ type: Date }
   }
});

const Orders = mongoose.model('orders', OrderSchema);

module.exports = Orders;
