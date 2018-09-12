export class Config {
	public static title = {
		minlength:[2, 'Minimum length should be 2'],
		maxlength:[100, 'Maximum length should be 100'],
	};
	public static url = {
		pattern:[/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, 'Enter correct url'],
		required:'Url required'
	}
}