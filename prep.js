var fs = require('fs-extra');

try {
  fs.copySync('dist/prod', 'server/dist');
  console.log("client build copied to server, ready for deploy!");
} catch (err) {
  console.error(err);
}
