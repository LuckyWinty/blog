var SSH2Stream = require('../lib/ssh');

var basename = require('path').basename,
    inspect = require('util').inspect,
    assert = require('assert');

var group = basename(__filename, '.js') + '/',
    t = -1,
    EMPTY_BUFFER = new Buffer(0),
    SERVER_KEY = require('fs').readFileSync(__dirname
                                            + '/fixtures/ssh_host_rsa_key');

var tests = [
  // server-side tests
  { run: function() {
      var self = this,
          what = this.what,
          stream = new SSH2Stream({ server: true, privateKey: SERVER_KEY }),
          result,
          expected;

      var key = new Buffer('o hai mark'),
          keyLen = key.length;
      expected = new Buffer([
        0x3C,
        0x00, 0x00, 0x00, 0x07,
        0x73, 0x73, 0x68, 0x2D, 0x72, 0x73, 0x61,
        (keyLen >>> 24) & 0xFF, (keyLen >>> 16) & 0xFF, (keyLen >>> 8) & 0xFF,
          keyLen & 0xFF
      ].concat(b2a(key)));

      skipIdent(stream);
      stream.authPKOK('ssh-rsa', key);
      result = readData(stream);
      assertDeepEqual(result, expected);

      next();
    },
    what: 'authPKOK'
  },
];

function skipIdent(stream) {
  var buf = EMPTY_BUFFER;
  var b;
  var i = 0;
  while ((b = stream.read()) !== null) {
    buf = Buffer.concat([buf, b]);
    for (; i < buf.length; ++i) {
      if (buf[i] === 10) {
        if ((i + 1) < buf.length)
          stream.unshift(buf.slice(i + 1));
        return;
      }
    }
  }
  throw new Error('Expected ident string');
}

function readData(stream) {
  var buf = EMPTY_BUFFER;
  var b;
  while ((b = stream.read()) !== null)
    buf = Buffer.concat([buf, b]);
  for (var i = 0, newbuf = EMPTY_BUFFER; i < buf.length;) {
    var len = buf.readUInt32BE(i, true),
        plen = buf[i += 4];
    ++i;
    newbuf = Buffer.concat([newbuf, buf.slice(i, i + (len - plen - 1))]);
    i += (len - 1);
  }
  return newbuf;
}

function b2a(buffer) {
  return Array.prototype.slice.call(buffer);
}

function assertDeepEqual(actual, expected, msg) {
  msg || (msg = 'output mismatch');
  msg += ':\nActual:\n'
         + inspect(actual)
         + '\nExpected:\n'
         + inspect(expected);
  assert.deepEqual(actual, expected, makeMsg(tests[t].what, msg));
}



function next() {
  if (Array.isArray(process._events.exit))
    process._events.exit = process._events.exit[1];
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
