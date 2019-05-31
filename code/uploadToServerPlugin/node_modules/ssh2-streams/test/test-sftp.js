var SFTPStream = require('../lib/sftp'),
    Stats = SFTPStream.Stats,
    STATUS_CODE = SFTPStream.STATUS_CODE,
    OPEN_MODE = SFTPStream.OPEN_MODE;

var constants = require('constants'),
    basename = require('path').basename,
    inspect = require('util').inspect,
    assert = require('assert');

var group = basename(__filename, '.js') + '/',
    t = -1;

var tests = [
// successful client requests
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/tmp/foo.txt',
            handle_ = new Buffer('node.js');
        server.on('OPEN', function(id, path, pflags, attrs) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          assert(pflags === (OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE),
                 makeMsg(what, 'Wrong flags: ' + flagsToHuman(pflags)));
          server.handle(id, handle_);
          server.end();
        });
        client.open(path_, 'w', function(err, handle) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected open() error: ' + err));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
        });
      };
    },
    what: 'open'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js');
        server.on('CLOSE', function(id, handle) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.close(handle_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected close() error: ' + err));
        });
      };
    },
    what: 'close'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            expected = new Buffer('node.jsnode.jsnode.jsnode.jsnode.jsnode.js'),
            buffer = new Buffer(expected.length);
        buffer.fill(0);
        server.on('READ', function(id, handle, offset, len) {
          assert(++self.state.requests <= 2,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          assert(offset === 5, makeMsg(what, 'Wrong read offset: ' + offset));
          assert(len === buffer.length, makeMsg(what, 'Wrong read len: ' + len));
          server.data(id, expected);
          server.end();
        });
        client.readData(handle_, buffer, 0, buffer.length, 5, clientReadCb);
        function clientReadCb(err, code) {
          assert(++self.state.responses <= 2,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected readData() error: ' + err));
          assert.deepEqual(buffer,
                           expected,
                           makeMsg(what, 'read data mismatch'));
        }
      };
    },
    what: 'readData'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            buf = new Buffer('node.jsnode.jsnode.jsnode.jsnode.jsnode.js');
        server.on('WRITE', function(id, handle, offset, data) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          assert(offset === 5, makeMsg(what, 'Wrong write offset: ' + offset));
          assert.deepEqual(data, buf, makeMsg(what, 'write data mismatch'));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.writeData(handle_, buf, 0, buf.length, 5, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected writeData() error: ' + err));
        });
      };
    },
    what: 'write'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz',
            attrs_ = new Stats({
              size: 10 * 1024,
              uid: 9001,
              gid: 9001,
              atime: (Date.now() / 1000) | 0,
              mtime: (Date.now() / 1000) | 0
            });
        server.on('LSTAT', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.attrs(id, attrs_);
          server.end();
        });
        client.lstat(path_, function(err, attrs) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected lstat() error: ' + err));
          assert.deepEqual(attrs, attrs_, makeMsg(what, 'attrs mismatch'));
        });
      };
    },
    what: 'lstat'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            attrs_ = new Stats({
              size: 10 * 1024,
              uid: 9001,
              gid: 9001,
              atime: (Date.now() / 1000) | 0,
              mtime: (Date.now() / 1000) | 0
            });
        server.on('FSTAT', function(id, handle) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.attrs(id, attrs_);
          server.end();
        });
        client.fstat(handle_, function(err, attrs) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected fstat() error: ' + err));
          assert.deepEqual(attrs, attrs_, makeMsg(what, 'attrs mismatch'));
        });
      };
    },
    what: 'fstat'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz',
            attrs_ = new Stats({
              uid: 9001,
              gid: 9001,
              atime: (Date.now() / 1000) | 0,
              mtime: (Date.now() / 1000) | 0
            });
        server.on('SETSTAT', function(id, path, attrs) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          assert.deepEqual(attrs, attrs_, makeMsg(what, 'attrs mismatch'));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.setstat(path_, attrs_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected setstat() error: ' + err));
        });
      };
    },
    what: 'setstat'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            attrs_ = new Stats({
              uid: 9001,
              gid: 9001,
              atime: (Date.now() / 1000) | 0,
              mtime: (Date.now() / 1000) | 0
            });
        server.on('FSETSTAT', function(id, handle, attrs) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          assert.deepEqual(attrs, attrs_, makeMsg(what, 'attrs mismatch'));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.fsetstat(handle_, attrs_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected fsetstat() error: ' + err));
        });
      };
    },
    what: 'fsetstat'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            path_ = '/tmp';
        server.on('OPENDIR', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.handle(id, handle_);
          server.end();
        });
        client.opendir(path_, function(err, handle) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected opendir() error: ' + err));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
        });
      };
    },
    what: 'opendir'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            list_ = [
              { filename: '.',
                longname: 'drwxr-xr-x  56 nodejs   nodejs      4096 Nov 10 01:05 .',
                attrs: new Stats({
                  mode: 0755 | constants.S_IFDIR,
                  size: 4096,
                  uid: 9001,
                  gid: 8001,
                  atime: 1415599549,
                  mtime: 1415599590
                })
              },
              { filename: '..',
                longname: 'drwxr-xr-x   4 root     root        4096 May 16  2013 ..',
                attrs: new Stats({
                  mode: 0755 | constants.S_IFDIR,
                  size: 4096,
                  uid: 0,
                  gid: 0,
                  atime: 1368729954,
                  mtime: 1368729999
                })
              },
              { filename: 'foo',
                longname: 'drwxrwxrwx   2 nodejs   nodejs      4096 Mar  8  2009 foo',
                attrs: new Stats({
                  mode: 0777 | constants.S_IFDIR,
                  size: 4096,
                  uid: 9001,
                  gid: 8001,
                  atime: 1368729954,
                  mtime: 1368729999
                })
              },
              { filename: 'bar',
                longname: '-rw-r--r--   1 nodejs   nodejs 513901992 Dec  4  2009 bar',
                attrs: new Stats({
                  mode: 0644 | constants.S_IFREG,
                  size: 513901992,
                  uid: 9001,
                  gid: 8001,
                  atime: 1259972199,
                  mtime: 1259972199
                })
              }
            ];
        server.on('READDIR', function(id, handle) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.name(id, list_);
          server.end();
        });
        client.readdir(handle_, function(err, list) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected readdir() error: ' + err));
          assert.deepEqual(list,
                           list_.slice(2),
                           makeMsg(what, 'dir list mismatch'));
        });
      };
    },
    what: 'readdir'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js'),
            list_ = [
              { filename: '.',
                longname: 'drwxr-xr-x  56 nodejs   nodejs      4096 Nov 10 01:05 .',
                attrs: new Stats({
                  mode: 0755 | constants.S_IFDIR,
                  size: 4096,
                  uid: 9001,
                  gid: 8001,
                  atime: 1415599549,
                  mtime: 1415599590
                })
              },
              { filename: '..',
                longname: 'drwxr-xr-x   4 root     root        4096 May 16  2013 ..',
                attrs: new Stats({
                  mode: 0755 | constants.S_IFDIR,
                  size: 4096,
                  uid: 0,
                  gid: 0,
                  atime: 1368729954,
                  mtime: 1368729999
                })
              },
              { filename: 'foo',
                longname: 'drwxrwxrwx   2 nodejs   nodejs      4096 Mar  8  2009 foo',
                attrs: new Stats({
                  mode: 0777 | constants.S_IFDIR,
                  size: 4096,
                  uid: 9001,
                  gid: 8001,
                  atime: 1368729954,
                  mtime: 1368729999
                })
              },
              { filename: 'bar',
                longname: '-rw-r--r--   1 nodejs   nodejs 513901992 Dec  4  2009 bar',
                attrs: new Stats({
                  mode: 0644 | constants.S_IFREG,
                  size: 513901992,
                  uid: 9001,
                  gid: 8001,
                  atime: 1259972199,
                  mtime: 1259972199
                })
              }
            ];
        server.on('READDIR', function(id, handle) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.name(id, list_);
          server.end();
        });
        client.readdir(handle_, { full: true }, function(err, list) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected readdir() error: ' + err));
          assert.deepEqual(list, list_, makeMsg(what, 'dir list mismatch'));
        });
      };
    },
    what: 'readdir (full)'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz';
        server.on('REMOVE', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.unlink(path_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected unlink() error: ' + err));
        });
      };
    },
    what: 'remove'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz';
        server.on('MKDIR', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.mkdir(path_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected mkdir() error: ' + err));
        });
      };
    },
    what: 'mkdir'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz';
        server.on('RMDIR', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.rmdir(path_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected rmdir() error: ' + err));
        });
      };
    },
    what: 'rmdir'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz',
            name_ = { filename: '/tmp/foo' };
        server.on('REALPATH', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.name(id, name_);
          server.end();
        });
        client.realpath(path_, function(err, name) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected realpath() error: ' + err));
          assert.deepEqual(name, name_.filename, makeMsg(what, 'name mismatch'));
        });
      };
    },
    what: 'realpath'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/foo/bar/baz',
            attrs_ = new Stats({
              size: 10 * 1024,
              uid: 9001,
              gid: 9001,
              atime: (Date.now() / 1000) | 0,
              mtime: (Date.now() / 1000) | 0
            });
        server.on('STAT', function(id, path) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          server.attrs(id, attrs_);
          server.end();
        });
        client.stat(path_, function(err, attrs) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected stat() error: ' + err));
          assert.deepEqual(attrs, attrs_, makeMsg(what, 'attrs mismatch'));
        });
      };
    },
    what: 'stat'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var oldPath_ = '/foo/bar/baz',
            newPath_ = '/tmp/foo';
        server.on('RENAME', function(id, oldPath, newPath) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(oldPath === oldPath_,
                 makeMsg(what, 'Wrong old path: ' + oldPath));
          assert(newPath === newPath_,
                 makeMsg(what, 'Wrong new path: ' + newPath));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.rename(oldPath_, newPath_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected rename() error: ' + err));
        });
      };
    },
    what: 'rename'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var linkPath_ = '/foo/bar/baz',
            name = { filename: '/tmp/foo' };
        server.on('READLINK', function(id, linkPath) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(linkPath === linkPath_,
                 makeMsg(what, 'Wrong link path: ' + linkPath));
          server.name(id, name);
          server.end();
        });
        client.readlink(linkPath_, function(err, targetPath) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected readlink() error: ' + err));
          assert(targetPath === name.filename,
                 makeMsg(what, 'Wrong target path: ' + targetPath));
        });
      };
    },
    what: 'readlink'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var linkPath_ = '/foo/bar/baz',
            targetPath_ = '/tmp/foo';
        server.on('SYMLINK', function(id, linkPath, targetPath) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(linkPath === linkPath_,
                 makeMsg(what, 'Wrong link path: ' + linkPath));
          assert(targetPath === targetPath_,
                 makeMsg(what, 'Wrong target path: ' + targetPath));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        client.symlink(targetPath_, linkPath_, function(err) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(!err, makeMsg(what, 'Unexpected symlink() error: ' + err));
        });
      };
    },
    what: 'symlink'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var opens = 0,
            reads = 0,
            closes = 0,
            path_ = '/foo/bar/baz',
            handle_ = new Buffer('hi mom!'),
            data_ = new Buffer('hello world');
        server.on('OPEN', function(id, path, pflags, attrs) {
          assert(++opens === 1, makeMsg(what, 'Saw too many OPENs'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          assert(pflags === OPEN_MODE.READ,
                 makeMsg(what, 'Wrong flags: ' + flagsToHuman(pflags)));
          server.handle(id, handle_);
        }).on('READ', function(id, handle, offset, len) {
          assert(++reads <= 2, makeMsg(what, 'Saw too many READs'));
          assert(id === reads, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          if (reads === 1) {
            assert(offset === 0, makeMsg(what, 'Wrong read offset: ' + offset));
            server.data(id, data_);
          } else
            server.status(id, STATUS_CODE.EOF);
        }).on('CLOSE', function(id, handle) {
          ++self.state.requests;
          assert(++closes === 1, makeMsg(what, 'Saw too many CLOSEs'));
          assert(id === 3, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.status(id, STATUS_CODE.OK);
          server.end();
        });
        var buf = [];
        client.createReadStream(path_).on('readable', function() { 
          var chunk;
          while ((chunk = this.read()) !== null) {
            buf.push(chunk);
          }
        }).on('end', function() {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          buf = Buffer.concat(buf);
          assert.deepEqual(buf, data_, makeMsg(what, 'data mismatch'));
        });
      };
    },
    what: 'ReadStream'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var opens = 0,
            path_ = '/foo/bar/baz',
            error;
        server.on('OPEN', function(id, path, pflags, attrs) {
          ++opens;
          ++self.state.requests;
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          assert(pflags === OPEN_MODE.READ,
                 makeMsg(what, 'Wrong flags: ' + flagsToHuman(pflags)));
          server.status(id, STATUS_CODE.NO_SUCH_FILE);
          server.end();
        });
        var buf = [];
        client.createReadStream(path_).on('error', function(err) {
          error = err;
        }).on('close', function() {
          assert(opens === 1, makeMsg(what, 'Saw ' + opens + ' OPENs'));
          assert(error, makeMsg(what, 'Expected error'));
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
        });
      };
    },
    what: 'ReadStream (error)'
  },
  { run: function() {
      setup(this);

      var self = this;
      var what = this.what;
      var client = this.client;
      var server = this.server;

      this.onReady = function() {
        var opens = 0;
        var writes = 0;
        var closes = 0;
        var path_ = '/foo/bar/baz';
        var handle_ = new Buffer('hi mom!');
        var data_ = new Buffer('hello world');
        var expFlags = OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE;
        server.on('OPEN', function(id, path, pflags, attrs) {
          assert(++opens === 1, makeMsg(what, 'Saw too many OPENs'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert(path === path_, makeMsg(what, 'Wrong path: ' + path));
          assert(pflags === expFlags,
                 makeMsg(what, 'Wrong flags: ' + flagsToHuman(pflags)));
          server.handle(id, handle_);
        }).on('WRITE', function(id, handle, offset, data) {
          assert(++writes <= 3, makeMsg(what, 'Saw too many WRITEs'));
          assert(id === writes, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          assert(offset === ((writes - 1) * data_.length),
                 makeMsg(what, 'Wrong write offset: ' + offset));
          assert.deepEqual(data, data_, makeMsg(what, 'Wrong data'));
          server.status(id, STATUS_CODE.OK);
        }).on('CLOSE', function(id, handle) {
          ++self.state.requests;
          assert(++closes === 1, makeMsg(what, 'Saw too many CLOSEs'));
          assert(id === 4, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.status(id, STATUS_CODE.OK);
          server.end();
        }).on('end', function() {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(opens === 1, makeMsg(what, 'Wrong OPEN count'));
          assert(writes === 3, makeMsg(what, 'Wrong WRITE count'));
          assert(closes === 1, makeMsg(what, 'Wrong CLOSE count'));
        });

        var writer = client.createWriteStream(path_);
        if (writer.cork)
          writer.cork();
        writer.write(data_);
        writer.write(data_);
        writer.write(data_);
        if (writer.uncork)
          writer.uncork();
        writer.end();
      };
    },
    what: 'WriteStream'
  },

// other client request scenarios
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var handle_ = new Buffer('node.js');
        server.on('READDIR', function(id, handle) {
          assert(++self.state.requests === 1,
                 makeMsg(what, 'Saw too many requests'));
          assert(id === 0, makeMsg(what, 'Wrong request id: ' + id));
          assert.deepEqual(handle, handle_, makeMsg(what, 'handle mismatch'));
          server.status(id, STATUS_CODE.EOF);
          server.end();
        });
        client.readdir(handle_, function(err, list) {
          assert(++self.state.responses === 1,
                 makeMsg(what, 'Saw too many responses'));
          assert(err && err.code === STATUS_CODE.EOF,
                 makeMsg(what, 'Expected EOF, got: ' + err));
        });
      };
    },
    what: 'readdir (EOF)'
  },
  { run: function() {
      setup(this);

      var self = this,
          what = this.what,
          client = this.client,
          server = this.server;

      this.onReady = function() {
        var path_ = '/tmp/foo.txt',
            reqs = 0,
            continues = 0;

        client.unpipe(server);

        function clientCb(err, handle) {
          assert(++self.state.responses <= reqs,
                 makeMsg(what, 'Saw too many responses'));
          if (self.state.responses === reqs) {
            assert(continues === 1, makeMsg(what, 'no continue event seen'));
            server.end();
          }
        }

        client.on('continue', function() {
          assert(++continues === 1, makeMsg(what, 'saw > 1 continue event'));
        });

        while (true) {
          ++reqs;
          if (!client.open(path_, 'w', clientCb))
            break;
        }

        client.pipe(server);
      };
    },
    expected: {
      requests: -1,
      responses: -1
    },
    what: '"continue" event after push() === false'
  },
];

function setup(self) {
  var expectedRequests = (self.expected && self.expected.requests) || 1,
      expectedResponses = (self.expected && self.expected.responses) || 1,
      clientEnds = 0,
      serverEnds = 0;

  self.state = {
    readies: 0,
    requests: 0,
    responses: 0
  };

  self.client = new SFTPStream();
  self.server = new SFTPStream({ server: true });

  self.server.on('error', onError)
             .on('ready', onReady)
             .on('end', onEnd);
  self.client.on('error', onError)
             .on('ready', onReady)
             .on('end', onEnd);

  function onError(err) {
    var which = (this === self.server ? 'server' : 'client');
    assert(false, makeMsg(self.what, 'Unexpected ' + which + ' error: ' + err));
  }
  function onReady() {
    assert(self.state.readies < 2,
           makeMsg(self.what, 'Saw too many ready events'));
    if (++self.state.readies === 2)
      self.onReady();
  }
  function onEnd() {
    if (this === self.server)
      ++serverEnds;
    else
      ++clientEnds;
    assert(serverEnds <= 1,
           makeMsg(self.what, 'Saw too many server end events'));
    assert(clientEnds <= 1,
           makeMsg(self.what, 'Saw too many client end/close events'));
    if (serverEnds + clientEnds === 2) {
      if (expectedRequests > 0) {
        assert(self.state.requests === expectedRequests,
               makeMsg(self.what, 'Missing request(s)'));
      }
      if (expectedResponses > 0) {
        assert(self.state.responses === expectedResponses,
               makeMsg(self.what, 'Missing response(s)'));
      }
      next();
    }
  }

  process.nextTick(function() {
    self.client.pipe(self.server).pipe(self.client);
  });
}

function flagsToHuman(flags) {
  var ret = [];

  for (var i = 0, keys = Object.keys(OPEN_MODE), len = keys.length; i < len; ++i)
    if (flags & OPEN_MODE[keys[i]])
      ret.push(keys[i]);

  return ret.join(' | ');
}

function next() {
  if (++t === tests.length)
    return;

  var v = tests[t];
  v.run.call(v);
}

function makeMsg(what, msg) {
  return '[' + group + what + ']: ' + msg;
}

process.once('exit', function() {
  assert(t === tests.length,
         makeMsg('_exit',
                 'Only finished ' + t + '/' + tests.length + ' tests'));
});

next();
