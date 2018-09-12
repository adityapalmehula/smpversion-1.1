import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return this.formatNum(value, 1); // Second arg is the number of digits to show after decimal
  }

  // Format number to show in k = thousand, M = million, G = billion, T = trillion, P = quadrillion, E = quintillion
	formatNum(num, digits) {
		var si = [
		  { value: 1, symbol: "" },
		  { value: 1E3, symbol: "k" },
		  { value: 1E6, symbol: "M" },
		  { value: 1E9, symbol: "G" },
		  { value: 1E12, symbol: "T" },
		  { value: 1E15, symbol: "P" },
		  { value: 1E18, symbol: "E" }
		];
		var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
		var i;
		for (i = si.length - 1; i > 0; i--) {
		  if (num >= si[i].value) {
		    break;
		  }
		}
		return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
	}

}
