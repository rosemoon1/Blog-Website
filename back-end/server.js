const express = require('express');
const dbConnect=require('./database/index');
const {PORT} = require('./config/index')
const router = require('./routes/index');
const errorhandler = require('./middleware/errorhandler');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const app = express();
app.use(cookieParser());
// app.use(cors(corsOptions));

app.use(
    cors({
      origin: function (origin, callback) {
        return callback(null, true);
      },
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );
app.use(express.json({ limit: "50mb" }));
//allow application to send and recieve data in json
app.use(router);
dbConnect();
app.use('/storage' , express.static('storage'));
app.use(errorhandler);
//app.get('/',(req,res)=>res,json({msg:'hello world'})); ye kaam ab router kregaa
app.listen(PORT,console.log(`Backend is running on port: ${PORT}`));