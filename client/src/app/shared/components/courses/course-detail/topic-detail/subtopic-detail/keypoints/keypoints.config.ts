export class Config {
	public static title = {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	};
	public static description = {
		minlength:[10, 'Minimum description length should be 10 character'],
		maxlength:[1000, ' Maximum description length should be 1000 character'],
	}
}