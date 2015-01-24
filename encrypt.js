// Generated by CoffeeScript 1.8.0
(function() {
  var Encryptor, cachedTables, crypto, encrypt, getTable, int32Max, merge_sort;

  crypto = require("crypto");

  merge_sort = require("./merge_sort").merge_sort;

  int32Max = Math.pow(2, 32);

  cachedTables = {};

  getTable = function(key) {
    var ah, al, decrypt_table, hash, i, md5sum, result, table;
    if (cachedTables[key]) {
      return cachedTables[key];
    }
    console.log("calculating ciphers");
    table = new Array(256);
    decrypt_table = new Array(256);
    md5sum = crypto.createHash("md5");
    md5sum.update(key);
    hash = new Buffer(md5sum.digest(), "binary");
    al = hash.readUInt32LE(0);
    ah = hash.readUInt32LE(4);
    i = 0;
    while (i < 256) {
      table[i] = i;
      i++;
    }
    i = 1;
    while (i < 1024) {
      table = merge_sort(table, function(x, y) {
        return ((ah % (x + i)) * int32Max + al) % (x + i) - ((ah % (y + i)) * int32Max + al) % (y + i);
      });
      i++;
    }
    i = 0;
    while (i < 256) {
      decrypt_table[table[i]] = i;
      ++i;
    }
    result = [table, decrypt_table];
    cachedTables[key] = result;
    return result;
  };

  encrypt = function(table, buf) {
    var i;
    i = 0;
    while (i < buf.length) {
      buf[i] = table[buf[i]];
      i++;
    }
    return buf;
  };

  Encryptor = (function() {
    function Encryptor(key, method) {
      var _ref;
      this.method = method;
      if (this.method != null) {
        this.cipher = crypto.createCipher(this.method, key);
        this.decipher = crypto.createDecipher(this.method, key);
      } else {
        _ref = getTable(key), this.encryptTable = _ref[0], this.decryptTable = _ref[1];
      }
    }

    Encryptor.prototype.encrypt = function(buf) {
      if (this.method != null) {
        return this.cipher.update(buf);
      } else {
        return encrypt(this.encryptTable, buf);
      }
    };

    Encryptor.prototype.decrypt = function(buf) {
      if (this.method != null) {
        return this.decipher.update(buf);
      } else {
        return encrypt(this.decryptTable, buf);
      }
    };

    return Encryptor;

  })();

  exports.Encryptor = Encryptor;

  exports.getTable = getTable;

}).call(this);
