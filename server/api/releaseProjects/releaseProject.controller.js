const ReleaseProject = require('./releaseProject.entity');
const logger = require('../../services/app.logger');
const CustomError = require('./../../services/custom-error');
const CommonConfig= require('./../../config/commonConfig');
const CONFIG = require('./releaseProject.config.js');
const _ = require('lodash');


/*
* release Project with a specific  version
*/
const persistReleaseProject = (projectId,releaseProjectDetails,userInfo) => {
  return new Promise((resolve,reject) => {

    let releaseversion = 1;
    findLatestProject(projectId,'releaseversion').then(latestProject => {
      if(latestProject!=null && latestProject.releaseversion) {

        releaseversion = latestProject.releaseversion+1;
      }
      releaseProjectDetails= releaseProjectDetails.toObject();
      delete releaseProjectDetails._id;
     
      releaseProjectDetails['projectId'] = projectId;
      releaseProjectDetails['releasedBy'] = { id: userInfo.userId, role: userInfo.role,name: userInfo.name };
      releaseProjectDetails['releaseversion'] = releaseversion;
        let releaseProject= new ReleaseProject(releaseProjectDetails);
      releaseProject.save((err, data) => {
        if(err) return reject(err);
        logger.info(CONFIG.LOGGER_CONFIG.PROJECT_RELEASE_SUCCESSFULLY);
        resolve({success: true, msg: CONFIG.LOGGER_CONFIG.PROJECT_RELEASE_SUCCESSFULLY});
      });
    },error => {
      reject(error);
    });
  });
}

/*
* get lastest version release Project based on Project id
*/
const findLatestProject = (projectId,fields) => {
  return new Promise((resolve, reject) => {
    ReleaseProject.findOne({projectId: projectId})
    .sort('-releaseversion')
    .select(fields)
    .exec((err,releaseProject) => {
      if(err) return reject(err);
      resolve(releaseProject);
    });
  });
}

/*
* get all released Projects with their latest version
*/
const getProjectsWithLatestVersion = async query => {
  try {
    let releaseProjects = await ReleaseCourse.aggregate(getAggregatedPipe(query)).exec();
    if(!releaseProjects) {
      return {success: true, code: 204, msg: CONFIG.LOGGER_CONFIG.NO_DATA_FOUND, data: []};
    }
    let refineProjects = releaseProjects.map(data => data.entry[0]);
    if(query === 'projectInfo') {
      refineProjects =_.orderBy(refineProjects, ['releasedBy_date'],['desc']);
    }
    return {success: true, msg: CONFIG.LOGGER_CONFIG.GET_PRODUCTS_SUCCESSFULLY, data: refineProducts};
  } catch(err) {
    throw err;
  }
}


/*
* find Project latest project by ProjectId 
* get Project details of latest version
*/
const getProjectDetails = async (projectId,query) => {
  try {
    let aggregatePipe = getAggregatedPipe(query);
    aggregatePipe.unshift({ $match : { projectId : projectId } });
    let rel_project_details = await ReleaseCourse.aggregate(aggregatePipe).exec();
    if(!rel_project_details[0]) {
      return {success: true, code: 204, msg: CONFIG.LOGGER_CONFIG.NO_DATA_FOUND, data: []};
    }
    let project_details = refineCourseData(query,rel_project_details[0].entry[0]);
    return {success: true, msg: CONFIG.LOGGER_CONFIG.GET_COURSES_SUCCESSFULLY, data: project_details};
  } catch(err) {
    throw err;
  }
} 


module.exports = {
  persistReleaseProject: persistReleaseProject,
  findLatestProject: findLatestProject,
  getProjectsWithLatestVersion: getProjectsWithLatestVersion,
  getProjectDetails: getProjectDetails,
}