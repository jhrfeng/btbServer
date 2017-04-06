var co = require('co');
var OSS = require('ali-oss');
var fs = require('fs');

var client = new OSS({
  region:'oss-cn-shanghai',
  accessKeyId: 'LTAIQPDVc8QAyZ9A',
  accessKeySecret: 'Dosawap8iXK7yc2mLJev5qcpctKbmV',
  bucket: 'goldapp'
});

// 处理base64为图片
function base64_decode(base64str, file) {
  var bitmap = new Buffer(base64str, 'base64');
  fs.writeFileSync(file, bitmap);
}

exports.uploadFile = function(base64str, file, callback){
  //上传文件
  co(function* () {
    client.useBucket('goldapp');
    var result = yield client.put(file, file);
    console.log(result);
    callback(result.url)
    fs.unlinkSync(file)
  }).catch(function (err) {
    console.log(err);
  });

}

// buffer 上传图片
// co(function* () {
//   var result = yield client.put('100', new Buffer(base64, 'base64'));
//   console.log(result);
// }).catch(function (err) {
//   console.log(err);
// });



// 删除文件
// co(function* () {
//   var result = yield client.delete('200');
//   console.log(result);
// }).catch(function (err) {
//   console.log(err);
// });