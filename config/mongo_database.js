var mongoose = require('mongoose');
var md5 = require('md5');
var SALT_WORK_FACTOR = 10;
var mongodbURL = 'mongodb://127.0.0.1:27017/btb';
var mongodbOptions = { };

mongoose.connect(mongodbURL, mongodbOptions, function (err, db) {
    if (err) { 
        console.log('Connection refused to ' + mongodbURL);
        console.log(err);
    } else {
        console.log('Connection successful to: ' + mongodbURL);
    }
});

var Schema = mongoose.Schema;

// User schema
var User = new Schema({
    username: { type: String, required: true, unique: true }, //手机号
    password: { type: String, required: true }, // 密码 md5
    header:   { type: String, default: ""}, //头像
    email:    { type: String, default: ""}, //邮箱
    mailSec:  { type: Boolean, default: false },  //邮箱认证，是否安全是自己的
    address:  { type: String, default: ""}, //地址
    otherTel: { type: String, default: ""}, //其他联系人的联系方式
    remoteip: { type: String, default: ""}, //登录者的ip
    zijinPay: { type: String, default: ""}, // 资金管理密码 MD5加密
    zhifuPay: { type: String, default: ""}, // 支付管理密码 MD5加密
    is_admin: { type: Boolean, default: false }, // 账号类型
    userStatus: { type: String, default:"0"},  // 用户状态，是否认证， 0没有认证
    mobStatus:  { type: String, default:"0"}, // 手机状态, 0未认证
    roletype: { type: String, default: "0"}, // 用户类型，默认0
    idcard:   { type: String, default: ""}, // 身份证号
    name:     { type: String, default: ""}, // 真实姓名
    bankcode: { type: String, default: ""}, // 银行代码

    bankcount:{ type: String, default: ""}, // 银行账号
    created:  { type: Date, default: Date.now }
});

// 商品
var Post = new Schema({
    title: { type: String, required: true },
    tags: [ {type: String} ],
    is_published: { type: Boolean, default: false },
    content: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    read: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
});

// 订单
var Post = new Schema({
    title: { type: String, required: true },
    tags: [ {type: String} ],
    is_published: { type: Boolean, default: false },
    content: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    read: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
});


// Bcrypt middleware on UserSchema
User.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    user.password = md5(user.password);
    next();
});

//Password verification
User.methods.comparePassword = function(password, cb) {
    if(md5(password)==this.password){
        cb(true);
    }else{
        return cb(false);
    }
};


//Define Models
var userModel = mongoose.model('User', User);


// Export Models
exports.userModel = userModel;
