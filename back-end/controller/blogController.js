const Joi = require("joi");
//use file system ka nodejs m built in module to save in disc
const fs = require("fs");
const Blog = require("../models/blog");
const BlogDTO = require("../dto/blog");
const BlogDetailsDTO = require("../dto/blog-details");
const Comment = require("../models/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    // 1. validate req body
    // 2. handle photo storage, naming
    // 3. add to db
    // 4. return response

    // client side -> base64 encoded string -> decode -> store -> save photo's path in db

    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
       //this regex is a regular expression that 
            //matches mongodb id pattern  
      content: Joi.string().required(),
        //photo client side s base64 
            //encoded string form m aegi
            //then we'll decode it in backend and 
            //then store in db and save photo path in db
      photo: Joi.string().required(),
    });

    const { error } = createBlogSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, author, content, photo } = req.body;
    //2.blog model in model m handle photo
        //phle photo ko nodejs k buffer m read
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jps|jpeg);base64,/, '') , 'base64')
        //give random name
        const imagePath = `${Date.now()}-${author}.png`;
        //save locally
        try{
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        }catch(error){
            return next(error);
        }
        //3. add blog to db 
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        author,
        content,
        photoPath: response.url,
      });

      await newBlog.save();
    } catch (error) {
      return next(error);
    }

    const blogDto = new BlogDTO(newBlog);

    return res.status(201).json({ blog: blogDto });
  },
  async getAll(req, res, next) {
    //it will send info of all blogs
    try {
      const blogs = await Blog.find({});
       // empty pass krn s sara data ajaega object m 
            //dto form
      const blogsDto = [];//array

      for (let i = 0; i < blogs.length; i++) {
        const dto = new BlogDTO(blogs[i]);
        blogsDto.push(dto);
      }

      return res.status(200).json({ blogs: blogsDto });
    } catch (error) {
      return next(error);
    }
  },
  async getById(req, res, next) {
    // validate id
    // response

    const getByIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = getByIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }

    let blog;

    const { id } = req.params;

    try {
      blog = await Blog.findOne({ _id: id }).populate("author");
        //find that id
            /*populate() method in Mongoose is used to replace 
            references in a document with the actual data from another 
            collection. it would replace _id in the author field with
            author's actual object data */
    } catch (error) {
      return next(error);
    }

    const blogDto = new BlogDetailsDTO(blog);

    return res.status(200).json({ blog: blogDto });
  },
  async update(req, res, next) {
    // validate

    const updateBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      blogId: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string(),
    });

    const { error } = updateBlogSchema.validate(req.body);

    const { title, content, author, blogId, photo } = req.body;
      //if we have to update photo , delete previous wli, save new 
        //and baki same as create

    let blog;

    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }

    if (photo) {
      let previousPhoto = blog.photoPath;

      previousPhoto = previousPhoto.split("/").at(-1);
      /*splits the previousPhoto string into an array 
            of substrings using the forward slash (/) as the separator.
            .at(-1) to access the last element of the split array ie
            it's extracting the filename from the end of the split array*/
            //delete photo
      fs.unlinkSync(`storage/${previousPhoto}`);
      //store new photo
            //copied from create
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jps|jpeg);base64,/, '') , 'base64')
            //give random name
            const imagePath = `${Date.now()}-${author}.png`;
            //save locally
            try{
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            }catch(error){
                return next(error);
            }
      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photoPath: response.url,
        }
      );
    } else {
      await Blog.updateOne({ _id: blogId }, { title, content });
    }

    return res.status(200).json({ message: "blog updated!" });
  },
  async delete(req, res, next) {
    // validate id
    // delete blog
    // delete comments on this blog

    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = deleteBlogSchema.validate(req.params);

    const { id } = req.params;

    // delete blog
    // delete comments
    try {
      await Blog.deleteOne({ _id: id });

      await Comment.deleteMany({ blog: id });
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ message: "blog deleted" });
  },
};

module.exports = blogController;