const Course = require('./../courses/course.entity');
const loggerConstants= require('./../../constants/logger').STUDENT;
const studentflags = require('./student.flag');
const appConstant = require('../../constants').app;
const ReleaseCourse = require('./../releaseCourses/releaseCourse.entity');

/*
* get course details and create assign course object 
*/
/*let  getAssignCourseObject = (courseData)=> {
	return new Promise((resolve,reject)=> {
		Course.findOne({ '_id': courseData._id },['topics','title','category','subcategory'])
		.populate({ path: 'topics',match: {status: appConstant.STATUS.ACTIVE}, select: '_id title', model: 'topics',
			populate: { path: 'subtopics', match: {status: appConstant.STATUS.ACTIVE}, select: {
				'_id':1 ,
				'title':1,
				'learningPaths':1,
			}, model: 'subtopics' }
		}).exec((err, course)=> {
			if(err) {
				reject(err);
			}else {
				let topics=[];
				if(course && course.topics && course.topics.length>0) {
					topics=course.topics.map(topic=> {
						let obj={}; 
						obj['topicId'] = topic._id;
						obj['title'] = topic.title;
						obj['subtopics'] = topic.subtopics.map(subtopic=> {
							let temp={}; 
							temp['subtopicId'] = subtopic._id;
							temp['title'] = subtopic.title;
							temp['learningPaths'] = subtopic['learningPaths'].map(ele=>{
								let obj={};
								obj['contentId']=ele._id;
								obj['title']=ele.title;
								obj['mainContent']=ele.mainContent;
								obj['otherContents']=ele.otherContents;
								return obj;
							});
							return temp;
						});
						return obj;
					})
				}
				let courseObj= {
					"category": course.category,
					"subcategory": course.subcategory,
					"course": courseData._id,
					"title": course.title,
					"topics": topics
				}
				resolve(courseObj);
			}
		});
	});
} */

/*
* Add student id into course's students property. 
	This property is used to count the no. of students enrolled for the course.   
	*/
	const updateReleaseCourseStudentsList = (courseId,version,studentId)=> {
		return new Promise((resolve,reject)=> {
			ReleaseCourse.updateOne({courseId: courseId,version: version},
				{$push : {students:{studentId:studentId, date: Date.now()}}},
				(err,data)=> {
					if(err) return reject(err);
					resolve({success: true, msg: loggerConstants.ASSIGN_COURSE_SUCCESSFULLY});
				});
		});
	}

/*
  Process students assigned courses data by sorting order and 
	limit i.e. number of data to be send
	*/
	const processMyCourses = (courses, queryFlag) =>{
		if(queryFlag === 'dashboard'){
			return sliceCourses(sortCourses(courses, queryFlag), studentflags[queryFlag].limit);
		} else if(queryFlag === '1'){
			return sliceCourses(sortCourses(courses, queryFlag), studentflags[queryFlag].limit);
		}	else if(queryFlag === '2'){
			return sortCourses(courses, queryFlag)
			.map((courseObj) =>{
				return countRatingsTopics(courseObj);
			});
		}
	}

/*
  Process students assigned course for course details page
  */
  const processCourse = (courses, courseId, queryFlag) =>{
  	let courseObj = courses.filter((courseObj) =>  courseObj.course.id === courseId)[0].toObject();
  	return addStatus(courseObj);
  }

// Add topic, subtopic and learning path status to course object
function addStatus(courseObj) {
	courseObj.topics.forEach((topic, topicIndex)=> {
		courseObj.course.topics[topicIndex].status = topic.status;
		courseObj.course.topics[topicIndex]['progress'] = topic.progress;
		topic.subtopics.forEach((subtopic, subtopicIndex)=> {

			// courseObj.course.topics[topicIndex].subtopics[subtopicIndex]['totalVideos'] = courseObj.course.topics[topicIndex].subtopics[subtopicIndex].videos.length || 0;
			// courseObj.course.topics[topicIndex].subtopics[subtopicIndex]['totalNotes'] = courseObj.course.topics[topicIndex].subtopics[subtopicIndex].notes.length || 0;
			// courseObj.course.topics[topicIndex].subtopics[subtopicIndex]['totalKeyPoints'] = courseObj.course.topics[topicIndex].subtopics[subtopicIndex].keypoints.length || 0;
			// courseObj.course.topics[topicIndex].subtopics[subtopicIndex]['totalMedia'] = courseObj.course.topics[topicIndex].subtopics[subtopicIndex].media.length || 0;
			// courseObj.course.topics[topicIndex].subtopics[subtopicIndex]['totalReferences'] = courseObj.course.topics[topicIndex].subtopics[subtopicIndex].references.length || 0;

			delete courseObj.course.topics[topicIndex].subtopics[subtopicIndex].videos;
			delete courseObj.course.topics[topicIndex].subtopics[subtopicIndex].notes;
			delete courseObj.course.topics[topicIndex].subtopics[subtopicIndex].keypoints;
			delete courseObj.course.topics[topicIndex].subtopics[subtopicIndex].media;
			delete courseObj.course.topics[topicIndex].subtopics[subtopicIndex].references;

			courseObj.course.topics[topicIndex].subtopics[subtopicIndex].status = subtopic.status;
			courseObj.course.topics[topicIndex].subtopics[subtopicIndex]['progress'] = subtopic.progress;
			subtopic.learningPaths.forEach((learningPath, learningPathIndex)=> {
				courseObj.course.topics[topicIndex].subtopics[subtopicIndex].learningPaths[learningPathIndex].status = learningPath.status;
			});
		});
	});

	courseObj.course.userRatings.forEach((userRating, index) =>{
		userRating['totalLikes'] = userRating.likes.length || 0;
		userRating['totalDislikes'] = userRating.dislikes.length || 0;

		delete userRating.likes;
		delete userRating.dislikes;
		delete userRating.userId;
	});

	delete courseObj.topics;
	return courseObj;
}

// Calculate number of user ratings and topics
function countRatingsTopics(courseObj){
	//Convert mongoose model object into plain javascript object
	courseObj = courseObj.toObject();

	courseObj.course['totalTopics']= courseObj.course.topics.length || 0;
	courseObj.course['totalUserRatings']= courseObj.course.userRatings.length || 0;

	delete courseObj.course.topics;
	delete courseObj.course.userRatings;

	return courseObj;
}

// Sort courses for flag sort order
function sortCourses(courses, queryFlag){
	if(studentflags[queryFlag].sort === "asc") {
		return courses.sort(sortASC);
	} else if(studentflags[queryFlag].sort === "desc") {
		return courses.sort(sortDESC);
	}
}

// Slice cources as per flag limit
function sliceCourses(courses, limit){
	return courses.slice(0, limit);
}

// Sort data in ascending order
function sortASC(a,b) {
	if (a.status < b.status)
		return -1;
	if (a.status > b.status)
		return 1;
	return 0;
}

// Sort data in descending order
function sortDESC(a,b) {
	if (a.status < b.status)
		return 1;
	if (a.status > b.status)
		return -1;
	return 0;
}

// Process record to transform topic details in order to send response
const processTopic = (courses, courseId, topicId, queryFlag) => {
	let courseData = courses.filter((courseObj) =>  {
		if(courseObj.course)return courseObj.course.id === courseId})[0];

	let topicData = courseData.topics.filter((topic) => topic.topicId.toString() === topicId )[0];

	let topic = courseData.course.topics.filter((topic) =>  topic.id === topicId)[0].toObject();
	topic['progress'] = topicData.progress;
	topic.status = topicData.status;
	topicData.subtopics.forEach((subtopic, subtopicIndex) =>{
		topic.subtopics[subtopicIndex].status = subtopic.status;
		topic.subtopics[subtopicIndex]['progress'] = subtopic.progress;
		subtopic.learningPaths.forEach((learningPath, learningPathIndex)=> {
			topic.subtopics[subtopicIndex].learningPaths[learningPathIndex].status = learningPath.status;
		});
	})
	return topic;
}

/*
* refine course details
*/
const refineCourseDetails = (query,course)=> { 
	let queryInfo = studentflags[query];
	course=course.toObject();
	if(!queryInfo.fields) {
		return course;
	}
	let fieldsInfo = queryInfo.fields,refinedCourse={};
	if(!fieldsInfo.course) {
		return course;	
	}
	let course_fields = fieldsInfo.course;
	course_fields.forEach(prop => {
		if(prop.includes('.')) {
			let props = prop.split('.')
			refinedCourse[props[0]]={};
			refinedCourse[props[0]][props[1]]=course[props[0]][props[1]];
		}else {
			refinedCourse[prop] = course[prop];
		}
	});
	if(fieldsInfo.topics) {
		refinedCourse['topics'] = course.topics.map((topic,t)=> {
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

module.exports= {
//	getAssignCourseObject : getAssignCourseObject,
updateReleaseCourseStudentsList : updateReleaseCourseStudentsList,
processMyCourses : processMyCourses,
processCourse : processCourse,
processTopic : processTopic,
refineCourseDetails : refineCourseDetails,
}