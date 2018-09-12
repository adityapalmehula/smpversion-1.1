import { CommonConfig } from './../../../config/common-config.constants';

export class Config {
public static	category={
		required: ['Category is required']
	};
 public static subcategory= {
    required: ['Subcategory is required']
  };
	public static title ={
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	};
	public static shortDescription = {
		minlength:[10, 'Short Description minimum length should be 10'],
		maxlength:[1000, 'Short Description maximum length should be 1000'],
	};
	public static longDescription= {
		minlength:[10, 'Minimum length should be 10'],
		maxlength:[2000, 'Maximum length should be 2000'],
	};
	public static status= {
		enum: CommonConfig.CONTENT_STATUS,
	};
	public static currency = {
		enum : ['INR', 'USD']
	};
	public static activationMethod = {
		enum:['Promotion', 'Paid', 'Auto']
	};
	public static isPaid = {
		enum: [true,false]
	};
	public static duration = {
		min:[1,'Minimum length should be 1'],
		max:[365,'Maximum length should be 365'],
	}
	public static iconExtension = {
		enum : ['jpg', 'jpeg', 'png']
	};
	public static tags= {
		required: [true, 'Tags is required']
	};
}