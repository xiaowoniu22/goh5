'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var lactate = require('lactate');
var mongoose = require('mongoose');
var pwd = __dirname;

var app = express();
var router = express.Router();
var port = 3030;

var routers = require('./Restful_API/apis/index.js');

global.dbHandel = require('./Restful_API/db/dbHandel.js');
global.db = mongoose.connect("mongodb://localhost:27017/goh5");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'who am i ?',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    saveUninitialized: true,
    resave: true
}));


// 后台页面
app.get('/', function(req, res, next) {
    app.use(lactate.static(pwd + '/Back_Stage/'));
    res.sendFile(pwd + '/Back_Stage/index.html');
    if (req.session.isLogin) {
        next();
    } else {
        res.clearCookie('isLogin');
        res.clearCookie('user_name');
    }
})

// 前台页面
app.engine('.html', require('ejs').__express);
app.get('/show/:id', function(req, res, next) {
    app.set('view engine', 'html');
    app.use(lactate.static(pwd + '/Front_Stage/'));
    var id = req.params.id;
    var Work = global.dbHandel.getModel('work');
    Work.find({ '_id': id }).exec(function(err, docs) {
        res.render(pwd + '/Front_Stage/index.html', {
            workData: docs[0]
        });
    })
})

// 用户上传的图片
app.use('/img', express.static(pwd + '/User/UploadImg/'));

routers.forEach(function(Router) {
    app.use('/api', Router);
})


app.listen(port);

module.exports = app;
