const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")
const middleware = require("../Middleware/auth")
const aws =require("aws-sdk")



                         //USER API//
router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)


                         //BOOKS API//
router.post('/books', middleware.authentication, middleware.authorisation2, bookController.createBook )
router.get("/books",middleware.authentication, bookController.getBookByQuery)
router.get('/books/:bookId',middleware.authentication, bookController.getBookByParam)
router.put("/books/:bookId", middleware.authentication, middleware.authorisation, bookController.updateBooks)
router.delete('/books/:bookId', middleware.authentication, middleware.authorisation, bookController.deletedByParams)
               

                         //REVIEW API//
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteBookReview)

/////AWS ///////
aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})

module.exports = router;