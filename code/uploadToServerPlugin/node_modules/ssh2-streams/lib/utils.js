var crypto = require('crypto');

var Ber = require('asn1').Ber;
var BigInteger = require('./jsbn'); // only for converting PPK -> OpenSSL format

var SSH_TO_OPENSSL = require('./constants').SSH_TO_OPENSSL;

var RE_STREAM = /^arcfour/i;
var RE_GCM = /^aes\d+-gcm/i;
var RE_KEY_LEN = /(.{64})/g;
// XXX the value of 2400 from dropbear is only for certain strings, not all
// strings. for example the list strings used during handshakes
var MAX_STRING_LEN = Infinity;//2400; // taken from dropbear
var PPK_IV = new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

module.exports = {
  iv_inc: function(iv) {
    var n = 12;
    var c = 0;
    do {
      --n;
      c = iv[n];
      if (c === 255)
        iv[n] = 0;
      else {
        iv[n] = ++c;
        return;
      }
    } while (n > 4);
  },
  isStreamCipher: function(name) {
    return RE_STREAM.test(name);
  },
  isGCM: function(name) {
    return RE_GCM.test(name);
  },
  readInt: function(buffer, start, stream, cb) {
    var bufferLen = buffer.length;
    if (start < 0 || start >= bufferLen || (bufferLen - start) < 4) {
      stream && stream._cleanup(cb);
      return false;
    }

    return buffer.readUInt32BE(start, true);
  },
  readString: readString,
  parseKey: require('./keyParser'),
  genPublicKey: genPublicKey,
  convertPPKPrivate: convertPPKPrivate,
  verifyPPKMAC: verifyPPKMAC,
  decryptKey: function(keyInfo, passphrase) {
    if (keyInfo._decrypted || !keyInfo.encryption)
      return;

    var keylen = 0;
    var key;
    var iv;
    var out;
    var dc;

    keyInfo.encryption = (SSH_TO_OPENSSL[keyInfo.encryption]
                          || keyInfo.encryption);
    switch (keyInfo.encryption) {
      case 'aes-256-cbc':
      case 'aes-256-ctr':
        keylen = 32; // eg. 256 / 8
        break;
      case 'des-ede3-cbc':
      case 'des-ede3':
      case 'aes-192-cbc':
      case 'aes-192-ctr':
        keylen = 24; // eg. 192 / 8
        break;
      case 'aes-128-cbc':
      case 'aes-128-ctr':
      case 'cast-cbc':
      case 'bf-cbc':
        keylen = 16; // eg. 128 / 8
        break;
    }

    if (keyInfo.ppk) {
      iv = PPK_IV;

      key = crypto.createHash('sha1')
                  .update('\x00\x00\x00\x00' + passphrase, 'binary')
                  .digest('binary')
            + crypto.createHash('sha1')
                    .update('\x00\x00\x00\x01' + passphrase, 'binary')
                    .digest('binary');
      key = new Buffer(key, 'binary').slice(0, keylen);
    } else {
      iv = new Buffer(keyInfo.extra[0], 'hex');

      key = new Buffer(crypto.createHash('md5')
                             .update(passphrase + iv.toString('binary', 0, 8),
                                     'binary')
                             .digest('binary'), 'binary');

      while (keylen > key.length) {
        key = Buffer.concat([
          key,
          new Buffer(crypto.createHash('md5')
                           .update(key.toString('binary')
                                   + passphrase
                                   + iv.toString('binary'),
                                   'binary')
                           .digest('binary'), 'binary').slice(0, 8)
        ]);
      }
      if (key.length > keylen)
        key = key.slice(0, keylen);
    }

    dc = crypto.createDecipheriv(keyInfo.encryption, key, iv);
    dc.setAutoPadding(false);
    out = dc.update(keyInfo.private, 'binary', 'binary');
    out += dc.final('binary');

    keyInfo.private = new Buffer(out, 'binary');

    keyInfo._decrypted = true;

    if (keyInfo.privateOrig) {
      // update our original base64-encoded version of the private key
      var orig = keyInfo.privateOrig.toString('utf8');
      var newOrig = /^(.+(?:\r\n|\n))/.exec(orig)[1];
      var b64key = new Buffer(out, 'binary').toString('base64');

      newOrig += b64key.match(/.{1,70}/g).join('\n');
      newOrig += /((?:\r\n|\n).+)$/.exec(orig)[1];

      keyInfo.privateOrig = newOrig;
    } else if (keyInfo.ppk) {
      var valid = verifyPPKMAC(keyInfo, passphrase, keyInfo.private);
      if (!valid)
        throw new Error('PPK MAC mismatch');
      // automatically convert private key data to OpenSSL format
      // (including PEM)
      convertPPKPrivate(keyInfo);
    }
  }
};

function genPublicKey(keyInfo) {
  var publicKey;
  var p;

  // RSA
  var nStart;
  var nLen;
  var eStart;
  var eLen;

  // DSA
  var pStart;
  var pLen;
  var qStart;
  var qLen;
  var gStart;
  var gLen;
  var yStart;
  var yLen;

  if (keyInfo.private) {
    // parsing private key in ASN.1 format in order to generate a public key
    var privKey = keyInfo.private;
    var i = 2;
    var len;
    var octets;

    if (privKey[0] === 0x30) {
      if (privKey[1] & 0x80)
        i += (privKey[1] & 0x7F);

      // version -- integer
      if (privKey[i++] !== 0x02)
        throw new Error('Malformed private key (expected integer for version)');
      len = privKey[i++];
      if (len & 0x80) {
        octets = len & 0x7F;
        len = 0;
        while (octets > 0) {
          len += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
          --octets;
        }
      }
      i += len; // skip version value

      if (keyInfo.type === 'rsa') {
        // modulus (n) -- integer
        if (privKey[i++] !== 0x02)
          throw new Error('Malformed private key (expected integer for n)');
        nLen = privKey[i++];
        if (nLen & 0x80) {
          octets = nLen & 0x7F;
          nLen = 0;
          while (octets > 0) {
            nLen += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
            --octets;
          }
        }
        nStart = i;
        i += nLen;

        // public exponent (e) -- integer
        if (privKey[i++] !== 0x02)
          throw new Error('Malformed private key (expected integer for e)');
        eLen = privKey[i++];
        if (eLen & 0x80) {
          octets = eLen & 0x7F;
          eLen = 0;
          while (octets > 0) {
            eLen += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
            --octets;
          }
        }
        eStart = i;
      } else { // DSA
        // prime (p) -- integer
        if (privKey[i++] !== 0x02)
          throw new Error('Malformed private key (expected integer for p)');
        pLen = privKey[i++];
        if (pLen & 0x80) {
          octets = pLen & 0x7F;
          pLen = 0;
          while (octets > 0) {
            pLen += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
            --octets;
          }
        }
        pStart = i;
        i += pLen;

        // group order (q) -- integer
        if (privKey[i++] !== 0x02)
          throw new Error('Malformed private key (expected integer for q)');
        qLen = privKey[i++];
        if (qLen & 0x80) {
          octets = qLen & 0x7F;
          qLen = 0;
          while (octets > 0) {
            qLen += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
            --octets;
          }
        }
        qStart = i;
        i += qLen;

        // group generator (g) -- integer
        if (privKey[i++] !== 0x02)
          throw new Error('Malformed private key (expected integer for g)');
        gLen = privKey[i++];
        if (gLen & 0x80) {
          octets = gLen & 0x7F;
          gLen = 0;
          while (octets > 0) {
            gLen += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
            --octets;
          }
        }
        gStart = i;
        i += gLen;

        // public key value (y) -- integer
        if (privKey[i++] !== 0x02)
          throw new Error('Malformed private key (expected integer for y)');
        yLen = privKey[i++];
        if (yLen & 0x80) {
          octets = yLen & 0x7F;
          yLen = 0;
          while (octets > 0) {
            yLen += (privKey[i++] * Math.pow(2, (octets - 1) * 8));
            --octets;
          }
        }
        yStart = i;
        i += yLen;
      }

      p = 4 + 7;

      if (keyInfo.type === 'rsa') {
        publicKey = new Buffer(4 + 7 // ssh-rsa
                               + 4 + nLen
                               + 4 + eLen);

        publicKey.writeUInt32BE(7, 0, true);
        publicKey.write('ssh-rsa', 4, 7, 'ascii');

        publicKey.writeUInt32BE(eLen, p, true);
        privKey.copy(publicKey, p += 4, eStart, eStart + eLen);

        publicKey.writeUInt32BE(nLen, p += eLen, true);
        privKey.copy(publicKey, p += 4, nStart, nStart + nLen);
      } else { // DSA
        publicKey = new Buffer(4 + 7 // ssh-dss
                               + 4 + pLen
                               + 4 + qLen
                               + 4 + gLen
                               + 4 + yLen);

        publicKey.writeUInt32BE(7, 0, true);
        publicKey.write('ssh-dss', 4, 7, 'ascii');

        publicKey.writeUInt32BE(pLen, p, true);
        privKey.copy(publicKey, p += 4, pStart, pStart + pLen);

        publicKey.writeUInt32BE(qLen, p += pLen, true);
        privKey.copy(publicKey, p += 4, qStart, qStart + qLen);

        publicKey.writeUInt32BE(gLen, p += qLen, true);
        privKey.copy(publicKey, p += 4, gStart, gStart + gLen);

        publicKey.writeUInt32BE(yLen, p += gLen, true);
        privKey.copy(publicKey, p += 4, yStart, yStart + yLen);
      }
    } else {
      var errMsg = 'Malformed private key (expected sequence)';
      if (keyInfo._decrypted)
        errMsg += '. Bad passphrase?';
      throw new Error(errMsg);
    }
  } else if (keyInfo.public) {
    publicKey = keyInfo.public;
    // check for missing ssh-{dsa,rsa} prefix
    if (publicKey[0] !== 0
        || publicKey[1] !== 0
        || publicKey[2] !== 0
        || publicKey[3] !== 7
        || publicKey[4] !== 115
        || publicKey[5] !== 115
        || publicKey[6] !== 104
        || publicKey[7] !== 45
        || ((publicKey[8] !== 114
             || publicKey[9] !== 115
             || publicKey[10] !== 97)
            &&
            ((publicKey[8] !== 100
              || publicKey[9] !== 115
              || publicKey[10] !== 115)))) {
      var newPK = new Buffer(4 + 7 + publicKey.length);
      publicKey.copy(newPK, 11);
      newPK.writeUInt32BE(7, 0, true);
      if (keyInfo.type === 'rsa')
        newPK.write('ssh-rsa', 4, 7, 'ascii');
      else
        newPK.write('ssh-dss', 4, 7, 'ascii');
      publicKey = newPK;
    }
  } else
    throw new Error('Missing data generated by parseKey()');

  // generate a public key format for use with OpenSSL

  p = 4 + 7;

  var asnWriter = new Ber.Writer();
  asnWriter.startSequence();
  if (keyInfo.type === 'rsa') {
    eLen = publicKey.readUInt32BE(p, true);
    p += 4;
    eStart = p;
    p += eLen;

    nLen = publicKey.readUInt32BE(p, true);
    p += 4;
    nStart = p;

    var e = publicKey.slice(eStart, eStart + eLen);
    var n = publicKey.slice(nStart, nStart + nLen);
    asnWriter.startSequence();
    asnWriter.writeOID('1.2.840.113549.1.1.1');
    asnWriter.writeNull();
    asnWriter.endSequence();

    asnWriter.startSequence(Ber.BitString);
    asnWriter.writeByte(0x00);
    asnWriter.startSequence();
    asnWriter.writeBuffer(n, Ber.Integer);
    asnWriter.writeBuffer(e, Ber.Integer);
    asnWriter.endSequence();
    asnWriter.endSequence();
  } else {
    pLen = publicKey.readUInt32BE(p, true);
    p += 4;
    pStart = p;
    p += pLen;

    qLen = publicKey.readUInt32BE(p, true);
    p += 4;
    qStart = p;
    p += qLen;

    gLen = publicKey.readUInt32BE(p, true);
    p += 4;
    gStart = p;
    p += gLen;

    yLen = publicKey.readUInt32BE(p, true);
    p += 4;
    yStart = p;

    p = publicKey.slice(pStart, pStart + pLen);
    var q = publicKey.slice(qStart, qStart + qLen);
    var g = publicKey.slice(gStart, gStart + gLen);
    var y = publicKey.slice(yStart, yStart + yLen);

    asnWriter.startSequence();
    asnWriter.writeOID('1.2.840.10040.4.1');
    asnWriter.startSequence();
    asnWriter.writeBuffer(p, Ber.Integer);
    asnWriter.writeBuffer(q, Ber.Integer);
    asnWriter.writeBuffer(g, Ber.Integer);
    asnWriter.endSequence();
    asnWriter.endSequence();

    asnWriter.startSequence(Ber.BitString);
    asnWriter.writeByte(0x00);
    asnWriter.writeBuffer(y, Ber.Integer);
    asnWriter.endSequence();
  }
  asnWriter.endSequence();

  var b64key = asnWriter.buffer.toString('base64').replace(RE_KEY_LEN, '$1\n');
  var fullkey = '-----BEGIN PUBLIC KEY-----\n'
                + b64key
                + (b64key[b64key.length - 1] === '\n' ? '' : '\n')
                + '-----END PUBLIC KEY-----';

  return {
    type: keyInfo.type,
    fulltype: 'ssh-' + keyInfo.type,
    public: publicKey,
    publicOrig: new Buffer(fullkey)
  };
}

function verifyPPKMAC(keyInfo, passphrase, privateKey) {
  if (keyInfo._macresult !== undefined)
    return keyInfo._macresult;
  else if (!keyInfo.ppk)
    throw new Error("Key isn't a PPK");
  else if (!keyInfo.privateMAC)
    throw new Error('Missing MAC');
  else if (!privateKey)
    throw new Error('Missing raw private key data');
  else if (keyInfo.encryption && typeof passphrase !== 'string')
    throw new Error('Missing passphrase for encrypted PPK');
  else if (keyInfo.encryption && !keyInfo._decrypted)
    throw new Error('PPK must be decrypted before verifying MAC');

  var mac = keyInfo.privateMAC;
  var typelen = keyInfo.fulltype.length;
  // encryption algorithm is converted at this point for use with OpenSSL,
  // so we need to use the original value so that the MAC is calculated
  // correctly
  var enc = (keyInfo.encryption ? 'aes256-cbc' : 'none');
  var enclen = enc.length;
  var commlen = Buffer.byteLength(keyInfo.comment);
  var pub = keyInfo.public;
  var publen = pub.length;
  var privlen = privateKey.length;
  var macdata = new Buffer(4 + typelen
                           + 4 + enclen
                           + 4 + commlen
                           + 4 + publen
                           + 4 + privlen);
  var p = 0;

  macdata.writeUInt32BE(typelen, p, true);
  macdata.write(keyInfo.fulltype, p += 4, typelen, 'ascii');
  macdata.writeUInt32BE(enclen, p += typelen, true);
  macdata.write(enc, p += 4, enclen, 'ascii');
  macdata.writeUInt32BE(commlen, p += enclen, true);
  macdata.write(keyInfo.comment, p += 4, commlen, 'utf8');
  macdata.writeUInt32BE(publen, p += commlen, true);
  pub.copy(macdata, p += 4);
  macdata.writeUInt32BE(privlen, p += publen, true);
  privateKey.copy(macdata, p += 4);

  if (typeof passphrase !== 'string')
    passphrase = '';

  var mackey = crypto.createHash('sha1')
                     .update('putty-private-key-file-mac-key', 'ascii')
                     .update(passphrase, 'utf8')
                     .digest('binary');
  mackey = new Buffer(mackey, 'binary');

  var calcMAC = crypto.createHmac('sha1', mackey)
                      .update(macdata, 'binary')
                      .digest('hex');

  return (keyInfo._macresult = (calcMAC === mac));
}

function convertPPKPrivate(keyInfo) {
  if (!keyInfo.ppk || !keyInfo.public || !keyInfo.private)
    throw new Error("Key isn't a PPK");
  else if (keyInfo._converted)
    return false;

  var pub = keyInfo.public;
  var priv = keyInfo.private;
  var asnWriter = new Ber.Writer();
  var p;
  var q;

  if (keyInfo.type === 'rsa') {
    var e = readString(pub, 4 + 7);
    var n = readString(pub, pub._pos);
    var d = readString(priv, 0);
    p = readString(priv, priv._pos);
    q = readString(priv, priv._pos);
    var iqmp = readString(priv, priv._pos);
    var p1 = new BigInteger(p, 256);
    var q1 = new BigInteger(q, 256);
    var dmp1 = new BigInteger(d, 256);
    var dmq1 = new BigInteger(d, 256);

    dmp1 = new Buffer(dmp1.mod(p1.subtract(BigInteger.ONE)).toByteArray());
    dmq1 = new Buffer(dmq1.mod(q1.subtract(BigInteger.ONE)).toByteArray());

    asnWriter.startSequence();
    asnWriter.writeInt(0x00, Ber.Integer);
    asnWriter.writeBuffer(n, Ber.Integer);
    asnWriter.writeBuffer(e, Ber.Integer);
    asnWriter.writeBuffer(d, Ber.Integer);
    asnWriter.writeBuffer(p, Ber.Integer);
    asnWriter.writeBuffer(q, Ber.Integer);
    asnWriter.writeBuffer(dmp1, Ber.Integer);
    asnWriter.writeBuffer(dmq1, Ber.Integer);
    asnWriter.writeBuffer(iqmp, Ber.Integer);
    asnWriter.endSequence();
  } else {
    p = readString(pub, 4 + 7);
    q = readString(pub, pub._pos);
    var g = readString(pub, pub._pos);
    var y = readString(pub, pub._pos);
    var x = readString(priv, 0);

    asnWriter.startSequence();
    asnWriter.writeInt(0x00, Ber.Integer);
    asnWriter.writeBuffer(p, Ber.Integer);
    asnWriter.writeBuffer(q, Ber.Integer);
    asnWriter.writeBuffer(g, Ber.Integer);
    asnWriter.writeBuffer(y, Ber.Integer);
    asnWriter.writeBuffer(x, Ber.Integer);
    asnWriter.endSequence();
  }

  var b64key = asnWriter.buffer.toString('base64').replace(RE_KEY_LEN, '$1\n');
  var fullkey = '-----BEGIN '
                + (keyInfo.type === 'rsa' ? 'RSA' : 'DSA')
                + ' PRIVATE KEY-----\n'
                + b64key
                + (b64key[b64key.length - 1] === '\n' ? '' : '\n')
                + '-----END '
                + (keyInfo.type === 'rsa' ? 'RSA' : 'DSA')
                + ' PRIVATE KEY-----';

  keyInfo.private = asnWriter.buffer;
  keyInfo.privateOrig = new Buffer(fullkey);
  keyInfo._converted = true;
  return true;
}

function readString(buffer, start, encoding, stream, cb, maxLen) {
  if (encoding && !Buffer.isBuffer(encoding) && typeof encoding !== 'string') {
    if (typeof cb === 'number')
      maxLen = cb;
    cb = stream;
    stream = encoding;
    encoding = undefined;
  }

  var bufferLen = buffer.length;
  var left = (bufferLen - start);
  var len;
  var end;
  if (start < 0 || start >= bufferLen || left < 4) {
    stream && stream._cleanup(cb);
    return false;
  }

  len = buffer.readUInt32BE(start, true);
  if (len > (maxLen || MAX_STRING_LEN) || left < (4 + len)) {
    stream && stream._cleanup(cb);
    return false;
  }

  start += 4;
  end = start + len;
  buffer._pos = end;

  if (encoding) {
    if (Buffer.isBuffer(encoding)) {
      buffer.copy(encoding, 0, start, end);
      return encoding;
    } else
      return buffer.toString(encoding, start, end);
  } else
    return buffer.slice(start, end);
}

