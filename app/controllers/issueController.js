const mongoose = require('mongoose');
const shortId = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const Issue = mongoose.model('Issue')
const Comment = mongoose.model('Comment');
const Notification = mongoose.model('IssueNotification');
const WatcherModel = mongoose.model('watcher');


let getAllIssue = (req, res) => {

    Issue.find().select(' -password -__v -_id').lean().exec((err, result) => {
        if (err) {
            console.log(err)
            logger.captureError(err.message, 'Isuue Controller: getAllIssue', 10)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.captureInfo('No Issue Found', 'Issue Controller: getAllIssue')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    })

}// end get all issues
let getSingleIssue = (req, res) => {
    Issue.findOne({ 'issueId': req.params.issueId }).select('-password -__v -_id').lean().exec((err, result) => {
        if (err) {
            console.log(err)
            logger.captureError(err.message, 'Issue Controller: getSingleIssue', 10)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.captureInfo('No Issue Found', 'Issue Controller:getSingleIssue')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    });
}// end get single Issue
let deleteIssue = (req, res) => {

    Issue.findOneAndDelete({ 'issueId': req.params.issueId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.captureError(err.message, 'issue Controller: deleteIssue', 10)
            let apiResponse = response.generate(true, 'Failed To delete issue', 500, null)
            res.send(apiResponse)
        }
        else if (check.isEmpty(result)) {
            logger.captureInfo('No Issue Found', 'Issue Controller: deleteIssue')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the Issue successfully', 200, result)
            res.send(apiResponse)
        }
    })

}// end delete issue
let editIssue = (req, res) => {
    /*
    const { status, title, issueId, description, reporter, reporterId, assignedTo, assignedToId } = req.body
    let options = {
        issueId,
        status,
        title,
        description,
        reporter,
        reporterId,
        assignedTo,
        assignedToId,
       // images: images.split(',')
    }
    const images = (req.body.images != undefined && req.body.images != null && req.body.images != '') ? req.body.images.split(',') : []
  //  newIssue.images = images;
    Issue.updateOne({ 'issueId': req.params.issueId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.captureError(err.message, 'Issue Controller:editIssue', 10)
            let apiResponse = response.generate(true, 'Failed To edit Issue details', 500, null)
            res.send(apiResponse)
        }
        else if (check.isEmpty(result)) {
            logger.captureInfo('No Issue Found', 'Issue Controller: editIssue')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        }
        else {
            let options = {
                $push: {
                    description: 'Someone edited the issue following by you'
                }
            }
            options.notificationCount = 1
            Notification.updateMany({ 'issueId': req.params.issueId }, options)

            logger.captureInfo(false, "issueController:editIssue", 0);
            let apiResponse = response.generate(false, "Issue Details Edited", 200, result);
            res.send(apiResponse);
        }

    })
    */

   let options = req.body;
   console.log(options);
   Issue.update({ 'issueId': req.params.Id }, options, { multi: true }).exec((err, result) => {

       if (err) {
        console.log(err)
        logger.captureError(err.message, 'Issue Controller:editIssue', 10)
        let apiResponse = response.generate(true, 'Failed To edit Issue details', 500, null)
        res.send(apiResponse)
       } else if (check.isEmpty(result)) {
        logger.captureInfo('No Issue Found', 'Issue Controller: editIssue')
        let apiResponse = response.generate(true, 'No Issue Found', 404, null)
        res.send(apiResponse)
       } else {
        let options = {
            $push: {
                description: 'Someone edited the issue following by you'
            }
        }
        options.notificationCount = 1
        Notification.updateMany({ 'issueId': req.params.issueId }, options)

        logger.captureInfo(false, "issueController:editIssue", 0);
        let apiResponse = response.generate(false, "Issue Details Edited", 200, result);
        res.send(apiResponse);

       }
   })
}// end edit user
let createIssue = (req, res) => {
    const { status, title, description, reporter, reporterId, assignedTo, assignedToId } = req.body
    let newIssue = new Issue({
        issueId: shortId.generate(),
        status,
        title,
        description,
        reporter,
        reporterId,
        assignedTo,
        assignedToId,
        createdOn: time.now(),
     //   images: images.split(",")
    })

    const images = (req.body.images != undefined && req.body.images != null && req.body.images != '') ? req.body.images.split(',') : []
    newIssue.images = images;


    newIssue.save((err,result)=>{
        if(err){
            logger.captureError(err.message, 'Issue Controller:createIssue', 10)
            let apiResponse = response.generate(true, "Failed to create new Issue", 500, null);
            res.send(apiResponse)
        }
        else{
            let data = new Notification({
                issueId: result.issueId,
                description: "Your Issue has been posted successfully",
                userId: req.body.reporterId,
                createdOn: time.now(),
            })
            data.notificationCount = 1
            data.save()
    
            let data2 = new Notification({
                issueId: result.issueId,
                description: "You have Assigned a new Issue",
                userId: req.body.assignedToId,
                createdOn: time.now(),
            })
            data2.notificationCount = 1
            data2.save()
    
            let apiResponse = response.generate(false, "new Issue created", 200, result);
            res.send(apiResponse) 
        }
    })
}
let searchIssue = (req, res) => {
    if (check.isEmpty(req.query.arg)) {
        logger.captureError(true, "issueController:SearchIssue", 10);
        let apiResponse = response.generate(true, "No argument entered for search", 500, null);
        res.send(apiResponse);
    } else {
        Issue.find({ $text: { $search: req.query.arg } }).limit(10).skip(parseInt(req.query.skip)).exec((err,result)=>{
            if(err){
                logger.captureError(true, "issueController:SearchIssue", 10);
                let apiResponse = response.generate(true, "error while retrieving data", 500, null);
                res.send(apiResponse);
            }
            else if (check.isEmpty(result)) {
                logger.captureError(true, "issueController:SearchIssue", 5);
                let apiResponse = response.generate(true, "no data present by this search string", 404, null);
                res.send(apiResponse);
            } else {
                logger.captureInfo(false, "issueController:SearchIssue", 0);
                let apiResponse = response.generate(false, "data present by this search string", 200, result);
                res.send(apiResponse);
            }
        })
    }
}
let createWatchList = (req, res) => {
  
    console.log('issueid create param'+ req.params.issueId);
    console.log('userid create param'+req.params.userId)
    console.log('issueid create'+ req.body.issueId);
    console.log('userid create'+req.body.userId)
    let issueId = req.param.issueId 


    WatcherModel.find({ 'issueId': req.params.issueId || req.body.issueId, 'userId':req.params.userId || req.body.userId}).exec((err,result)=>{
        if (check.isEmpty(result) )
        {
            console.log('response '+result);
            console.log(req.body)
            const { watcherId, issueId, userId, userName } = req.body
            let newWatcher = new WatcherModel({
                watcherId,
                issueId,
                userId,
                userName
            })
            newWatcher.save((err,result)=>{
                if(err){
                    logger.captureError(err.message, 'Issue Controller:createWatcherlist', 10)
                    let apiResponse = response.generate(true, "Failed to Add Issue", 500, null);
                    res.send(apiResponse)
                }
                else{
                    let data = new Notification({
                        issueId: req.body.issueId,
                        description: "Issue has been added in Watch List",
                        userId: req.body.watcherId,
                        createdOn: time.now(),
                    })
                    data.notificationCount = 1
                    data.save()
                    let apiResponse = response.generate(false, "Issue Added to Your Watch List", 200, result);
                    console.log(apiResponse);
                    res.send(apiResponse)
                }
            })
        
        }
        else {
            let apiResponse = response.generate(true, "Issue Already present in Watch List", 500, null);
            console.log(apiResponse)
            res.send(apiResponse)
        }
    })     
   
}
let getWatcher = (req, res) => {
    WatcherModel.find().select('-__v').lean().exec((err,result)=>{
        if(err){
            logger.captureError(err.message, 'Issue Controller:getWatcher', 10)
            let apiResponse = response.generate(true, "Failed to Find Watcher", 500, null);
            res.send(apiResponse) 
        }
        else  if (check.isEmpty(result)) {
            logger.captureInfo('No Watcher Found', 'Issue Controller: getWatcher')
            let apiResponse = response.generate(true, 'No Watcher Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All Watcher Found', 200, result)
            res.send(apiResponse)
        }
    })
    
}
let getIssueWatcher =(req,res) =>{
    WatcherModel.find({'issueId':req.params.issueId}).select('-__v').lean().exec((err,result)=>{
        if(err){
            logger.captureError(err.message, 'Issue Controller:getWatcher', 10)
            let apiResponse = response.generate(true, "Failed to Find Watcher", 500, null);
            res.send(apiResponse) 
        }
        else  if (check.isEmpty(result)) {
            logger.captureInfo('No Watcher Found', 'Issue Controller: getWatcher')
            let apiResponse = response.generate(true, 'No Watcher Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All Watcher Found', 200, result)
            console.log(apiResponse)
            res.send(apiResponse)
        }
    })
}
let deleteWatcher = (req, res) => {
    console.log('issueid remove param'+ req.params.issueId);
    console.log('userid remove param'+req.params.userId)
    console.log('issueid remove'+ req.body.issueId);
    console.log('userid remove '+req.body.userId)
    WatcherModel.findOneAndDelete({ 'issueId': req.params.issueId || req.body.issueId , 'userId':req.params.userId || req.body.userId}).exec((err,result)=>{
        console.log('RESULT del '+ result)
        if (err) {
            console.log(err)
            logger.captureError(err.message, 'issue Controller: deletewatch', 10)
            let apiResponse = response.generate(true, 'Failed To Remove Watch', 500, null)
            console.log(apiResponse)
            res.send(apiResponse)
           // res.send('not found')
        } 
        else if (check.isEmpty(result)) {
            logger.captureInfo('No Issue Found', 'Issue Controller: deleteWatch')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            console.log(apiResponse)
            res.send(apiResponse)
        }else {
            let apiResponse= response.generate(false,"Issue Removed From Your Watch List",200,result)
            console.log(apiResponse)
            res.send(apiResponse)
        }
    })
   
}

let addComment = (req, res) => {

    let newComment = new Comment({
        commentId: shortId.generate(),
        issueId: req.body.issueId,
        description: req.body.description,
        reporter: req.body.reporter,
        reporterId: req.body.reporterId,
        createdOn: time.now()
    })

    newComment.save((err,result)=>{
        if(err){
            logger.captureError(true, "issueController:addComment", 10);
            let apiResponse = response.generate(true, "DB error in creating Comment", 500, null)
            res.send(apiResponse);
        }
        else if (check.isEmpty(result)) {
            logger.captureError(true, "issueController:addComment", 5);
            let apiResponse = response.generate(true, "comment not stored", 404, null)
            res.send(apiResponse);
        } else {
            let options = {
                $push: {
                    description: 'Someone Commented on the issue following by you'
                }
            }
            options.notificationCount = 1
            Notification.updateMany({ 'issueId': req.body.issueId }, options)

            logger.captureInfo(false, "issueController:addComment", 0);
            let apiResponse = response.generate(false, "Comment Created", 200, result)
            res.send(apiResponse);
        }
    })
    
}

let readComment = (req, res) => {

    if (check.isEmpty(req.params.issueId)) {
        let apiResponse = response.generate(true, "issueId missing", 500, null);
        res.send(apiResponse);
    } else {
        Comment.find({ 'issueId': req.params.issueId }).exec((err,result)=>{
            if(err){
                let apiResponse = response.generate(true, "error while retrieving comment", 500, null);
                res.send(apiResponse); 
            }
            else  if(check.isEmpty(result)) {
                let apiResponse = response.generate(true, "no Comment present By this Id", 404, null);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(false, "Comments", 200, result);
                res.send(apiResponse);
            }
        })
    }
}

let getAllNotification = (req, res) => {
    Notification.find({ 'userId': req.params.userId }).exec((err,result)=>{
        if(err){
            logger.captureError(err.message, 'Isuue Controller: getAllNotification', 10)
            let apiResponse = response.generate(true, 'Failed To Find Notification Details', 500, null)
            res.send(apiResponse)
        }
        else if (check.isEmpty(result)) {
            logger.captureInfo('No Notification Found', 'Issue Controller: getAllNotification')
            let apiResponse = response.generate(true, 'No Notification Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All Notification Details Found', 200, result)
            res.send(apiResponse)
        }
    })
   
}

let deleteNote = (req, res) => {
    Notification.findOneAndDelete({ 'userId': req.body.userId }).exec((err,result)=>{
        if (result) {
            res.send('deleted')
        } else (
            res.send('err')
        )
    })
    
}

let countUpdate = (req, res) => {
    let options = {
        notificationCount: 0
    }
    Notification.updateMany({ 'userId': req.body.userId }, options).exec((err,result)=>{
        if (result) {
            let apiResponse = response.generate(false, 'All Notification count updated', 200, result)
            res.send(apiResponse)
        } else {
            logger.captureError('some error occured', 'Isuue Controller: getAllNotification', 10)
            let apiResponse = response.generate(true, 'Failed To Find Notification Details', 500, null)
            res.send(apiResponse)
        }
    })
   
}

module.exports = {
    createIssue: createIssue,
    editIssue: editIssue,
    getAllIssue: getAllIssue,
    getSingleIssue: getSingleIssue,
    deleteIssue: deleteIssue,
    searchIssue: searchIssue,
    addComment: addComment,
    readComment: readComment,
    createWatchList: createWatchList,
    getWatcher: getWatcher,
    deleteWatcher: deleteWatcher,
    getAllNotification: getAllNotification,
    deleteNote: deleteNote,
    countUpdate: countUpdate,
    getIssueWatcher:getIssueWatcher
}