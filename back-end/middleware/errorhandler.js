const {ValidationError}= require ('joi');
//joi ki trf s we get validation error object type
const errorhandler = (error, req, res, next)=>{
    //default error
    let status=500;//error status code
    let data ={
        message: 'Internal Server error'
    };
    if(error instanceof ValidationError){
        status: error.status;
        data.message = error.message;
        return res.status(status).json(data);
    }
    if(error.status){
        status =error.status;
    }
    if(error.message){
        data.message=error.message;
    }
    return res.status(status).json(data);
};
module.exports = errorhandler; 