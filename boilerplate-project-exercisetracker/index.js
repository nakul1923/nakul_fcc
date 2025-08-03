const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)

let users = [];
let exercises = [];
let id = 1;
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users",(req,res)=>{

  try {
    
    const username = req.body.username;
    
    const existingUser = users.find(us => us.username === username);
    if (existingUser) {
      return res.json(existingUser);
    }

    const user = {username:username,_id:id.toString()}
    id++;
    users.push(user);
    res.json(user);
  } catch (error) {
    
    res.status(400).send(error);
  }
})

app.get("/api/users",(req,res)=>{


  try {
    
     const filteredUsers = users.map(user => ({
      username: user.username,
      _id: user._id
    }));

    res.json(filteredUsers);
  } catch (error) {
    
    res.send(error)
  }
})

app.post("/api/users/:_id/exercises",(req,res)=>{


  const {description,duration,date} = req.body;

  

  const user = users.find(us => us._id == req.params._id);

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const formatted = date ? new Date(date).toDateString() : new Date().toDateString();
  
  const exercise = {
  username: user.username,
  description,
  duration: parseInt(duration),
  date: date ? new Date(date) : new Date(), // keep this as a Date object
  _id: user._id
  }


  exercises.push(exercise);

  console.log(typeof duration, typeof formatted);

  res.json({
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exercise.date.toDateString(),  // return formatted date
    _id: user._id
  });
})

app.get("/api/users/:_id/logs",(req,res)=>{

  const user = users.find(us => us._id == req.params._id);

  if(!user){

    return res.status(400).send("no user found so that we cannot add exercise")
  }
  let exercise =  exercises.filter(ex=>ex._id===req.params._id);


  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    exercise = exercise.filter(ex => ex.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    exercise = exercise.filter(ex => ex.date <= toDate);
  }


  if (limit) {
    exercise = exercise.slice(0, parseInt(limit));
  }

  const formattedLogs = exercise.map(ex => {
    let dateObj = new Date(ex.date);
    let dateStr = dateObj.toDateString();
    if (dateStr === "Invalid Date") {
      dateStr = new Date().toDateString();
    }
    return {
      description: ex.description,
      duration: ex.duration,
      date: dateStr
    };
  });

  console.log(formattedLogs);

  res.json({

    username:user.username,
    _id:user._id,
    count: formattedLogs.length,
    log:formattedLogs
  })

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
