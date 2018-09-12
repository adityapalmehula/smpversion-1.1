import { CommonConfig } from './../../../config/common-config.constants';

export class Config {
    public static code ={
    	required: ['Code is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[10, 'Maximum length should be 10'],
	};
	public static version ={
		required: ['Version is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[10, 'Maximum length should be 100'],
	};
	public static title ={
		required: ['Title is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	};
	public static description = {
		required: ['Description is required'],
		minlength:[10, 'Description minimum length should be 10'],
		maxlength:[1000, 'Description maximum length should be 1000'],
	};
	public static prerequisites = {
		required: ['Prerequisites is required'],
		minlength:[10, 'Prerequisites minimum length should be 10'],
		maxlength:[1000, 'Prerequisites maximum length should be 1000'],
	};
	public static level = {
		required: ['Level is required'],
		enum : ['Beginner', 'Intermediate','Proficient','Expert']
	};
	public static currency = {
		required: ['Currency is required'],
		enum : ['INR', 'USD']
	};
	public static actualPrice={
		required: ['Actual Price is required'],
		pattern: ['Please enter valid actual price'],
	}
     public static discount={
		pattern: ['Please enter valid discount'],
		max: ['Discount must not be more than 100%'],
	}
	public static status= {
		enum: CommonConfig.CONTENT_STATUS,
	};
	public static tenure = {
		required: ['Tenure is required'],
		enum : ['1', '2','3','4','6','8','12','24','48']
	};
	public static activationMethod = {
		required: ['Activation method is required'],
		enum:['Promotion', 'Paid', 'Auto']
	};
	public static isPaid = {
		required: ['Is paid is required'],
		enum: [true,false]
	};	
	public static icon={
		required: ['Project icon is required']
	}
	public static iconExtension = {
		enum : ['jpg', 'jpeg', 'png']
	};
	public static tags= {
		required: ['Tags is required']
	};
}
