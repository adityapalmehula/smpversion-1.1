import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'search'
})
export class SearchItemPipe implements PipeTransform {
   transform(items: any[], searchText: any): any[] {
    if(!items) return [];
    if(!searchText) return items;
//searchText = searchText.toLowerCase();
return items.filter( courseObj => {
      searchText.title=searchText.title||'';
      searchText.shortDescription =  searchText.shortDescription || '';
      if(courseObj.course) {
      	return courseObj.course.title.toLowerCase().includes(searchText.title.toLowerCase()) || courseObj.course.shortDescription.toLowerCase().includes(searchText.shortDescription.toLowerCase());
      } else if(courseObj) {
      	return courseObj.title.toLowerCase().includes(searchText.title.toLowerCase()) || courseObj.shortDescription.toLowerCase().includes(searchText.shortDescription.toLowerCase());
      }
    });
   }
}