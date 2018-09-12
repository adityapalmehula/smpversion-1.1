import { CommonConfig } from './../../../../../../config/common-config.constants';
export class Config {
	public static title ={
		required: ['Story title is required'],
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	};
	public static description = {
		required: ['Story description is required'],
		minlength:[10, 'Story description minimum length should be 10'],
		maxlength:[1000, 'Story description maximum length should be 1000'],
	};
}
