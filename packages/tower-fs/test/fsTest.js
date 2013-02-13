var tfs = require('..')
  , chai = require('chai')
  , assert = chai.assert;

describe('cs-fs', function() {
  test('createFile', function(done) {
    tfs.createFile('tmp/file.txt', 'asdf', function(error) {
      assert.isTrue(!error);
      assert.isTrue(tfs.existsSync('tmp/file.txt'));

      done();
    });
  });

  test('removeFile', function(done) {
    tfs.removeFile('tmp/file.txt', function(error) {
      assert.isTrue(!error);

      done();
    });
  });

  test('create/remove directory recursively', function(done) {
    assert.isFalse(tfs.existsSync('tmp/a/b/c/d'), 'directory should not exist to start');

    tfs.createDirectoryRecursive('tmp/a/b/c/d', function() {
      assert.isTrue(tfs.existsSync('tmp/a/b/c/d'), 'directory should exist');

      tfs.removeDirectoryRecursive('tmp/a', function() {
        assert.isFalse(tfs.existsSync('tmp/a'), 'after removing directory should not exist');

        tfs.createDirectoryRecursiveSync('tmp/a/b/c/d');
        assert.isTrue(tfs.existsSync('tmp/a/b/c/d'), 'directory should exist (sync)');
        tfs.removeDirectoryRecursiveSync('tmp/a');
        assert.isFalse(tfs.existsSync('tmp/a'), 'directory should not exist (sync)');

        done();
      });
    });
  });

  test('fileDigest', function(done) {
    var filePath = tfs.absolutePath('./test/mocha.opts');

    tfs.fileDigest(filePath, function(error, digest) {
      assert.equal('4147caa7ca6a88a3cd51c235719cc923', digest);

      var pathWithDigest = tfs.pathWithDigest(digest, filePath, '.opts');
      assert.equal(tfs.basename(pathWithDigest), 'mocha-' + digest + '.opts');

      var pathWithoutDigest = tfs.pathWithoutDigest(pathWithDigest, '.opts');
      assert.equal(tfs.basename(pathWithoutDigest), 'mocha.opts');

      done()
    });
  });

  test('is file or directory', function(done) {
    tfs.isFile('./test/mocha.opts', function(error, success) {
      assert.isTrue(success);
      assert.isTrue(tfs.isFileSync('./test/mocha.opts'));

      tfs.isFile('./test', function(error, success) {
        assert.isFalse(success);
        assert.isFalse(tfs.isFileSync('./test'));

        tfs.isDirectory('./test', function(error, success) {
          assert.isTrue(success);
          assert.isTrue(tfs.isDirectorySync('./test'));

          tfs.isDirectory('./test/mocha.opts', function(error, success) {
            assert.isFalse(success);
            assert.isFalse(tfs.isDirectorySync('./test/mocha.opts'));

            done();
          });
        });
      });
    });
  });

  test('glob', function(done) {
    tfs.glob('./test/*.js', function(error, files) {
      assert.equal(2, files.length);
      assert.equal('./test/client.js', files[0]);
      assert.equal('./test/serverTest.js', files[1]);

      files = tfs.globSync('./test/*.js');
      assert.equal(2, files.length);
      assert.equal('./test/client.js', files[0]);
      assert.equal('./test/serverTest.js', files[1]);

      done();
    });
  });

  test('watcher', function(done) {
    var startTime = (new Date).getTime();

    if (tfs.existsSync('tmp/3.js')) tfs.removeFileSync('tmp/3.js');

    tfs.createFileSync('./tmp/1.js');
    tfs.createFileSync('./tmp/2.js');
    tfs.createFileSync('./tmp/1.txt');
    tfs.createFileSync('./tmp/2.txt');

    // IMPORTANT: ./tmp/*.js is different than tmp/*.js
    tfs.watch('tmp/*.js', function(error, watcher) {
      var files = watcher.relative()['tmp/'];

      var changedPath, addedPath, deletedPath;

      assert.equal(2, files.length);
      assert.equal('1.js', files[0]);
      assert.equal('2.js', files[1]);

      watcher.on('changed', function(filePath) {
        // console.log('changed', filePath);
        changedPath = filePath;
      });

      watcher.on('added', function(filePath) {
        // console.log('added', filePath);
        addedPath = filePath;
      });

      watcher.on('deleted', function(filePath) {
        // console.log('deleted', filePath);
        deletedPath = filePath;
      });

      // On changed/added/deleted
      watcher.on('all', function(event, filePath) {
        // console.log(filePath + ' was ' + event);
      });

      // var endTime = (new Date).getTime();
      // this is taking ~145ms but that's b/c gaze is running this
      // on setTimeout with a delay of 10 + 100 == 110 ms,
      // so it's non-blocking.
      // console.log((endTime - startTime) + 'ms');

      tfs.createFile('tmp/3.js', function() {
        setTimeout(function() {
          assert.equal(addedPath, tfs.absolutePath('tmp/3.js'));

          tfs.writeFile('tmp/3.js', 'asdf', function() {
            setTimeout(function() {
              assert.equal(changedPath, tfs.absolutePath('tmp/3.js'));

              tfs.removeFile('tmp/3.js', function() {
                setTimeout(function() {
                  assert.equal(deletedPath, tfs.absolutePath('tmp/3.js'));

                  done();
                }, 500);
              });
            }, 500)
          });
        }, 500)
      });
      //tfs.removeFileSync('./tmp/file.txt');
    });
  });

  test('download file', function(done) {
    tfs.removeFileSync('tmp/README_DOWNLOAD.md');

    tfs.downloadFile('https://raw.github.com/viatropos/tfs/master/README.md', 'tmp/README_DOWNLOAD.md', function(error) {
      assert.isTrue(tfs.existsSync('tmp/README_DOWNLOAD.md'));

      done();
    });
  });
});
