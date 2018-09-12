const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  country: String,
    states: [{
	    state:  { 
	    	type : String,
	    },
	    cities:[{
		    city: {
		      type : String 
	    	}
		  }]
	    
	  }],
});


const Country = mongoose.model('country', CountrySchema);

module.exports = Country;
