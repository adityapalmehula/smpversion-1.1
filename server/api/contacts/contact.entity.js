const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  name: String,
  email:String,
  phone: String,
  message:String,
 	createdOn: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model('contact', ContactSchema);

module.exports = Contact;