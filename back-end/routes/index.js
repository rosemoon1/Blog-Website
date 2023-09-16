//CRUD
const express=require ('express');
const authController= require('../controller/authController');
const blogController = require('../controller/blogController');
const auth = require('../middleware/auth');
const commentController = require('../controller/commentController');
const router = express.Router();
/*test
router.get('/test', (req,res)=>res.json ({ msg:'Working'}))
*/
//register
router.post('/register', authController.register);
//login
router.post('/login',authController.login)
//post bcz user ki trf s data request
//logout
router.post('/logout', auth , authController.logout);
//refresh (can be both post and get)
router.get('/refresh', authController.refresh);
//blog
//create vlog
router.post('/blog' ,auth, blogController.create);
//get all blogs
router.get('/blog/all',auth, blogController.getAll);
//get blog by id
router.get('/blog/:id', auth, blogController.getById);
/*this :id is a placeholder parameter that can be 
replaced with an actual value when a request is made*/
//update blog
router.put('/blog',auth , blogController.update);
//delete blog
router.delete('/blog/:id', auth, blogController.delete);
//comments
//create
router.post('/comment', auth, commentController.create);
//get
router.get('/comment', auth, commentController.getById);
module.exports=router;