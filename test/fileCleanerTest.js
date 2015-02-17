var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

var FileCleaner = require('../index.js').FileCleaner;

var mock = require('mock-fs');

var times = {
  sec: 1000,
  min: 60000, // 60 * 1000
  min15: 900000, // 15 * 60 * 1000
  hour: 3600000 // 60 * 60 * 1000
}


describe('Testing the cleanup function', function () {

  beforeEach(function() {
    mock({
      'fake/path/to/dir/': {
        newFile: mock.file({
          atime: new Date(Date.now() - times.min)
        }),
        oldFile: mock.file({
          atime: new Date(Date.now() - times.hour)
        }),
        oldUnreadableFile: mock.file({
          atime: new Date(Date.now() - times.hour),
          mode: 0200,
          uid: 4711,
          gid: 4712
        }),
        gitignore: mock.file({
          atime: new Date(Date.now() - times.hour)
        }),
        subfolder: {
          newFile: mock.file({
            atime: new Date(Date.now() - times.min)
          }),
          oldFile: mock.file({
            atime: new Date(Date.now() - times.hour)
          })
        }
      },
      'path/to/unreadable/dir': mock.directory({
        mode: 0000,
        uid: 4711,
        gid: 4712
      })
    });
  });

  afterEach(mock.restore);

  it('It should not remove a new file', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false
    });
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/newFile')).to.be.true;
      done();
    }, 100);
  });


  it('It should remove an old file', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false
    });
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/oldFile')).to.be.false;
      done();
    }, 500);
  });

  it('It should emit the delete event', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false
    });

    cleaner.on('delete', function(file){
      if(file.name === 'oldFile'){
        done();
      }
    });

    cleaner.cleanUp();
  });

  it('It should emit the start event', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false
    });

    cleaner.on('start', function(info){
      expect(info).to.be.an('object');
      expect(info).to.have.all.keys('path', 'cronTime', 'maxAge');
      done();
    });

    cleaner.start();
  });

  it('It should emit the stop event', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false
    });

    cleaner.on('stop', function(info){
      expect(info).to.be.an('object');
      expect(info).to.have.all.keys('path', 'cronTime', 'maxAge');
      done();
    });

    cleaner.start();
    cleaner.stop();
  });


  it('It should start automatically if start is true', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '* * * * * *', {
      start: true
    });

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/oldFile')).to.be.false;
      done();
      cleaner.stop();
    }, 1500);

  });

  it('Omitting the options should be fine', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *');
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/newFile')).to.be.true;
      expect(fs.existsSync('fake/path/to/dir/oldFile')).to.be.false;
      done();
    }, 100);
  });

  it('Working recursive should work fine', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false,
      recursive: true
    });
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/subfolder/newFile')).to.be.true;
      expect(fs.existsSync('fake/path/to/dir/subfolder/oldFile')).to.be.false;
      done();
    }, 100);
  });

  it('If recursive is false, ignore subfolders', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false,
      recursive: false
    });
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/newFile')).to.be.true;
      expect(fs.existsSync('fake/path/to/dir/oldFile')).to.be.false;
      expect(fs.existsSync('fake/path/to/dir/gitignore')).to.be.false;
      expect(fs.existsSync('fake/path/to/dir/subfolder/newFile')).to.be.true;
      expect(fs.existsSync('fake/path/to/dir/subfolder/oldFile')).to.be.true;
      done();
    }, 100);
  });

  it('It should respect a given blacklist', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false,
      blackList: /gitignore/
    });
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/oldFile')).to.be.false;
      expect(fs.existsSync('fake/path/to/dir/gitignore')).to.be.true;
      done();
      delete cleaner;
    }, 100);
  });

  it('It should respect a given whitelist', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '*/15 * * * * *', {
      start: false,
      whiteList: /gitignore/
    });
    cleaner.cleanUp();

    setTimeout(function(){
      expect(fs.existsSync('fake/path/to/dir/oldFile')).to.be.true;
      expect(fs.existsSync('fake/path/to/dir/gitignore')).to.be.false;
      done();
    }, 100);
  });

  xit('It should emit an error if a file could not be deleted', function (done) {
    var cleaner = new FileCleaner('fake/path/to/dir/', times.min15,  '15 * * * * *', {
      start: false
    });

    cleaner.on('error', function(err){
      console.log('ERROR');
      console.error(err);
      done();
    });

    cleaner.cleanUp();
  });


  it('It should emit an error if the dir is not readable', function (done) {
    var cleaner = new FileCleaner('unknown/path', times.min15,  '*/15 * * * * *', {
      start: false
    });

    cleaner.on('error', function(err){
      expect(err.toString()).to.be.equal("Error: Can't read directory unknown/path");
      done();
    });

    cleaner.cleanUp();
  });

});
