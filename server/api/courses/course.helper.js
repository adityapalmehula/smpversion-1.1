const loggerConstants= require('./../../constants/logger').STUDENT;
const courseflags = require('./course.flag');
const constants = require('./../../constants/app');
const Course = require('./course.entity');

/*
  Process courses data by as per query flag.
  */
  const processCourses = (courses, queryFlag) =>{
  	if(queryFlag === '1' || queryFlag === '2'){
  		return courses.map((course) =>{
  			return transformCourse(course);
  		});
  	}
  }

/*
  Process students assigned course for course details page
  */
  const processCourse = (course) =>{
  	course = course.toObject();
  	return addStatus(course);
  }

// Add topic, subtopic and learning path status to course object
function addStatus(course) {
	// course.topics.forEach((topic, topicIndex)=> {
	   // topic.subtopics.forEach((subtopic, subtopicIndex)=> {

			  // course.topics[topicIndex].subtopics[subtopicIndex]['totalVideos'] = course.topics[topicIndex].subtopics[subtopicIndex].videos.length || 0;
			  // course.topics[topicIndex].subtopics[subtopicIndex]['totalNotes'] = course.topics[topicIndex].subtopics[subtopicIndex].notes.length || 0;
			  // course.topics[topicIndex].subtopics[subtopicIndex]['totalKeyPoints'] = course.topics[topicIndex].subtopics[subtopicIndex].keyPoints.length || 0;
			  // course.topics[topicIndex].subtopics[subtopicIndex]['totalMedias'] = course.topics[topicIndex].subtopics[subtopicIndex].medias.length || 0;
			  // course.topics[topicIndex].subtopics[subtopicIndex]['totalReferences'] = course.topics[topicIndex].subtopics[subtopicIndex].references.length || 0;

		   // 	delete course.topics[topicIndex].subtopics[subtopicIndex].videos;
		   // 	delete course.topics[topicIndex].subtopics[subtopicIndex].notes;
		   // 	delete course.topics[topicIndex].subtopics[subtopicIndex].keyPoints;
		   // 	delete course.topics[topicIndex].subtopics[subtopicIndex].medias;
		   // 	delete course.topics[topicIndex].subtopics[subtopicIndex].references;

			// });
		// });

		course.userRatings.forEach((userRating, index) =>{
			userRating['totalLikes'] = userRating.likes.length || 0;
			userRating['totalDislikes'] = userRating.dislikes.length || 0;
			
			delete userRating.likes;
			delete userRating.dislikes;
			delete userRating.userId;
		});

		course['totalStudents'] = course.students.length || 0;

		delete course.students;
		
		return course;
	}

// Transform course object to set the properties fields and remove the extra fields.
function transformCourse(course){
	//Convert mongoose model object into plain javascript object
	course = course.toObject();

	course['totalUserRatings'] = course.userRatings.length || 0;
	course['totalStudents'] = course.students.length || 0;
	if(course.topics) {
		let topics= course.topics.filter((topic)=>{
			return topic.status== constants.CONTENT_STATUS[2]
		})
		course['totalTopics'] = topics.length || 0;
	}
	delete course.students;
	delete course.userRatings;

	return course;
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

/* get course status on basis of course id*/
const getCourseStatus =(courseId)=>{
  return new Promise((resolve,reject)=>{
    Course.findOne({'_id':courseId},'status', function(err,status){
      if(err){
        reject({success:false,msg:loggerConstants.COURSE_STATUS_NOT_FOUND})
      } else {
        resolve({success:true,msg:status})
      }
    })
  })
}


module.exports= {
	processCourses : processCourses,
	processCourse : processCourse,
	getCourseStatus : getCourseStatus
}