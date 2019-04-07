const express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
const secret = 'Secret';

const router = express.Router();

  
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
      cb(null,file.originalname)
    }
  });
  
  const upload = multer({storage: storage});
  
  function readJsonFileSync(userId){
    var somedata = JSON.parse(fs.readFileSync('file.json', 'utf8'));
    for (var i=0 ; i < somedata.users.length ; i++)
    {
      console.log(somedata.users[i]);
      if (somedata.users[i].id == userId) {
        return JSON.stringify(somedata.users[i].tasks)
      }
    }
    return somedata
  }
  function getJsonFromFile(userId){
    var somedata = JSON.parse(fs.readFileSync('file.json', 'utf8'));
    for (var i=0 ; i < somedata.users.length ; i++)
    {
      console.log(somedata.users[i]);
      if (somedata.users[i].id == userId) {
        return JSON.stringify(somedata)
      }
    }
    return null;
  }

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })

router.use(cookieParser());
router.use(cors({
  origin: 'http//localhost:3000',
  credentials: true
}));

router.use(async(req,res)=>{
  
  const token = req.cookies.access_token;
  try{
    const decoded = await jwt.verify(token, secret);
  }catch(err){
    res.status(401).end();
    throw err;
  }
  req.next();
  
});

router.get('/',(req,res,next)=>{

});


router.post("/create/:id", upload.single('myfile'), urlencodedParser, function (request, response) {
  if(!request.body) return response.sendStatus(400);
  console.log(request.body);
  const userId = request.params.id;
  var obj=JSON.parse(getJsonFromFile(userId));//JSON.parse(fs.readFileSync('file.json', 'utf8'));
  var userTasks=JSON.parse(readJsonFileSync(userId));
  var fName=""; var fType="";
  if (typeof request.file !== 'undefined') {
    fName =request.file.originalname;
    fType=request.file.mimetype;
  }
  userTasks.push({taskName: `${request.body.taskName}`, deadline:`${request.body.deadline}`,
  status:`${request.body.status}`, fileName: fName, fileType: fType});
  obj.users[userId].tasks={};
  obj.users[userId].tasks=userTasks;
  var json = JSON.stringify(obj); //convert it back to json
  console.log(json);
  fs.writeFile('file.json', json, 'utf8', (error)=>{
    console.log(error);
  });
  response.send(JSON.stringify(userTasks));
});

router.delete("/delete/:id/:task", urlencodedParser, function (request, response) {
  
  if(!request.params) return response.sendStatus(400);
  
  const userId = request.params.id;
  var obj=JSON.parse(getJsonFromFile(userId));//JSON.parse(fs.readFileSync('file.json', 'utf8'));
  var userTasks=JSON.parse(readJsonFileSync(userId));
  for (var i=0 ; i < userTasks.length ; i++)
  {
      if (userTasks[i].taskName == `${request.params.task}`) {
        userTasks.splice(i, 1);
        break;
      }
  }
  obj.users[userId].tasks={};
  obj.users[userId].tasks=userTasks;
  var json = JSON.stringify(obj); //convert it back to json
  console.log(json);
  fs.writeFile('file.json', json, 'utf8', (error)=>{
    console.log(error);
  });
  response.send(JSON.stringify(userTasks));
});

router.put("/update/:id", upload.single('myfile'), urlencodedParser, function (request, response) {
  
  if(!request.body) return response.sendStatus(400);
  console.log(request.body);
  
  const userId = request.params.id;
  var obj=JSON.parse(getJsonFromFile(userId));//JSON.parse(fs.readFileSync('file.json', 'utf8'));
  var userTasks=JSON.parse(readJsonFileSync(userId));
  var fName=""; var fType="";
  updateObj(userTasks,request);
  obj.users[userId].tasks={};
  obj.users[userId].tasks=userTasks;
  var json = JSON.stringify(obj); //convert it back to json
  console.log(json);
  fs.writeFile('file.json', json, 'utf8', (error)=>{
    console.log(error);
  });
  response.send(JSON.stringify(userTasks));
});

function updateObj(obj,request){
    var bool=false;
    for (var i=0 ; i < obj.length ; i++)
    {
      if (obj[i].taskName == `${request.body.taskName}`) {
        bool=true;
        obj[i].deadline=`${request.body.deadline}`;
        obj[i].status=`${request.body.status}`;
        if (typeof request.file !== 'undefined') {
          obj[i].fileName = request.file.originalname;
          obj[i].fileType = request.file.mimetype;
        }
        break;
      }
    }
    return bool;
  }

module.exports=router;