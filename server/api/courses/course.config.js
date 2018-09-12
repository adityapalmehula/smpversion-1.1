const appConstants = require('./../../constants/app');

let constants = {
	category: {
		required: [true, 'Category is required']
	},
	subcategory: {
		required: [true, 'subcategory is required']
	},
	title:{
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	shortDescription:{
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[1000, 'Maximum length should be 1000'],
	},
	longDescription: {
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[2000, 'Maximum length should be 2000'],
	},
	prerequisites: {
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	price: {
		offered: {
			validate:  {
				validator: function() {
					return this.price.actual>this.price.offered;
				},
				message: '{VALUE} is greater than actual price '
			},
			required: [true, 'Offered price is required']
		},
		actual: {
			required: [true, 'Actual price is required']
		},
		discount: {
			validate:  {
				validator: function(v) {
					return 0<=v && v<=100;
				},
				message: 'Discount should be less than 100 and greater than 0'
			},
			required: [true, 'Discount is required']
		}
	},
	status: {
		enum: appConstants.CONTENT_STATUS,
	},
	currency : {
		enum : ['INR', 'USD']
	},
	activationMethod : {
		enum:['Promotion', 'Paid', 'Auto']
	},
	isPaid: {
		enum: [true,false]
	},
	duration: {
		min:[1,'Minimum length should be 1'],
		max:[365,'Maximum length should be 365'],
	},
	iconExtension : {
		enum : ['jpg', 'jpeg', 'png']
	},
	tags: {
		required: [true, 'Tags is required']
	},
}
module.exports = constants