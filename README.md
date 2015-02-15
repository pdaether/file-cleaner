# cron-file-cleaner

cron-file-cleaner is a nodejs module for removing old files periodically.

[![Build Status](https://travis-ci.org/pdaether/file-cleaner.svg?branch=master)](https://travis-ci.org/pdaether/file-cleaner)
[![Coverage Status](https://coveralls.io/repos/pdaether/file-cleaner/badge.svg)](https://coveralls.io/r/pdaether/file-cleaner)
[![Code Climate](https://codeclimate.com/github/pdaether/file-cleaner/badges/gpa.svg)](https://codeclimate.com/github/pdaether/file-cleaner)
[![Dependency Status](https://gemnasium.com/pdaether/file-cleaner.svg)](https://gemnasium.com/pdaether/file-cleaner)

## Install

```
npm install cron-file-cleaner
```

## Usage

```
var FileCleaner = require('cron-file-cleaner').FileCleaner;

var sessionWatcher = new FileCleaner(__dirname + '/files/', 15 * 60 * 1000,  '*/15 * * * * *', {
  start: true
});
```

## Full example

```
var FileCleaner = require('cron-file-cleaner').FileCleaner;

var sessionWatcher = new FileCleaner(__dirname + '/session_files/', 60 * 60 * 1000,  '00 */15 * * * *', {
  recursive: true,
  timeFiled: 'ctime'
});

sessionWatcher.on('delete', function(file){
  console.log('DELETE');
  console.log(file.name);
  console.log(file.folder);
  console.log(file.path);
});

sessionWatcher.on('error', function(err){
  console.log('ERROR');
  console.error(err);
});

sessionWatcher.on('stop', function(info){
  console.log('STOP');
  console.log(info.path);
  console.log(info.cronTime);
});

sessionWatcher.on('start', function(info){
  console.log('START');
  console.log(info.path);
  console.log(info.cronTime);
});

sessionWatcher.start();
```

## Tests

```
npm test
```

## Coverage

```
npm run coverage
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add tests for any new or changed functionality. Lint and test your code.

## License

MIT