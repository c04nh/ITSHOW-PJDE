var express = require('express')

var app = express()
const bodyParser = require('body-parser')

app.use(express.json())
app.unsubscribe(bodyParser.urlencoded({extended: true}))

app.listen(3000, function() {
    console.log("서버 실행중...")
})


app.set('view engine','ejs'); // 1
app.use(express.static(__dirname + '/public'));

const mysql = require('mysql');
const { render } = require('express/lib/response')

const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'user',
  password : '1234',
  database : 'PJDE'
});

db.connect();

module.exports = db;

app.get('/', function(req,res) {
    res.render('index');
})

app.get("/main", function(req,res){ 
    var sql = 'select * from project;';

    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.render('main', {result:result});
    }); 
})

app.get("/addProject", function(req,res){ 
    res.render('addProject');
})

app.get("/main/notice", function(req,res){ 
    const sql = "select * from notice join project where notice.proid = project.proid order by notDate desc;";
    db.query(sql, (err, row)=>{
      if(err) {
        console.error(err.message);
      }
      res.render('mainNotice', {project:row});
    });
})


app.get("/main/:id/calender", function(req,res){ 
    const id = req.params.id;

    const sql = "SELECT * FROM schedule WHERE proId=?";
    db.query(sql, id, (err, row)=>{
      if(err) {
        console.error(err.message);
      }
      res.render('calender', {id: id, project:row});
    });
})

app.get("/main/:id/calender/addSchedule", function(req,res){
    res.render('addSchedule');
})

app.get("/main/:id/calender/addSchedule/addSche", function(req,res){
    var id = req.params.id;
    var name = req.query.name;
    var date = req.query.select;

    db.query('insert into schedule (schNm, schDate, proId) VALUES("' + name + '", "' + date + '", "' + id + '");');

    res.send("<script>window.location.replace('/main/" + id +"/calender');</script>");
})

app.get("/main/:id/meeting", function(req,res){ 
    const id = req.params.id;

    const sql = "SELECT * FROM meeting WHERE proId=? order by meDate desc";
    db.query(sql, id, (err, row)=>{
      if(err) {
        console.error(err.message);
      }
      res.render('meeting', {project:row});
    });
})

app.get("/main/:id/meeting/addMeeting", function(req,res){
    res.render('addMeeting');
})

app.get("/main/:id/meeting/addMeeting/addMeet", function(req,res){
    var id = req.params.id;
    var title = req.query.title;
    var name = req.query.name;
    var content = req.query.content;

    db.query('insert into meeting (title, userId, proId, content, meDate) VALUES("' + title + '", "' + name + '", "' + id + '", "' + content + '", DATE_FORMAT(now(), \'%Y-%m-%d\'));');

    res.send("<script>window.location.replace('/main/" + id +"/meeting');</script>");
})

app.get("/main/:id/notice", function(req,res){ 
    const id = req.params.id;

    const sql = "SELECT * FROM notice WHERE proId=? order by notDate desc";
    db.query(sql, id, (err, row)=>{
      if(err) {
        console.error(err.message);
      }
      res.render('notice', {project:row});
    });
})

app.get("/main/:id/notice/addNotice", function(req,res){ 
    const id = req.params.id;

    res.render('addNotice');
})

app.get("/main/:id/notice/addNotice/addNot", function(req,res){
    var id = req.params.id;
    var content = req.query.content;
    var name = req.query.name;

    db.query('insert into notice (content, proId, userId, notDate) VALUES("' + content + '", "' + id + '", "' + name + '", DATE_FORMAT(now(), \'%Y-%m-%d\'));');

    res.send("<script>window.location.replace('/main/" + id +"/notice');</script>");
})

app.get("/register", function(req,res){ 
    res.render('register'); 
})

app.get("/send", function(req,res){ 
    var name = req.query.name; 
    var id = req.query.id;
    var password = req.query.password;
    
    db.query('insert into user (userId, password, userName) VALUES("' + id + '", "' + password + '", "' + name + '");');

    res.send("<script>alert('회원가입 되었습니다.'); window.location.replace('/');</script>");

})

app.get("/login", function(req, res){
    res.render('login');
});

app.get("/trylogin", function(req,res){
    var id = req.query.id;
    var password = req.query.password;

    var sql = 'select * from user where userId = "' + id + '" and password = "' + password + '";';

    db.query(sql, function (err, result, fields) {
        if (err) throw err;
        var numRows = result.length;
        if(numRows > 0){
            console.log("로그인");
            var name = result[0].userName;
            res.send("<script>alert('" + name + "님 환영합니다.'); window.location.replace('/main');</script>");
        }else{
            res.send("<script>alert('아이디 또는 비밀번호를 잘못 입력하였습니다.'); window.location.replace('/login');</script>");
        }
      });
    
})

app.get("/create", function(req,res){ 
    var color = req.query.color;
    var title = req.query.title;
    var manager = req.query.manager;
    var id1 = req.query.id1;
    var id2 = req.query.id2;
    var id3 = req.query.id3;
    var id4 = req.query.id4;

    var today = new Date();
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + month + day;
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2); 
    var timeString = hours + minutes + seconds;

    var len = title.length;
    if(len > 6) len = 6;

    var proid = dateString + timeString + title.substring(0, len);

    db.query('insert into project (proId, proName, col, manager, userId1, userId2, userId3, userId4) VALUES("' + proid + '", "' + title + '", "' + color + '", "' + manager + '", "' + id1 + '", "' + id2 + '", "' + id3 + '", "' + id4 + '");');

    res.send("<script> window.location.replace('/main');</script>");

})