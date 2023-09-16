/* DTO stands for "Data Transfer Object."
 It is a design pattern used to transfer data between 
different layers or components of an application
The main purpose of a DTO is to encapsulate and
 transport data in a structured way*/
class userDTO{
    constructor(user){
        this._id= user._id;
        this.username = user.username;
        this.name = user.name;
    }
}
module.exports = userDTO;