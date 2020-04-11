const os = require('os')
const fs = require('fs-extra')
const decompress = require('decompress')

async function postinstall () {
  if (!(await fs.exists('./php'))) {
    if (os.platform() === 'win32') {
      await decompress('./archives/php-7.4.4-Win32-vc15-x64.zip', './php')
    } else {
      await decompress('./archives/php-7.4.4.tar.gz', './node_modules/.cache')
      await fs.move('./node_modules/.cache/php-7.4.4', './php')
    }
    await fs.copyFile('./conf/php.ini', './php/php.ini')
  }

  if (!(await fs.exists('./phpMyAdmin'))) {
    await decompress('./archives/phpMyAdmin-5.0.2-all-languages.zip', './node_modules/.cache')
    await fs.move('./node_modules/.cache/phpMyAdmin-5.0.2-all-languages', './phpMyAdmin')
    await fs.copyFile('./conf/config.default.php', './phpMyAdmin/libraries/config.default.php')
  }
}

// postinstall()
// phpMyAdmin = 'https://files.phpmyadmin.net/phpMyAdmin/5.0.2/phpMyAdmin-5.0.2-all-languages.zip'
