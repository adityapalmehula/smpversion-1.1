let constants = {
	name: {
		required: [true, 'Name is required']
	},
	email: {
		validate:  {
			validator: function(v) {
				return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(v);
			},
			message: '{VALUE} is not a valid Email!'
		}
	},
	mobile: {
		validate:  {
			validator: function(v) {
				return /(7|8|9)\d{9}$/.test(v);
			},
			message: '{VALUE} is not a valid Mobile number!'
		}
	},
	gender:{
		enum:['Male','Female']
	},
	extension:{
		enum : ['jpg', 'jpeg', 'png']
	},
}

module.exports = constants;