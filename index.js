"use strict";

var util          = require('util');
var EventEmitter  = require('events').EventEmitter;
var CronJob       = require('cron').CronJob;
var fs            = require('fs');
var pathUtil      = require('path');

var defaultOptions = {
  start: false,
  timeZone: undefined,
  recursive: false,
  timeFiled: 'atime'
};

var FileCleaner = function (path, maxAge, cronTime, options) {

  this.job = null;
  this.path = path;
  this.maxAge = maxAge;
  this.cronTime = cronTime;
  this.options = defaultOptions;
  if(typeof options === 'object' && options !== null){
    this.options = util._extend(this.options, options);
  }

  if(this.options.start === true){
    this.start();
  }

};

util.inherits(FileCleaner, EventEmitter);

FileCleaner.prototype.start = function(){
  this.job = new CronJob(
    this.cronTime,
    this.cleanUp,
    function(){},
    true,
    this.options.timeZone,
    this
  );

  this.emit('start', {
    path: this.path,
    cronTime: this.cronTime,
    maxAge: this.maxAge
  });
};

FileCleaner.prototype.stop = function(){
  this.job.stop();

  this.emit('stop', {
    path: this.path,
    cronTime: this.cronTime,
    maxAge: this.maxAge
  });
};

FileCleaner.prototype.cleanUp = function(){

  var self      = this;
  var maxAge    = this.maxAge;
  var recursive = this.options.recursive;
  var timeFiled = this.options.timeFiled;

  function worker(path) {
    fs.readdir(path, function (err, files) {
      if (err) {
        self.emit('error', new Error("Can't read directory " + path));
        return;
      }
      files.forEach(function (file) {
        var filePath = pathUtil.join(path, file);
        fs.stat(filePath, function (err, stats) {
          if (err) {
            self.emit('error', new Error("Can't read file " + filePath));
            return;
          }
          if (stats.isFile() && (Date.now() - stats[timeFiled].getTime()) > maxAge) {
            fs.unlink(filePath, function (err) {
              if (err) {
                self.emit('error', new Error("Can't delete " + path));
                return;
              }
              self.emit('delete',{
                name: file,
                folder: path,
                path: filePath
              });
            });
          } else if (stats.isDirectory() && recursive) {
            worker(filePath);
          }
        });
      });
    });
  }

  worker(this.path);

};


module.exports.FileCleaner = FileCleaner;
module.exports.CronJob     = CronJob;