// natrium test
// license : MIT
// author : Sean Chen

const argvs = process.argv.slice(2);
const directory = process.cwd();

console.log(argvs);
console.log(directory);

const execSync = require('child_process').execSync;

const arg = argvs[0] || ''; 

execSync('npx ts-node ./test/unittest/' + arg, {stdio:[0, 1, 2]});