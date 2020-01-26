#!/usr/bin/env node

const colors = require('colors');
const Program = require('./program');

const newProgram = new Program();

(async () => {
  try {
    await newProgram.run();
    process.exit();
  } catch (err) {
    const errorMsg = 'Unable to continue operation. Terminating program...';
    console.log(colors.red(errorMsg), colors.red(err));
    process.exit(1);
  }
})();
