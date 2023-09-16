const JWTService = require('../services/JWTService');
const User = require('../models/user');
const UserDTO = require('../dto/user');

const auth = async (req, res, next) => {
    try{
        // 1. refresh, access token validation
    const {refreshToken, accessToken} = req.cookies;

    if (!refreshToken || !accessToken){
        //ie present nhi h cookie m , ie null
        const error = {
            status: 401,
            message: 'Unauthorized'
        }

        return next(error)
    }
//if not null then 
    let _id;

    try{
        _id = JWTService.verifyAccessToken(accessToken)._id;
        /*bcz verifyaccesstoken func payload return krta h 
    aur authcontroller m hmne payload m har jgh srf 
    _id: user._id di hai */
    }
    catch(error){
        return next(error);
    }

    let user;

    try{
        user = await User.findOne({_id: _id});
    }
    catch(error){
        return next(error);
    }

    const userDto = new UserDTO(user);

    req.user = userDto;

    next();
    }
    catch(error){
        return next(error);
    }
}

module.exports = auth;