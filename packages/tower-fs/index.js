var fs = require('fs')
  , path = require('path');

fs.exists = fs.exists || path.exists;
fs.existsSync = fs.existsSync || path.existsSync;

exports.pathSeparator = path.sep;
exports.pathSeparatorPattern = new RegExp(exports.pathSeparator.replace(/[\/\\]/, "\\$&"));

exports.readFile = function() {
  fs.readFile.apply(fs, arguments);

  return this;
}

exports.readFileSync = function() {
  return fs.readFileSync.apply(fs, arguments);
}

exports.writeFile = exports.createFile = function(filePath, content, callback) {
  if (typeof content === 'function') {
    callback = content;
    content = '';
  }

  return fs.writeFile(filePath, content, callback);
}

exports.writeFileSync = exports.createFileSync = function(filePath, content) {
  return fs.writeFileSync(filePath, content || '');
}

exports.createDirectory = exports.mkdir = function(directoryPath, callback) {
  fs.mkdir(directoryPath, callback);

  return this;
}

exports.createDirectorySync = exports.mkdirSync = function(directoryPath) {
  if (!fs.existsSync(directoryPath))
    fs.mkdirSync(directoryPath);

  return this;
}

/**
 * TODO
 */

exports.createDirectoryRecursive = exports.mkdirp = function(directoryPath, mode, callback) {
  if (typeof mode === 'function') {
    callback = mode;
    mode = undefined;
  }

  exports._createDirectoryRecursive(exports.relativePath(directoryPath), mode, callback);

  return this;
}

exports._createDirectoryRecursive = createDirectoryRecursiveHard;

function createDirectoryRecursiveHard(directoryPath, mode, callback) {
  // this way tries to create it from the bottom up.
  // you could also create it from the top down.
  fs.mkdir(directoryPath, function(error) {
    if (error) {
      if (error.code === 'ENOENT') {
        var index = directoryPath.lastIndexOf(exports.pathSeparator);

        if (index > 0) {
          createDirectoryRecursiveHard(directoryPath.substring(0, index), mode, function(error) {
            if (error)
              callback(error)
            else
              createDirectoryRecursiveHard(directoryPath, mode, callback); // try again
          });
        } else {
            throw err;
        }
      } else if (error.code === 'EEXIST') {
        callback();
      } else {
        callback(error);
      }
    } else {
      callback();
    }
  });
}

function createDirectoryRecursiveSoft() {

}

/**
 * Recursively create directories.
 */

exports.createDirectoryRecursiveSync = exports.mkdirpRecursiveSync = function(directoryPath, mode) {
  require('wrench').mkdirSyncRecursive(directoryPath, mode);

  return this;
}

exports.copyDirectoryRecursive = function(fromPath, toPath, callback) {
  require('wrench').copyDirRecursive(fromPath, toPath, callback);

  return this;
}

exports.copyDirectoryRecursiveSync = function(fromPath, toPath, options) {
  require('wrench').copyDirSyncRecursive(fromPath, toPath, options);

  return this;
}

exports.removeDirectoryRecursive = function(directoryPath, callback) {
  require('wrench').rmdirRecursive(directoryPath, callback);

  return this;
}

exports.removeDirectoryRecursiveSync = function(directoryPath, failSilent) {
  require('wrench').rmdirSyncRecursive(directoryPath, false);

  return this;
}

/**
 * TODO
 */

exports.readDirectoryRecursive = function(directoryPath, callback) {
  exports.glob(directoryPath, callback);
}

exports.readDirectoryRecursiveSync = function(directoryPath) {
  //return exports.globSync(directoryPath);
  return require('wrench').readdirSyncRecursive(directoryPath);
}

exports.absolutePath = function(filePath) {
  return path.resolve(filePath);
}

exports.relativePath = function(filePath) {
  return path.normalize(filePath);
}

exports.exists = function(filePath) {
  fs.exists(filePath);

  return this;
}

exports.existsSync = function(filePath) {
  return fs.existsSync(filePath);
}

exports.removeDirectory = function(directoryPath) {
  fs.rmdir(directoryPath);

  return this;
}

exports.removeDirectorySync = function(directoryPath) {
  return fs.rmdirSync(directoryPath);
}

exports.removeFile = function(filePath, callback) {
  fs.unlink(filePath, callback);

  return this;
}

exports.removeFileSync = function(filePath) {
  if (fs.existsSync(filePath))
    fs.unlinkSync(filePath);

  return this;
}

exports.directoryPathsSync = function(directoryPath) {
  var entries = this.entryPathsSync(directoryPath)
    , directories = [];

  entries.forEach(function(entry) {
    if (fs.statSync(entry).isDirectory())
      directories.push(entry);
  });

  return directories;
}

exports.isFile = function(filePath, callback) {
  fs.stat(filePath, function(error, stats) {
    if (error)
      callback(error, stats);
    else
      callback(null, !stats.isDirectory());
  });

  return this;
}

exports.isFileSync = function(filePath) {
  return !fs.statSync(filePath).isDirectory();
}

exports.isDirectory = function(filePath, callback) {
  fs.stat(filePath, function(error, stats) {
    if (error)
      callback(error, stats);
    else
      callback(null, stats.isDirectory());
  });

  return this;
}

exports.isDirectorySync = function(filePath) {
  return fs.statSync(filePath).isDirectory();
}

exports.directoryNamesSync = function(directoryPath) {
  var entries = this.entryNamesSync(directoryPath)
    , directories = [];

  entries.forEach(function(entry) {
    if (fs.statSync(path.join(directoryPath, entry)).isDirectory())
      directories.push(entry);
  });

  return directories;
}

/**
 * glob("**\/*.js", options, function (error, files) {})
 * @see https://github.com/isaacs/node-glob
 */
exports.glob = function(pattern, options, callback) {
  require('glob')(pattern, options, callback);

  return this;
}

exports.globSync = function(pattern, options) {
  return require('glob').sync(pattern, options);
}

exports.filePathsSync = function(directoryPath) {
  var entries = this.entryPathsSync(directoryPath)
    , files = [];

  entries.forEach(function(entry) {
    if (!fs.statSync(entry).isDirectory())
      files.push(entry);
  });

  return files;
}

exports.entryNamesSync = function(directoryPath) {
  return fs.readdirSync(directoryPath);
}

exports.entryPathsSync = function(directoryPath) {
  return exports.entryNamesSync(directoryPath).map(function(filePath) {
    return path.join(directoryPath, filePath);
  });
}

exports.chmod = function(filePath, chmod, callback) {
  fs.chmod(filePath, chmod, callback);

  return this;
}

exports.chmodSync = function(filePath, chmod) {
  fs.chmodSync(filePath, chmod);
  return this;
}

exports.copyFile = function(fromPath, toPath, callback) {
  fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath).on('close', callback));
}

exports.copyFileSync = function(fromPath, toPath) {
  exports.createFileSync(toPath, exports.readFileSync(fromPath));
}

exports.join = function() {
  return path.join.apply(path, arguments);
}

/**
 * fileDigest(path, {algorithm: md5 (default), sha1, sha256}, callback)
 */
exports.fileDigest = function(filePath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var crypto = require('crypto')
    , algorithm = options.algorithm || 'md5'
    , checksum = crypto.createHash(algorithm)
    , stream = fs.createReadStream(filePath)
    , _this = this;

  stream.on('data', function(data) {
    checksum.update(data);
  });

  stream.on('end', function() {
    callback.call(_this, null, checksum.digest('hex'));
  });

  return this;
}

/**
 * TODO
 */
exports.eachLine = function(filePath, callback) {

}

exports.pathWithDigest = function(digest, filePath, ext) {
  var dirname = exports.dirname(filePath)
    , basename = exports.basename(filePath, ext);

  return path.join(dirname, basename + '-' + digest + ext);
}

exports.pathWithoutDigest = function(filePath, ext) {
  var dirname = exports.dirname(filePath)
    , basename = exports.basename(filePath, ext);

  return path.join(dirname, basename.replace(/-[a-fA-F\d]{32}$/, '') + ext);
}

exports.dirname = function(filePath) {
  return path.dirname(filePath);
}

exports.basename = function(filePath, ext) {
  return path.basename.apply(path, arguments);
}

exports.watch = function(pattern, callback) {
  return require('gaze')(pattern, callback);
}

exports.stat = function() {
  fs.stat.apply(fs, arguments);
  return this;
}

exports.statSync = function() {
  return fs.statSync.apply(fs, arguments);
}

exports.createReadStream = function() {
  return fs.createReadStream.apply(fs, arguments);
}

exports.createWriteStream = function() {
  return fs.createWriteStream.apply(fs, arguments);
}

exports.downloadFile = function(fromUrl, toPath, callback) {
  var file = fs.createWriteStream(toPath);
  
  require(fromUrl.match(/^(https?)/)[1]).get(fromUrl, function(response) {
    response.on('end', callback);
    response.pipe(file);
  }).on('error', callback);

  return this;
}

// TODO
/*
exports.linkFile
exports.prependToFile
exports.appendToFile = exports.appendFile
*/