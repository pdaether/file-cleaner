"use strict";

var util          = require('util');
var EventEmitter  = require('events').EventEmitter;
var CronJob       = require('cron').CronJob;
var fs            = require('fs');
var pathUtil      = require('path');

/**
 * Shorthand for common intervalls, so you don't need to work with milliseconds
 * @type {{sec: number, min: number, min15: number, hour: number, day: number}}
 */
var times = {
  sec:   1000,
  min:   60000, // 60 * 1000
  min15: 900000, // 15 * 60 * 1000
  hour:  3600000, // 60 * 60 * 1000
  day:   86400000 // 24 * 60 * 60 * 1000
};

/**
 * The default options for FileCleaner.
 * @type {{}}
 */
var defaultOptions = {
  start: false,
  timeZone: undefined,
  recursive: false,
  timeField: 'atime',
  blackList: undefined,
  whiteList: undefined
};

/**
 * Constructor function, takes the following paramters:
 *
 * @param string path - Filepath to the folder to watch
 * @param integer maxAge - value in milliseconds
 * @param string cronTime - Crontab like string
 * @param object options - Object with additional options
 * @constructor
 */
var FileCleaner = function (path, maxAge, cronTime, options) {

  this.job = null;
  this.path = path;
  this.maxAge = maxAge;
  this.cronTime = cronTime;
  this.options = util._extend({}, defaultOptions);
  if(typeof options === 'object' && options !== null){
    this.options = util._extend(this.options, options);
  }

  if(this.options.start === true){
    this.start();
  }

};

//We need to emit events:
util.inherits(FileCleaner, EventEmitter);

/**
 * Starts to wach the given path.
 * Will emit the event 'start'.
 */
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

/**
 * Stops watching the given path.
 * Will emit the event 'stop'.
 */
FileCleaner.prototype.stop = function(){
  this.job.stop();

  this.emit('stop', {
    path: this.path,
    cronTime: this.cronTime,
    maxAge: this.maxAge
  });
};


/**
 * Will cleanup the given path and will
 * remove all files that are older than maxAge.
 *
 * Emits the event 'delete' if a file will be deleted.
 */
FileCleaner.prototype.cleanUp = function(){

  var self      = this;
  var maxAge    = this.maxAge;
  var recursive = this.options.recursive;
  var timeField = this.options.timeField;
  var blackList = this.options.blackList;
  var whiteList = this.options.whiteList;

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
          if (
            stats.isFile() &&
            (Date.now() - stats[timeField].getTime()) > maxAge &&
            checkPattern(file, blackList, whiteList)
          ) {
            fs.unlink(filePath, function (err) {
              if (err) {
                self.emit('error', new Error("Can't delete " + filePath));
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

/**
 * Helper functions
 */

/**
 * Checks blackList- and whitList-regex against
 * the given file name and returns if this file can
 * be deleted.
 *
 * @param string file - the gile name
 * @param regex|undefined blackList
 * @param regex|undefined - whiteList
 * @returns {boolean}
 */
function checkPattern(file, blackList, whiteList){

  if (util.isRegExp(blackList) && blackList.test(file)) {
    return false;
  }

  if (util.isRegExp(whiteList)) {
    if (whiteList.test(file)) {
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Exports:
 */

module.exports.FileCleaner = FileCleaner;
module.exports.CronJob     = CronJob;
module.exports.times       = times;