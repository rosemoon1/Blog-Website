//jb b request aegi , controller logic ko execute krga
const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require("../models/token");
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
//regular expression from google
const authController = {
  async register(req, res, next) {
    // 1. validate user input
    //we an do validation both manually or by joi library
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    }); 
    const { error } = userRegisterSchema.validate(req.body);

    // 2. if error in validation -> return error via middleware
    if (error) {
      return next(error);
       //next is agla middleware and abi ek hi 
       //middleware h toh vhi call hga wps
    }
    // 3. if email or username is already registered -> return an error
    const { username, name, email, password } = req.body;

    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 409,
          message: "Email already registered, use another email!",
        };

        return next(error);
      }

      if (usernameInUse) {
        const error = {
          status: 409,
          message: "Username not available, choose another username!",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // 4.if no error, password hash
    const hashedPassword = await bcrypt.hash(password, 10);
     //10 ka mtlb 10 sorting rounds
    // 5. store user data in db
    let accessToken;
    let refreshToken;

    let user;

    try {
         //->store data 
      const userToRegister = new User({
        username,
        email,
        name,
        password: hashedPassword,
      });

      user = await userToRegister.save();

      // token generation
      //accessToken variable initiated above
      accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
      refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }

    // store refresh token in db
    await JWTService.storeRefreshToken(refreshToken, user._id);

    // send tokens in cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
       //ie 1 day
      httpOnly: true,
       //for security from xss attacks
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    // 6. response send

    const userDto = new UserDTO(user);

    return res.status(201).json({ user: userDto, auth: true });
  },
  async login(req, res, next) {
    // 1. validate user input
    // 2. if validation error, return error
    // 3. match username and password
    // 4. return response

    // we expect input data to be in such shape
    //validate
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern),
    });
    const { error } = userLoginSchema.validate(req.body);
    //if error, return 
    if (error) {
      return next(error);
    }
    //else match username
    const { username, password } = req.body;

    // const username = req.body.username
    // const password = req.body.password

    let user;

    try {
      // match username
      user = await User.findOne({ username: username });
      //ya value milgyi else null
      if (!user) {
        const error = {
          status: 401,
          message: "Invalid username",
        };

        return next(error);
      }

      // match password
      // req.body.password -> hash -> match

      const match = await bcrypt.compare(password, user.password);
       //ek password req.body s and dusra User model database s
       //bcrypt apn ap hash krdga fir compare krga
      if (!match) {
        const error = {
          status: 401,
          message: "Invalid password",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");

    // update refresh token in database
    try {
      await RefreshToken.updateOne(
        {
          _id: user._id,
        },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
    //cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
//4.return response
//to return response in a specific style , create dto
    const userDto = new UserDTO(user);

    return res.status(200).json({ user: userDto, auth: true });
  },
  async logout(req, res, next) {
    //validation will be done using middleware to authenticate user
    //auth.js in middleware
    // 1. delete refresh token from db
    const { refreshToken } = req.cookies;

    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }

    // delete cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // 2. response
    res.status(200).json({ user: null, auth: false });
  },
  async refresh(req , res , next){
    //1.get refresh token from cookies
    const originalRefreshToken = req.cookies.refreshToken;
    //2. verify refresh token
    let id;
    try{
      id=JWTService.verifyRefreshToken(originalRefreshToken)._id;
      //ie jo object milegi uski id access krrhy h
    }catch(e){
      const error = {
        status:401,
        message: "Unauthorized"
      };
      return next(error);
    }
    try{
      const match = RefreshToken.findOne({_id : id, token: originalRefreshToken});
      if(!match){
        const error ={
          status:401,
          message: 'Unauthorized'
        };
        return next(error);
      }
    }catch(e){
      return next(e);
    }
    //3.generate new token
    try{
      const accessToken = JWTService.signAccessToken({_id : id} , "30m");
      const refreshToken = JWTService.signRefreshToken({_id : id} , "60m");
      //4. update db 
      await RefreshToken.updateOne({_id: id},{token: refreshToken});
      //update in cookie
      res.cookie('accessToken', accessToken, {
        maxAge : 1000 * 60 * 60 *24,
        httpOnly: true
      })
      res.cookie('refreshToken', refreshToken, {
        maxAge : 1000 * 60 * 60 *24,
        httpOnly: true
      });
    }catch(error){
      return next(error);
    }
    //response
    const user = await User.findOne({_id : id});
    const userDto = new UserDTO(user);
    return res.status(200).json({user: userDto , auth:true});
  }
};

module.exports = authController;