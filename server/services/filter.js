/*
* get filter query from query params
*/
module.exports ={
  getFilterQuery: (queryParams) => {
    let $where={},filters={};
    for(let key in queryParams) {
      if(queryParams.hasOwnProperty(key)) {
        let value= queryParams[key];
        if(Array.isArray(value)) {
         if(key.startsWith('counter_')) {
          let prop=key.substring(8,key.length);
          if(!filters['$counter']) {
            filters['$counter']={};
          }
          filters['$counter'][prop]=value;
       // filters['$counter'][prop].push(value);
     }else {
       let $orArr=[];
       value.forEach(val=> {
        let obj={};
        obj[key]=val;
        $orArr.push(obj)
      })
       $where['$or']=$orArr;
     }
   }else if(key==="startDate" || key==="endDate") {
    if(!$where['creationDate']) {
      $where['creationDate']={};
    }
    if(key==="startDate"){
      $where['creationDate']['$gte']=value;
    }else if(key==="endDate") {
      $where['creationDate']['$lte']=value;
    }
  }else if(key==="date") {
    $where['creationDate']={};
    $where['creationDate']['$lte']=value;
  }else if(key==="limit") {
    filters['$limit']=value;
  }else if(key==="full_text_search") {
    $where['$text']={};
    $where['$text']['$search']=value;
  }else if(key.startsWith('orderby_')) {
    let prop=key.substring(8,key.length);
    if(!filters['$orderby']) {
      filters['$orderby']={};
    }
    filters['$orderby'][prop]= value;
  }else {
    $where[key]=value;
  }
}
}
if(Object.getOwnPropertyNames($where).length>0) {
  filters['$where']=$where;
};
return filters;
},

getQuery: (queryParams)=> {
  let $where={},filters={};
  for(let key in queryParams) {
    if(queryParams.hasOwnProperty(key)) {
      let value= queryParams[key];
      if(Array.isArray(value)) {
       if(key.startsWith('counter_')) {
        let prop=key.substring(8,key.length);
        if(!filters['$counter']) {
          filters['$counter']={};
        }
        filters['$counter'][prop]=value;
       // filters['$counter'][prop].push(value);
     }else {
       let $orArr=[];
       value.forEach(val=> {
        let obj={};
        obj[key]=val;
        $orArr.push(obj)
      })
       $where['$or']=$orArr;
     }
   }else if(key==="startDate" || key==="endDate") {
    if(!$where['createdBy.date']) {
      $where['createdBy.date']={};
    }
    if(key==="startDate"){
      $where['createdBy.date']['$gte']=value;
    }else if(key==="endDate") {
      $where['createdBy.date']['$lte']=value;
    }
  }else if(key==="date") {
    $where['createdBy']={};
    $where['createdBy.date']={};
    $where['createdBy.date']['$lte']=value;
  }else if(key==="limit") {
    filters['$limit']=value;
  }else if(key==="skip") {
    filters['$skip']=value;
  }else if(key==="full_text_search") {
    $where['$text']={};
    $where['$text']['$search']=value;
  }else if(key.startsWith('orderby_')) {
    let prop=key.substring(8,key.length);
    if(!filters['$orderby']) {
      filters['$orderby']={};
    }
    filters['$orderby'][prop]= value;
  }else {
    $where[key]=value;
  }
}
}
if(Object.getOwnPropertyNames($where).length>0) {
  filters['$where']=$where;
};
return filters;
}
}