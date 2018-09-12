const BlogModel = require('./blogs.entity');
const logger = require('../../services/app.logger');
const appConstant = require('../../constants/').app;
//Save new blog's details
const registerBlog = function(blogObj,userName,name) {
    logger.debug('Get blogobj and store into blogDetails', blogObj);
    var blogDetails = {
        keyword:blogObj.keyword,
        description:blogObj.description,
        title:blogObj.title,
        url:blogObj.url,
        content:blogObj.content,
        createdBy:userName,
        createdName:name,
        status:blogObj.status,
        createdOn:Date.now(),
        updatedOn:Date.now(),
            };
   let blogData = new BlogModel(blogDetails);

    // insert the data into db using promise
    return new Promise((resolve, reject) => {
        blogData.save(function(err, data) {
            if (err) {
                logger.error('blogData not added sucessfully' + err);
                reject(err);
            } else {
                resolve({ success: true, msg: ' Successfully Registered' });
            }
        });
    });
};

// update blog data
const updateBlog=function(blogObj,blogId){
	logger.debug('Get blogObj and update into blogdetails',blogObj);

//update data of blog
return new Promise((resolve,reject)=>{
BlogModel.updateOne({_id:blogId},
{
	$set:{
 		keyword:blogObj.keyword,
        description:blogObj.description,
        title:blogObj.title,
        url:blogObj.url,
        content:blogObj.content,
        status:blogObj.status,
        updatedOn:Date.now()
		}
	},function(err,data) {
		if(err) {
			logger.error('blogData not updated successfully' + err);
			reject(err);
		} else {
			resolve({success : true, msg : 'updated successfully'});
		}
});
});
};

// insert Comment into Mongodb
const commentBlog=function(blogComment,blogId){
    logger.debug('Get blogComment and update into blogdetails',blogComment);
return new Promise((resolve,reject)=>{
BlogModel.findOneAndUpdate({'_id':blogId},
{
    $push:{
        comments : {
            commentedBy:blogComment.name,
            commentedEmail:blogComment.email,
            comment:blogComment.comment
        }
    }
},function(err,data){
    if(err){
        logger.error('blogComment not updated' + err);
            reject(err);
    } else {
        resolve({success : true, msg : 'updated successfully'});
    }
});
});
};

// get all blog data

const getBlog=function(){
return new Promise((resolve,reject)=>{

	BlogModel.find({},function(err,data){
			  if (err) {
                logger.error('blogModel Not Get any data' + err);
                reject(err);
            } else {
            	resolve(data);
            }
		});
	});
};


// delete blog data

const deleteBlog=function(objId){

return new Promise((resolve,reject)=>{

	BlogModel.deleteOne({_id:objId},function(err,data){
			  if (err) {
                logger.error('blogModel Not Get any data' + err);
                reject(err);
            } else {
            	resolve(data);
            }
		});
	});
};



const GetBlog=function(objId){
return new Promise((resolve,reject)=>{
	BlogModel.findOne({_id:objId},function(err,data){
			  if (err) {
                logger.error('blogModel Not Get any data' + err);
                reject(err);
            } else {
            	resolve(data);
            }
		});
	});
};

module.exports = {
    registerBlog: registerBlog,
    getBlog:getBlog,
    updateBlog:updateBlog,
    deleteBlog:deleteBlog,
    GetBlog:GetBlog,
    commentBlog:commentBlog
};