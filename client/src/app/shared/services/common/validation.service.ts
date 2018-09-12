import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Router } from '@angular/router';
@Injectable()

export class ValidationService { 
	constructor(private http: Http, private router: Router){}

	validationForm=function(data){
		var ifError = false;
		Object.keys(data).filter(function(d){
			console.log('validation', data[d]);
			if(Array.isArray(data[d]))
			{
				data[d].map(function(val){
					if(val===undefined || val.toString().trim() === '')
					{
						ifError = true;
					}
				});
			}
			else if(data[d]===undefined || data[d].toString().trim() === ''|| data[d] === null) {
				ifError = true;
			}   	
		});
		return ifError;
	}
}

