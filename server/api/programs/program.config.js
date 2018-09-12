const appConstants = require('./../../constants/app');


let constants = {
	code:{
		required: [true, 'Code is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[10, 'Maximum length should be 10'],
	},
	title:{
		required: [true, 'Title is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	},
	description:{
		required: [true, 'Description is required'],
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[1000, 'Maximum length should be 1000'],
	},
	programNeed: {
		required: [true,'Prerequisites is required'],
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[1000, 'Maximum length should be 1000'],
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
	tenure: {
		required: [true, 'Tags is required']
	},
	level: {
		required: [true, 'Tags is required']
	},
	iconExtension : {
		enum : ['jpg', 'jpeg', 'png']
	},
	tags: {
		required: [true, 'Tags is required']
	},
}
module.exports = constants

	/*public static title ={
		required: ['Task title is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	};
	public static description = {
		required: ['Task description is required'],
		minlength:[10, 'Task description minimum length should be 10'],
		maxlength:[1000, 'Task escription maximum length should be 1000'],
	};
	public static criteria={
			required: ['Done criteria is required'],
	}
	public static action={
			required: ['Action is required'],
	}
	public static concepts={
			required: ['Done criteria title is required'],
	}
	public static duration={
	        required: ['Duration is required'],
	        pattern: ['Duration must be in number'],
	}*/