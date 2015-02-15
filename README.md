# file-cleaner

file-cleaner is a nodejs module for removing old files periodically.

## Install

```
npm install file-cleaner
```

## Usage

```
var FileCleaner = require('file-cleaner').FileCleaner;

var sessionWatcher = new FileCleaner(__dirname + '/files/', 15 * 60 * 1000,  '*/15 * * * * *', {
  start: true
});
```

## Full example

```
var FileCleaner = require('file-cleaner').FileCleaner;

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