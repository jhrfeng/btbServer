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
    qq:       { type: String, default: ""}, //qq
    weixin:   { type: String, default: ""}, //weixin
    email:    { type: String, default: ""}, //邮箱
    mailSec:  { type: Boolean, default: false },  //邮箱认证，是否安全是自己的
    address:  { type: String, default: ""}, //地址
    otherTel: { type: String, default: ""}, //其他联系人的联系方式
    remoteip: { type: Array             }, //登录者的ip
    zijinPay: { type: String, default: ""}, // 资金管理密码 MD5加密
    zhifuPay: { type: String, default: ""}, // 支付管理密码 MD5加密
    is_admin: { type: Boolean, default: false }, // 账号类型
    userStatus: { type: String, default:"0"},  // 用户状态，是否认证， 0没有认证,1认证中，2已认证
    mobStatus:  { type: String, default:"0"}, // 手机状态, 0未认证
    roletype: { type: String, default: "0"}, // 用户类型，默认0
    idcard:   { type: String, default: ""}, // 身份证号
    name:     { type: String, default: ""}, // 真实姓名
    bankcode: { type: String, default: ""}, // 银行代码
    bankcount:{ type: String, default: ""}, // 银行账号
    updated:  { type: Date, default: Date.now},
    created:  { type: Date, default: Date.now }
});

// 商品
var Post = new Schema({
    pid:     { type: String, required: true }, // 商品id
    name:    { type: String, required: false},  // 商品名称
    weeks:   { type: String, required: true }, // 周期天数
    shouyi:  { type: String, required: true }, // 收益率
    join:    { type: String, required: true }, // 起投金额
    created: { type: Date, default: Date.now }, //
    updated: { type: Date, default: Date.now },
    status:  { type: String, default: "1" },   // 状态有效1
});

// 日志
var Log = new Schema({
    name:    { type: String},  // 模块名称
    content: { type: Object},   // 日志内容
    msg:     { type: String},
    created: { type: Date, default: Date.now }
});

// 订单
var Order = new Schema({
    userid:   { type: String, required: true }, // 关联的用户
    orderid:  { type: String, required: true, unique: true }, // 订单号号
    pid:      { type: Object, required: true }, // 商品id
    payAmount:{ type: Number, required: true }, // 订单金额
    tradeno:  { type: String, required: true, unique: true }, // 交易流水号凭证
    outtrade: { type: String, required: true, unique: true }, // 商户订单号
    opendate: { type: Date, default: Date.now }, // 赎回日期
    openAmount:{type: Number, default: 0}, // 预期收益
    openStatus:{type: String, default: "0"}, // 0未清算，1已清算
    created:  { type: Date, default: Date.now }, //
    updated:  { type: Date, default: Date.now },
    status:   { type: String, default: "0" },   // 状态有效， 0未完成订单，1已完成订单
});

// 赎回订单
var Backorder = new Schema({
    userid:   { type: String, required: true }, // 关联的用户
    user:     { type: Object, required: true }, // 商品id
    orderid:  { type: String, required: true, unique: true }, // 订单号号
    product:  { type: String, required: true }, // 商品名称
    account:  { type: String, required: true }, // 赎回账号
    paytype:  { type: String,   required: true, default: "1" },   // 赎回账号类型，1支付宝 2暂定
    companyAccount:{ type: String, required: true }, // 公司支付宝账号
    tradeno:  { type: String, unique: true }, // 交易流水号凭证
    openStatus:{type: String, default: "0"}, // 0未打款，1已打款
    findate:  { type: Date, default: Date.now }, // 财务打款时间 
    created:  { type: Date, default: Date.now }, // 赎回日期
    updated:  { type: Date, default: Date.now },
    status:   { type: String, default: "0" },   // 状态有效， 0未完成订单，1已完成订单
});

// 指数型订单
var Superorder = new Schema({
    userid:   { type: String, required: true }, // 关联的用户
    orderid:  { type: String, required: true, unique: true }, // 订单号号
    pid:      { type: Object, required: true }, // 商品id
    payAmount:{ type: Number, required: true }, // 订单金额
    opendate: { type: Date                   }, // 赎回日期
    openAmount:{type: Number, default: 0}, // 预期收益
    openStatus:{type: String, default: "0"}, // 0未清算，1已清算
    created:  { type: Date, default: Date.now }, //
    updated:  { type: Date, default: Date.now },
    status:   { type: String, default: "0" },   // 状态有效， 0未完成订单，1已完成订单
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
var orderModel = mongoose.model('Order', Order);
var superorderModel = mongoose.model('Superorder', Superorder);
var logModel = mongoose.model('Log', Log);
var backorderModel = mongoose.model('backorder', Backorder);


// Export Models
exports.userModel = userModel;
exports.orderModel = orderModel;
exports.logModel = logModel;
exports.superorderModel = superorderModel;
exports.backorderModel = backorderModel;
