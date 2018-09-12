const router = require('express').Router();
const logger = require('../../services/app.logger');
const blgCtrl = require('./blogs.controller');

/*
 * Actual URI will be HTTP POST 
 */

router.post('/', function(req, res) {
    let blogData = req.body;
    	let owner = req.decoded;
    	let userName= owner.username;
    	let name = owner.name;

      logger.debug('Get object and store into blogData');
    try {
        if (!blogData) {
            logger.error('blogData not found');
            throw new Error('Invalid inputs passed...!');
        }
           blgCtrl.registerBlog(blogData,userName,name).then((successResult)=> {
            logger.info('Get successResult successfully and return back');
            return res.status(201).send(successResult);
        }, (errResult)=> {
            // Log the error for internal use
            logger.error('Internal error occurred');
            return res.status(500).send({ error: 'Internal error occurred, please try later..!' });
        });
    } catch (err) {
        // Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
    }
});


/*
* To update data 
*/
router.put('/id/:id',function(req, res){
let blogData=req.body;
let blogId=req.params.id;

	logger.debug('Get object and update into blogData');
	try {
			if(!blogData){
				logger.error('blogData not found');
				throw new Error('Invalid inputs passed...!');
			}
			blgCtrl.updateBlog(blogData,blogId).then((successResult) => {
				logger.info('Update successfully and return back');
				return res.status(201).send(successResult);
			}, (errResult)=>{
				// log the error for internal use
				logger.error('Internal error occurred');
				return res.status(304).send({error : 'Internal error occurred, please try later..!' });
			});
	} catch(err) {
		// Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
	}
});

/*
* To get data from blogs Collection
*/

router.get('/',function(req,res){
try
	{
		blgCtrl.getBlog().then((successResult)=>{
			logger.info('Get All Data of Blogs');
			return res.status(203).send(successResult);
		}, (errResult) => {
			//log the error for internal use
			logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
		});
	}
	catch(err) {
		// Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
	}
});


/*
* To delete data from blogs Collection
*/

router.delete('/id/:id',function(req,res){
let blogId=req.params.id;

try
	{
		blgCtrl.deleteBlog(blogId).then((successResult)=>{
			logger.info('Delete data from blog');
			return res.status(203).send(successResult);
		}, (errResult) => {
			//log the error for internal use
			logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
		});
	}
	catch(err) {
		// Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
	}
});


router.get('/id/:id',function(req,res){
let blogId=req.params.id;

try
	{
		blgCtrl.GetBlog(blogId).then((successResult)=>{
			logger.info('get data from blog');
			return res.status(203).send(successResult);
		}, (errResult) => {
			//log the error for internal use
			logger.error('Internal error occurred');
            return res.status(204).send({ error: 'Internal error occurred, please try later..!' });
		});
	}
	catch(err) {
		// Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
	}
});

// insert into comment into MongoDB
router.put('/:blogId/comments',function(req,res){

let blogComment=req.body;
let blogId=req.params.blogId;
console.log(blogId);
console.log(blogComment);
logger.debug('Get object and insert into blogComment');
try{
	if(!blogComment){
				logger.error('blogComment not found');
				throw new Error('Invalid inputs passed...!');
			}
			blgCtrl.commentBlog(blogComment,blogId).then((successResult) => {
				logger.info('Insert successfully and return back');
				return res.status(201).send(successResult);
			}, (errResult)=>{
				// log the error for internal use
				logger.error('Internal error occurred');
				return res.status(304).send({error : 'Internal error occurred, please try later..!' });
			});
	} catch(err) {
		// Log the Error for internal use
        logger.fatal('Exception occurred' + err);
        res.send({ error: 'Failed to complete successfully, please check the request and try again..!' });
        return;
}
});


module.exports = router;