var express = require('express');
var cors = require('cors');
require('dotenv').config()
const multer = require("multer");
const path = require("path");

var app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

const storage =  multer.diskStorage({

  destination: function(req,file,cb){

    cb(null,path.join(__dirname,"./public/images"));
  },
  filename:function(req,file,cb){

    cb(null,file.originalname)
  }
})

const upload = multer({ storage: storage })

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/fileanalyse",upload.single("upfile"),(req,res)=>{

  const file = req.file;

  console.log(file);

  res.json({

    "name":file.originalname,
    "type":file.mimetype,
    "size":file.size
  })
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
