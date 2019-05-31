SFTPStream events
-----------------

**Client/Server events**

* **ready**() - Emitted after initial protocol version check has passed.

**Server-only events**

* **OPEN**(< _integer_ >reqID, < _string_ >filename, < _integer_ >flags, < _ATTRS_>attrs)

* **READ**(< _integer_ >reqID, < _Buffer_ >handle, < _integer_ >offset, < _integer_ >length)

* **WRITE**(< _integer_ >reqID, < _Buffer_ >handle, < _integer_ >offset, < _Buffer_ >data)

* **FSTAT**(< _integer_ >reqID, < _Buffer_ >handle)

* **FSETSTAT**(< _integer_ >reqID, < _Buffer_ >handle, < _ATTRS_ >attrs)

* **CLOSE**(< _integer_ >reqID, < _Buffer_ >handle)

* **OPENDIR**(< _integer_ >reqID, < _string_ >path)

* **READDIR**(< _integer_ >reqID, < _Buffer_ >handle)

* **LSTAT**(< _integer_ >reqID, < _string_ >path)

* **STAT**(< _integer_ >reqID, < _string_ >path)

* **REMOVE**(< _integer_ >reqID, < _string_ >path)

* **RMDIR**(< _integer_ >reqID, < _string_ >path)

* **REALPATH**(< _integer_ >reqID, < _string_ >path)

* **READLINK**(< _integer_ >reqID, < _string_ >path)

* **SETSTAT**(< _integer_ >reqID, < _string_ >path, < _ATTRS_ >attrs)

* **MKDIR**(< _integer_ >reqID, < _string_ >path, < _ATTRS_ >attrs)

* **RENAME**(< _integer_ >reqID, < _string_ >oldPath, < _string_ >newPath)

* **SYMLINK**(< _integer_ >reqID, < _string_ >linkPath, < _string_ >targetPath)


SFTPStream static constants
---------------------------

* **SFTPStream.STATUS_CODE** - _object_ - Contains the various status codes (for use especially with `status()`):

  * `OK`

  * `EOF`

  * `NO_SUCH_FILE`

  * `PERMISSION_DENIED`

  * `FAILURE`

  * `BAD_MESSAGE`

  * `OP_UNSUPPORTED`

* **SFTPStream.OPEN_MODE** - _object_ - Contains the various open file flags:

  * `READ`

  * `WRITE`

  * `APPEND`

  * `CREAT`

  * `TRUNC`

  * `EXCL`


SFTPStream static constants
---------------------------

* **stringToFlags**(< _string_ >flagsStr) - _integer_ - Converts string flags (e.g. `'r'`, `'a+'`, etc.) to the appropriate `SFTPStream.OPEN_MODE` flag mask. Returns `null` if conversion failed.

* **flagsToString**(< _integer_ >flagsMask) - _string_ - Converts flag mask (e.g. number containing `SFTPStream.OPEN_MODE` values) to the appropriate string value. Returns `null` if conversion failed.


SFTPStream methods
------------------

* **(constructor)**(< _object_ >config[, < _string_ >remoteIdentRaw]) - Creates and returns a new SFTPStream instance. SFTPStream instances are Duplex streams. `remoteIdentRaw` can be the raw SSH identification string of the remote party. This is used to change internal behavior based on particular SFTP implementations. `config` can contain:

    * **server** - _boolean_ - Set to `true` to create an instance in server mode. **Default:** `false`

    * **highWaterMark** - _integer_ - This is the `highWaterMark` to use for the stream. **Default:** `32 * 1024`

    * **debug** - _function_ - Set this to a function that receives a single string argument to get detailed (local) debug information. **Default:** (none)



**Client-only methods**

* **fastGet**(< _string_ >remotePath, < _string_ >localPath[, < _object_ >options], < _function_ >callback) - _(void)_ - Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput. `options` can have the following properties:

    * concurrency - _integer_ - Number of concurrent reads **Default:** `25`

    * chunkSize - _integer_ - Size of each read in bytes **Default:** `32768`

    * step - _function_(< _integer_ >total_transferred, < _integer_ >chunk, < _integer_ >total) - Called every time a part of a file was transferred

    `callback` has 1 parameter: < _Error_ >err.

* **fastPut**(< _string_ >localPath, < _string_ >remotePath[, < _object_ >options], < _function_ >callback) - _(void)_ - Uploads a file from `localPath` to `remotePath` using parallel reads for faster throughput. `options` can have the following properties:

    * concurrency - _integer_ - Number of concurrent reads **Default:** `25`

    * chunkSize - _integer_ - Size of each read in bytes **Default:** `32768`

    * step - _function_(< _integer_ >total_transferred, < _integer_ >chunk, < _integer_ >total) - Called every time a part of a file was transferred

    `callback` has 1 parameter: < _Error_ >err.

* **createReadStream**(< _string_ >path[, < _object_ >options]) - _ReadStream_ - Returns a new readable stream for `path`. `options` has the following defaults:

    ```javascript
    { flags: 'r',
      encoding: null,
      handle: null,
      mode: 0666,
      autoClose: true
    }
    ```

    `options` can include `start` and `end` values to read a range of bytes from the file instead of the entire file. Both `start` and `end` are inclusive and start at 0. The `encoding` can be `'utf8'`, `'ascii'`, or `'base64'`.

    If `autoClose` is false, then the file handle won't be closed, even if there's an error. It is your responsiblity to close it and make sure there's no file handle leak. If `autoClose` is set to true (default behavior), on `error` or `end` the file handle will be closed automatically.

    An example to read the last 10 bytes of a file which is 100 bytes long:

    ```javascript
    sftp.createReadStream('sample.txt', {start: 90, end: 99});
    ```

* **createWriteStream**(< _string_ >path[, < _object_ >options]) - _WriteStream_ - Returns a new writable stream for `path`. `options` has the following defaults:

    ```javascript
    { flags: 'w',
      encoding: null,
      mode: 0666 }
    ```

    `options` may also include a `start` option to allow writing data at some position past the beginning of the file. Modifying a file rather than replacing it may require a flags mode of 'r+' rather than the default mode 'w'.

    If 'autoClose' is set to false and you pipe to this stream, this stream will not automatically close after there is no more data upstream -- allowing future pipes and/or manual writes.

* **open**(< _string_ >filename, < _string_ >mode, [< _ATTRS_ >attributes, ]< _function_ >callback) - _boolean_ - Opens a file `filename` for `mode` with optional `attributes`. `mode` is any of the modes supported by fs.open (except sync mode). Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _Buffer_ >handle.

* **close**(< _Buffer_ >handle, < _function_ >callback) - _boolean_ - Closes the resource associated with `handle` given by open() or opendir(). Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **readData**(< _Buffer_ >handle, < _Buffer_ >buffer, < _integer_ >offset, < _integer_ >length, < _integer_ >position, < _function_ >callback) - _boolean_ - Reads `length` bytes from the resource associated with `handle` starting at `position` and stores the bytes in `buffer` starting at `offset`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 4 parameters: < _Error_ >err, < _integer_ >bytesRead, < _Buffer_ >buffer (offset adjusted), < _integer_ >position.

* **writeData**(< _Buffer_ >handle, < _Buffer_ >buffer, < _integer_ >offset, < _integer_ >length, < _integer_ >position, < _function_ >callback) - _boolean_ - Writes `length` bytes from `buffer` starting at `offset` to the resource associated with `handle` starting at `position`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **fstat**(< _Buffer_ >handle, < _function_ >callback) - _boolean_ - Retrieves attributes for the resource associated with `handle`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _Stats_ >stats.

* **fsetstat**(< _Buffer_ >handle, < _ATTRS_ >attributes, < _function_ >callback) - _boolean_ - Sets the attributes defined in `attributes` for the resource associated with `handle`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **futimes**(< _Buffer_ >handle, < _mixed_ >atime, < _mixed_ >mtime, < _function_ >callback) - _boolean_ - Sets the access time and modified time for the resource associated with `handle`. `atime` and `mtime` can be Date instances or UNIX timestamps. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **fchown**(< _Buffer_ >handle, < _integer_ >uid, < _integer_ >gid, < _function_ >callback) - _boolean_ - Sets the owner for the resource associated with `handle`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **fchmod**(< _Buffer_ >handle, < _mixed_ >mode, < _function_ >callback) - _boolean_ - Sets the mode for the resource associated with `handle`. `mode` can be an integer or a string containing an octal number. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **opendir**(< _string_ >path, < _function_ >callback) - _boolean_ - Opens a directory `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _Buffer_ >handle.

* **readdir**(< _mixed_ >location, < _function_ >callback) - _boolean_ - Retrieves a directory listing. `location` can either be a _Buffer_ containing a valid directory handle from opendir() or a _string_ containing the path to a directory. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _mixed_ >list. `list` is an _Array_ of `{ filename: 'foo', longname: '....', attrs: {...} }` style objects (attrs is of type _ATTR_). If `location` is a directory handle, this function may need to be called multiple times until `list` is boolean false, which indicates that no more directory entries are available for that directory handle.

* **unlink**(< _string_ >path, < _function_ >callback) - _boolean_ - Removes the file/symlink at `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **rename**(< _string_ >srcPath, < _string_ >destPath, < _function_ >callback) - _boolean_ - Renames/moves `srcPath` to `destPath`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **mkdir**(< _string_ >path, [< _ATTRS_ >attributes, ]< _function_ >callback) - _boolean_ - Creates a new directory `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **rmdir**(< _string_ >path, < _function_ >callback) - _boolean_ - Removes the directory at `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **stat**(< _string_ >path, < _function_ >callback) - _boolean_ - Retrieves attributes for `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameter: < _Error_ >err, < _Stats_ >stats.

* **lstat**(< _string_ >path, < _function_ >callback) - _boolean_ - Retrieves attributes for `path`. If `path` is a symlink, the link itself is stat'ed instead of the resource it refers to. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _Stats_ >stats.

* **setstat**(< _string_ >path, < _ATTRS_ >attributes, < _function_ >callback) - _boolean_ - Sets the attributes defined in `attributes` for `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **utimes**(< _string_ >path, < _mixed_ >atime, < _mixed_ >mtime, < _function_ >callback) - _boolean_ - Sets the access time and modified time for `path`. `atime` and `mtime` can be Date instances or UNIX timestamps. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **chown**(< _string_ >path, < _integer_ >uid, < _integer_ >gid, < _function_ >callback) - _boolean_ - Sets the owner for `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **chmod**(< _string_ >path, < _mixed_ >mode, < _function_ >callback) - _boolean_ - Sets the mode for `path`. `mode` can be an integer or a string containing an octal number. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **readlink**(< _string_ >path, < _function_ >callback) - _boolean_ - Retrieves the target for a symlink at `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _string_ >target.

* **symlink**(< _string_ >targetPath, < _string_ >linkPath, < _function_ >callback) - _boolean_ - Creates a symlink at `linkPath` to `targetPath`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **realpath**(< _string_ >path, < _function_ >callback) - _boolean_ - Resolves `path` to an absolute path. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _string_ >absPath.

* **ext_openssh_rename**(< _string_ >srcPath, < _string_ >destPath, < _function_ >callback) - _boolean_ - **OpenSSH extension** Performs POSIX rename(3) from `srcPath` to `destPath`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **ext_openssh_statvfs**(< _string_ >path, < _function_ >callback) - _boolean_ - **OpenSSH extension** Performs POSIX statvfs(2) on `path`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _object_ >fsInfo. `fsInfo` contains the information as found in the [statvfs struct](http://linux.die.net/man/2/statvfs).

* **ext_openssh_fstatvfs**(< _Buffer_ >handle, < _function_ >callback) - _boolean_ - **OpenSSH extension** Performs POSIX fstatvfs(2) on open handle `handle`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _object_ >fsInfo. `fsInfo` contains the information as found in the [statvfs struct](http://linux.die.net/man/2/statvfs).

* **ext_openssh_hardlink**(< _string_ >targetPath, < _string_ >linkPath, < _function_ >callback) - _boolean_ - **OpenSSH extension** Performs POSIX link(2) to create a hard link to `targetPath` at `linkPath`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.

* **ext_openssh_fsync**(< _Buffer_ >handle, < _function_ >callback) - _boolean_ - **OpenSSH extension** Performs POSIX fsync(3) on the open handle `handle`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 1 parameter: < _Error_ >err.


**Server-only methods**

* **status**(< _integer_ >reqID, < _integer_ >statusCode[, < _string_ >message]) - _boolean_ - Sends a status response for the request identified by `id`. Returns `false` if you should wait for the `continue` event before sending any more traffic.

* **handle**(< _integer_ >reqID, < _Buffer_ >handle) - _boolean_ - Sends a handle response for the request identified by `id`. `handle` must be less than 256 bytes. Returns `false` if you should wait for the `continue` event before sending any more traffic.

* **data**(< _integer_ >reqID, < _mixed_ >data[, < _string_ >encoding]) - _boolean_ - Sends a data response for the request identified by `id`. `data` can be a _Buffer_ or _string_. If `data` is a string, `encoding` is the encoding of `data`. Returns `false` if you should wait for the `continue` event before sending any more traffic.

* **name**(< _integer_ >reqID, < _array_ >names) - _boolean_ - Sends a name response for the request identified by `id`. Returns `false` if you should wait for the `continue` event before sending any more traffic. `names` must be an _array_ of _object_ where each _object_ can contain:

    * **filename** - _string_ - The entry's name.

    * **longname** - _string_ - This is the `ls -l`-style format for the entry (e.g. `-rwxr--r--  1 bar   bar       718 Dec  8  2009 foo`)

    * **attrs** - _ATTRS_ - This is an optional _ATTRS_ object that contains requested/available attributes for the entry.

* **attrs**(< _integer_ >reqID, < _ATTRS_ >attrs) - _boolean_ - Sends an attrs response for the request identified by `id`. `attrs` contains the requested/available attributes.


ATTRS
-----

An object with the following valid properties:

* **mode** - _integer_ - Mode/permissions for the resource.

* **uid** - _integer_ - User ID of the resource.

* **gid** - _integer_ - Group ID of the resource.

* **size** - _integer_ - Resource size in bytes.

* **atime** - _integer_ - UNIX timestamp of the access time of the resource.

* **mtime** - _integer_ - UNIX timestamp of the modified time of the resource.

When supplying an ATTRS object to one of the SFTP methods:

* `atime` and `mtime` can be either a Date instance or a UNIX timestamp.

* `mode` can either be an integer or a string containing an octal number.


Stats
-----

An object with the same attributes as an ATTRS object with the addition of the following methods:

* `stats.isDirectory()`

* `stats.isFile()`

* `stats.isBlockDevice()`

* `stats.isCharacterDevice()`

* `stats.isSymbolicLink()`

* `stats.isFIFO()`

* `stats.isSocket()`
