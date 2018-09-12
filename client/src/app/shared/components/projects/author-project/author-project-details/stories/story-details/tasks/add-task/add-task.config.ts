import { CommonConfig } from './../../../../../../../../config/common-config.constants';

export class Config {
	public static title ={
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
	public static actions={
			required: ['Action is required'],
	}
	public static duration={
	        required: ['Duration is required'],
	        pattern: ['Duration must be in number'],
	}
	public static actionsConfig=[{"id":1,"itemName":"Done"},{"id":2,"itemName":"Review"}];
}
