const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appConstant = require('./../../constants/app');


const CartsSchema = new Schema({
  userId: String,
  status: String,
  items: [
    {
      itemId: String,
      title: String,
      actualPrice: Number,
      offeredPrice: Number
    }
  ],
  totalPrice: Number,
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
     date:{ type: Date}
   }
});

const Carts = mongoose.model('carts', CartsSchema);

module.exports = Carts;
