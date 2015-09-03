# cron-file-cleaner

_cron-file-cleaner_ is a nodejs module for removing old files periodically.

[![Build Status](https://travis-ci.org/pdaether/file-cleaner.svg?branch=master)](https://travis-ci.org/pdaether/file-cleaner)
[![Coverage Status](https://coveralls.io/repos/pdaether/file-cleaner/badge.svg)](https://coveralls.io/r/pdaether/file-cleaner)
[![Code Climate](https://codeclimate.com/github/pdaether/file-cleaner/badges/gpa.svg)](https://codeclimate.com/github/pdaether/file-cleaner)
[![Dependency Status](https://gemnasium.com/pdaether/file-cleaner.svg)](https://gemnasium.com/pdaether/file-cleaner)

## Install

```bash
npm install cron-file-cleaner
```

## Basic example

A basic example can look like this:

```node
var FileCleaner = require('cron-file-cleaner').FileCleaner;

var fileWatcher = new FileCleaner('/path/to/folder/', 600000,  '00 */15 * * * *', {
  start: true
});
```

This would scan the directory `/path/to/folder/` every 15 minutes and deletes every
containing file that is older than 10 minutes (= 600000 milliseconds).

## Usage

_cron-file-cleaner_ scans a given folder periodically and deletes all files that are older than the given threshold.
The interval for scanning the folder can be set with a crontab syntax.

```node
var FileCleaner = require('cron-file-cleaner').FileCleaner;

var fileWatcher = new FileCleaner(path, threshold, interval, options);
```

The parameters are:

- `path`: The full path to the folder to watch [REQUIRED]
- `threshold`: Threshold in milliseconds. Every file that is older will be deleted [REQUIRED]
- `interval`: The interval for scanning the folder given in a crontab syntax, e.g. '* 00 * * * *' [REQUIRED]
- `options`: A JSON object with additional options. [OPTIONAL]

The options object can have the following attributes:

- `start`: Boolean, default is `false`. In that case you must use `fileWatcher.start()`
- `recursive`: Boolean, default is `false`. If true it scans the folder recursively.
- `timeField`: Which time field of the files should be considered. Default 'atime', can be 'atime', 'ctime, or 'mtime'.
- `timeZone`: Timezone to use, default is undefined, e.g. 'America/Los_Angeles'.
- `blackList`: A RegEx for excluding files, default is undefined, e.g. `/\.gitkeep/`
- `whiteList`: A RegEx for including only the files with a matching name, default is undefined, e.g. `/.*\.log/`

### Methods

If you don't set the option `start` to `true`, you need to start the process explicitly with

```node
fileWatcher.start();
```

To stop the process, just run

```node
fileWatcher.stop();
```

If you want to start a scan immediately ignoring the given interval you can run

```node
fileWatcher.cleanUp();
```

### Events

You can listen to the following events (see full example above):

- `start`: Will be triggered on starting the process
- `stop`: Will be triggered on stopping the process
- `delete`: Will be triggered on deleting a file
- `error`: Will be triggered if an error occurs


## Full example

```node
var FileCleaner = require('cron-file-cleaner').FileCleaner;

var tmpWatcher = new FileCleaner(__dirname + '/tmp_files/', 60 * 60 * 1000,  '00 */15 * * * *', {
  recursive: true,
  timeField: 'ctime'
});

tmpWatcher.on('delete', function(file){
  console.log('DELETE');
  console.log(file.name); //Name of the file
  console.log(file.folder); //folder path
  console.log(file.path); //Full path of the file
});

tmpWatcher.on('error', function(err){
  console.log('ERROR');
  console.error(err);
});

tmpWatcher.on('stop', function(info){
  console.log('STOP');
  console.log(info.path);
  console.log(info.cronTime);
});

tmpWatcher.on('start', function(info){
  console.log('START');
  console.log(info.path);
  console.log(info.cronTime);
});

tmpWatcher.start();
```

## Tests

```bash
npm test
```

## Coverage

```bash
npm run coverage
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add tests for any new or changed functionality. Lint and test your code.

## License

MIT