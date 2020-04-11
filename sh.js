var crypto = require('crypto')
var fs = require('fs')

//读取一个Buffer
// var buffer = fs.readFileSync('./archives/phpMyAdmin-5.0.2-all-languages.zip')
var buffer = fs.readFileSync('./archives/php-7.4.4-Win32-vc15-x64.zip')

var code = crypto.createHash('sha256').update(buffer).digest('hex')
console.log('文件的MD5是：%s', code)
