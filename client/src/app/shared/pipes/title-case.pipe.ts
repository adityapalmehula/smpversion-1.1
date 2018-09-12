import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCase'
})
export class TitleCasePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return this.toTitleCase(value); // Second arg is the number of digits to show after decimal
  }
	toTitleCase(str) {
  return str.replace(/\S+/g, str => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase());
}

}
