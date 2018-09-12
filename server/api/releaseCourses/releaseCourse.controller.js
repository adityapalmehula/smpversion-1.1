const ReleaseCourse = require('./releaseCourse.entity');
const logger = require('../../services/app.logger');
const CustomError = require('./../../services/custom-error');
const CommonConfig= require('./../../config/commonConfig');
const CONFIG = require('./releaseCourse.config');
const SubCategory = require('./../subcategories/subcategory.entity');
const _ = require('lodash');

/*
* release course with a specific  version
*/
const persistReleaseCourse = (courseId,releaseCourseDetails,userInfo) => {
  return new Promise((resolve,reject) => {
    let version = 1;
    findLatestCourse(courseId,'version').then(latestCourse => {
      if(latestCourse) {
        version = ++latestCourse.version || 1;
      }
      delete releaseCourseDetails._id;
      releaseCourseDetails['courseId'] = courseId;
      releaseCourseDetails['releasedBy'] = { id: userInfo.userId, role: userInfo.role,name: userInfo.name };
      releaseCourseDetails['version'] = version;
      let releaseCourse= new ReleaseCourse(releaseCourseDetails);
      releaseCourse.save((err, data) => {
        if(err) return reject(err);
        logger.info(CONFIG.LOGGER_CONFIG.COURSE_RELEASE_SUCCESSFULLY);
        resolve({success: true, msg: CONFIG.LOGGER_CONFIG.COURSE_RELEASE_SUCCESSFULLY});
      });
    },error => {
      reject(error);
    });
  });
}

/*
* get lastest version release course based on course id
*/
const findLatestCourse = (courseId,fields) => {
  return new Promise((resolve, reject) => {
    ReleaseCourse.findOne({courseId: courseId})
    .sort('-version')
    .select(fields)
    .exec((err,releaseCourse) => {
      if(err) return reject(err);
      resolve(releaseCourse);
    });
  });
}

/*
* get release course details based on course id and course version
*/
const findCourseByVersion = (courseId,version,fields) => {
  return new Promise((resolve, reject) => {
    ReleaseCourse.findOne({courseId: courseId,version: version})
    .select(fields)
    .exec((err,releaseCourse) => {
      if(err) return reject(err);
      resolve(releaseCourse);
    });
  });
}

/*
* get all released courses with their latest version
*/
const getCoursesWithLatestVersion = async (query,filter=null)=> {
  try {
    let aggregatePipe = getAggregatedPipe(query);
    if(filter) {
      aggregatePipe.unshift({$match: filter});
    }
    let releaseCourses = await ReleaseCourse.aggregate(aggregatePipe).exec();
    if(!releaseCourses) {
      return {success: true, code: 204, msg: CONFIG.LOGGER_CONFIG.NO_DATA_FOUND, data: []};
    }
    let refineCourses = releaseCourses.map(data => data.entry[0]);
    if(query === 'courseInfo') {
      refineCourses =_.orderBy(refineCourses, ['releasedBy_date'],['desc']);
    }
    return {success: true, msg: CONFIG.LOGGER_CONFIG.GET_COURSES_SUCCESSFULLY, data: refineCourses || []};
  } catch(err) {
    throw err;
  }
} 

/*
* find course latest course by courseId 
* get course details of latest version
*/
const getCourseDetails = async (courseId,query) => {
  try {
    let aggregatePipe = getAggregatedPipe(query);
    aggregatePipe.unshift({ $match : { courseId : courseId } });
    let rel_course_details = await ReleaseCourse.aggregate(aggregatePipe).exec();
    if(!rel_course_details[0]) {
      return {success: true, code: 204, msg: CONFIG.LOGGER_CONFIG.NO_DATA_FOUND, data: []};
    }
    let course_details = refineCourseData(query,rel_course_details[0].entry[0]);
    return {success: true, msg: CONFIG.LOGGER_CONFIG.GET_COURSES_SUCCESSFULLY, data: course_details};
  } catch(err) {
    throw err;
  }
} 

/*
* get aggregated pipe based on given query name
*/
const getAggregatedPipe = queryName => {
  let aggregatePipe = [];
  let queryInfo = CONFIG.QUERY_CONFIG[queryName];
  if(!queryInfo) {
    logger.error(CONFIG.LOGGER_CONFIG.NO_QUERY_FOUND);
    throw new CustomError(CONFIG.LOGGER_CONFIG.BAD_REQUEST);
  }
  if(queryInfo['sort']) {
    aggregatePipe.push({ '$sort': queryInfo['sort']});
  }
  if(queryInfo['group']) {
    let  $groupBy = { '$group' : queryInfo['group']}
    if(queryInfo['entry']) {
      let $projection={};
      $groupBy['$group']['entry'] = {};
      $groupBy['$group']['entry']['$push'] = {};
      queryInfo['project'].forEach(field => {
        let key='';
        if(field.includes('_')) {
          key=field.replace('_','').replace(/\./g,'_');
        }else {
          key=field.replace(/\./g,'_');
        }
        $projection[key]=`$`+field;
      });
      $groupBy['$group']['entry']['$push'] = $projection;
    }
    aggregatePipe.push($groupBy);
  }
  return aggregatePipe;
}

/*
* filter data based on required fields
* post data filter
*/
const refineCourseData = (queryName,course)=> { 
  let queryInfo = CONFIG.QUERY_CONFIG[queryName];
  if(!queryInfo.fields) {
    return course;
  }
  let fieldsInfo = queryInfo.fields, refinedCourse = Object.assign({}, course);
  if(fieldsInfo.course) {
    let course_fields = fieldsInfo.course;
    course_fields.forEach(prop => {
      if(prop.includes('.')) {
        let props = prop.split('.')
        delete refinedCourse[props[0]][props[1]];
      }else {
        delete refinedCourse[prop];
      }
    });
  }
  if(fieldsInfo.topics) {
    refinedCourse['topics']=course.topics.map((topic,t)=> {
      let ref_topic= {};
      fieldsInfo.topics.forEach(t_field => {
        ref_topic[t_field] = topic[t_field];
      });
      if(fieldsInfo.subtopics) {
        ref_topic['subtopics']=topic.subtopics.map((subtopic,s) => {
          let ref_subtopic = {};
          fieldsInfo.subtopics.forEach(s_field => {
            ref_subtopic[s_field] = subtopic[s_field];
          });
          if(fieldsInfo.learningPaths) {
            ref_subtopic['learningPaths']=subtopic.learningPaths.map((lp,l) => {
              let ref_lp = {};
              fieldsInfo.learningPaths.forEach(lp_field => {
                ref_lp[lp_field] = lp[lp_field];
              });
              return ref_lp;
            });
          }
          return ref_subtopic;
        });
      }
      return ref_topic;
    });
  }
  return refinedCourse 
}

/*
* get all release courses details for filters
*/
const getCoursesForFilter = (currentUser,queryName) => {
  return new Promise((resolve, reject) => {
    ReleaseCourse.find({},CONFIG.QUERY_CONFIG[queryName].fields)
    .sort({'releasedBy.date': -1 })
    .exec(async (err,courses) => {
      if(err) return reject(err);
      try {
        let refineCourses= _.uniqBy(courses,(ele)=> ele.courseId);
        let data={courses: refineCourses};
        if(queryName=='filterInfo') {
          let subCategories = await SubCategory.find({},'name').exec();
          if(!subCategories) return reject(new Error(CONFIG.LOGGER_CONFIG.NO_SUBCATEGORIES_FOUND));
          data['subCategories']=subCategories;
        }
        resolve({success:true, msg: CONFIG.LOGGER_CONFIG.GET_COURSES_FOR_FILTER_SUCCESSFULLY, data});
      }catch(err) {
        throw err;
      }
    });
  });
}


module.exports = {
  persistReleaseCourse: persistReleaseCourse,
  findLatestCourse: findLatestCourse,
  getCoursesWithLatestVersion: getCoursesWithLatestVersion,
  getCourseDetails: getCourseDetails,
  findCourseByVersion: findCourseByVersion,
  getCoursesForFilter: getCoursesForFilter,
}