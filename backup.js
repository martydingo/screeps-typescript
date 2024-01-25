'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sourceMapGenerator = {};

var base64Vlq = {};

var base64$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
base64$1.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
base64$1.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = base64$1;

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
base64Vlq.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var util$5 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
}(util$5));

var arraySet = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$4 = util$5;
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet$2() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet$2.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$2();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet$2.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet$2.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util$4.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet$2.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util$4.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet$2.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util$4.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet$2.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet$2.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

arraySet.ArraySet = ArraySet$2;

var mappingList = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$3 = util$5;

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util$3.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList$1() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList$1.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList$1.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList$1.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util$3.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

mappingList.MappingList = MappingList$1;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ$1 = base64Vlq;
var util$2 = util$5;
var ArraySet$1 = arraySet.ArraySet;
var MappingList = mappingList.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator$1(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util$2.getArg(aArgs, 'file', null);
  this._sourceRoot = util$2.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util$2.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator$1.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator$1.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator$1({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util$2.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util$2.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator$1.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util$2.getArg(aArgs, 'generated');
    var original = util$2.getArg(aArgs, 'original', null);
    var source = util$2.getArg(aArgs, 'source', null);
    var name = util$2.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator$1.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util$2.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util$2.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util$2.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator$1.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util$2.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet$1();
    var newNames = new ArraySet$1();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util$2.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util$2.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util$2.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util$2.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator$1.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator$1.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = '';

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util$2.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ$1.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ$1.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ$1.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ$1.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ$1.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator$1.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util$2.relative(aSourceRoot, source);
      }
      var key = util$2.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator$1.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator$1.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

sourceMapGenerator.SourceMapGenerator = SourceMapGenerator$1;

var sourceMapConsumer = {};

var binarySearch$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
}(binarySearch$1));

var quickSort$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
quickSort$1.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$1 = util$5;
var binarySearch = binarySearch$1;
var ArraySet = arraySet.ArraySet;
var base64VLQ = base64Vlq;
var quickSort = quickSort$1.quickSort;

function SourceMapConsumer$1(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer$1.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer$1.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer$1.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer$1.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer$1.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer$1.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer$1.GENERATED_ORDER = 1;
SourceMapConsumer$1.ORIGINAL_ORDER = 2;

SourceMapConsumer$1.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer$1.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer$1.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer$1.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer$1.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer$1.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util$1.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer$1.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util$1.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util$1.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util$1.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util$1.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

sourceMapConsumer.SourceMapConsumer = SourceMapConsumer$1;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sources = util$1.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util$1.getArg(sourceMap, 'names', []);
  var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util$1.getArg(sourceMap, 'mappings');
  var file = util$1.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util$1.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util$1.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
        ? util$1.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$1;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util$1.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util$1.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util$1.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util$1.compareByGeneratedPositionsDeflated,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util$1.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util$1.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util$1.getArg(mapping, 'originalLine', null),
          column: util$1.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util$1.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util$1.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util$1.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util$1.getArg(aArgs, 'line'),
      originalColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util$1.compareByOriginalPositions,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util$1.getArg(mapping, 'generatedLine', null),
          column: util$1.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sections = util$1.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util$1.getArg(s, 'offset');
    var offsetLine = util$1.getArg(offset, 'line');
    var offsetColumn = util$1.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer$1(util$1.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$1;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util$1.compareByOriginalPositions);
  };

sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = sourceMapGenerator.SourceMapGenerator;
var util = util$5;

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var SourceMapConsumer = sourceMapConsumer.SourceMapConsumer;

class ErrorMapper {
    static get consumer() {
        if (this._consumer == null) {
            this._consumer = new SourceMapConsumer(require("main.js.map"));
        }
        return this._consumer;
    }
    /**
     * Generates a stack trace using a source map generate original symbol names.
     *
     * WARNING - EXTREMELY high CPU cost for first call after reset - >30 CPU! Use sparingly!
     * (Consecutive calls after a reset are more reasonable, ~0.1 CPU/ea)
     *
     * @param {Error | string} error The error or original stack trace
     * @returns {string} The source-mapped stack trace
     */
    static sourceMappedStackTrace(error) {
        const stack = error instanceof Error ? error.stack : error;
        if (Object.prototype.hasOwnProperty.call(this.cache, stack)) {
            return this.cache[stack];
        }
        // eslint-disable-next-line no-useless-escape
        const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
        let match;
        let outStack = error.toString();
        while ((match = re.exec(stack))) {
            if (match[2] === "main") {
                const pos = this.consumer.originalPositionFor({
                    column: parseInt(match[4], 10),
                    line: parseInt(match[3], 10)
                });
                if (pos.line != null) {
                    if (pos.name) {
                        outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
                    }
                    else {
                        if (match[1]) {
                            // no original source file name known - use file name from given trace
                            outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
                        }
                        else {
                            // no original source file name known or in given trace - omit name
                            outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
                        }
                    }
                }
                else {
                    // no known position
                    break;
                }
            }
            else {
                // no more parseable lines
                break;
            }
        }
        this.cache[stack] = outStack;
        return outStack;
    }
    static wrapLoop(loop) {
        return () => {
            try {
                loop();
            }
            catch (e) {
                if (e instanceof Error) {
                    if ("sim" in Game.rooms) {
                        const message = `Source maps don't work in the simulator - displaying original error`;
                        console.log(`<span style='color:red'>${message}<br>${_.escape(e.stack)}</span>`);
                    }
                    else {
                        console.log(`<span style='color:red'>${_.escape(this.sourceMappedStackTrace(e))}</span>`);
                    }
                }
                else {
                    // can't handle it
                    throw e;
                }
            }
        };
    }
}
// Cache previously mapped traces to improve performance
ErrorMapper.cache = {};

const buildBotConfig = {
    role: "buildBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        500: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        550: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        600: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        650: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        700: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        750: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        800: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        850: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        900: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        950: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1000: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1050: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1100: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1150: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1200: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1250: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1300: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1350: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1400: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1450: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1500: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1550: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ]
    },
    priority: 5
};

const explorerBotConfig = {
    role: "explorerBot",
    parts: {
        300: [MOVE],
        350: [MOVE],
        400: [MOVE],
        450: [MOVE],
        500: [MOVE],
        550: [MOVE],
        600: [MOVE],
        650: [MOVE],
        700: [MOVE],
        750: [MOVE],
        800: [MOVE],
        850: [MOVE],
        900: [MOVE],
        950: [MOVE],
        1000: [MOVE],
        1050: [MOVE],
        1100: [MOVE],
        1150: [MOVE],
        1200: [MOVE],
        1250: [MOVE],
        1300: [MOVE],
        1350: [MOVE],
        1400: [MOVE],
        1450: [MOVE],
        1500: [MOVE],
        1550: [MOVE],
        1600: [MOVE],
        1650: [MOVE],
        1700: [MOVE],
        1750: [MOVE],
        1800: [MOVE]
    },
    priority: 5
};

const sourceBotConfig = {
    role: "sourceBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, WORK, CARRY, MOVE],
        450: [WORK, WORK, WORK, CARRY, MOVE, MOVE],
        500: [WORK, WORK, WORK, WORK, CARRY, MOVE],
        550: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
        600: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        650: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
        700: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        750: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
        800: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
        850: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        900: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE],
        950: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1000: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1050: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1100: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1150: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1200: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1250: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1300: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1350: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1400: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1450: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1500: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1550: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1650: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1700: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1750: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1800: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ]
    },
    priority: (Object.values(Game.creeps).filter(creep => creep.memory.role === "sourceBot").length > 0 && 2) || 1
};

const transportBotConfig = {
    role: "transportBot",
    parts: {
        300: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        350: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        400: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        450: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        500: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        550: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        600: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        650: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, CARRY, MOVE, MOVE, MOVE],
        700: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        750: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE, CARRY, MOVE, MOVE],
        800: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
        850: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE],
        900: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        950: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1000: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1050: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1100: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1150: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE
        ],
        1200: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1250: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1300: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1350: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1400: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1450: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1500: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1550: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1600: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1650: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1700: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ],
        1750: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            MOVE
        ],
        1800: [
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE,
            CARRY,
            MOVE
        ]
    },
    priority: 2
};

const upgradeBotConfig = {
    count: 1,
    role: "upgradeBot",
    parts: {
        300: [WORK, WORK, CARRY, MOVE],
        350: [WORK, WORK, CARRY, MOVE, MOVE],
        400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        450: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        500: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        550: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        600: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        650: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        700: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        750: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        800: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        850: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        900: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        950: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1000: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1050: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1100: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        1150: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1200: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        1250: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1300: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1350: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1400: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1450: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1500: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1550: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1600: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1650: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1700: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1750: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ],
        1800: [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
        ]
    },
    priority: 3
};

const botConfig = {
    sourceBots: sourceBotConfig,
    transportBots: transportBotConfig,
    upgradeBots: upgradeBotConfig,
    buildBots: buildBotConfig,
    explorerBots: explorerBotConfig
};

const linkConfig = {
    development: {
        "65ae3b6de36c9a007e578295": {
            mode: "send"
        },
        "65ae3b66e4e5fd009379816c": {
            mode: "receive"
        }
    },
    staging: {},
    production: {}
};

var LogVerbosity;
(function (LogVerbosity) {
    LogVerbosity[LogVerbosity["Debug"] = 1] = "Debug";
    LogVerbosity[LogVerbosity["Info"] = 2] = "Info";
    LogVerbosity[LogVerbosity["Warn"] = 3] = "Warn";
    LogVerbosity[LogVerbosity["Error"] = 4] = "Error";
})(LogVerbosity || (LogVerbosity = {}));

const logConfig = {
    verbosity: LogVerbosity.Debug
};

const roomConfig = {
    development: {
        roomsToMine: ["W8N2"]
    },
    staging: {
        roomsToMine: ["W8N2"]
    },
    production: {
        roomsToMine: []
    }
};

// @ts-expect-error generatePixel is only available in production
if (Game.cpu.generatePixel) {
    global.environment = "production";
}
else {
    global.environment = "development";
}
const userConfig = {
    bots: botConfig,
    rooms: roomConfig[global.environment],
    logging: logConfig,
    links: linkConfig[global.environment]
};
const config = {
    bots: userConfig.bots,
    rooms: userConfig.rooms,
    logging: userConfig.logging,
    links: userConfig.links
};

const log = {
    debug(message) {
        if (config.logging.verbosity > LogVerbosity.Debug)
            return;
        console.log(`[LOG][DEBUG]> ${JSON.stringify(message, null, 2)}`);
    },
    info(message) {
        if (config.logging.verbosity > LogVerbosity.Info)
            return;
        console.log(`[LOG][INFO]> ${JSON.stringify(message, null, 2)}`);
    }
};

class Bot {
    constructor() {
        this.memory = {};
        this.parts = {};
    }
    harvestSource(bot) {
        const source = Game.getObjectById(this.memory.params.sourceId);
        if (bot.harvest(source) === ERR_NOT_IN_RANGE) {
            bot.moveTo(source);
        }
    }
    pickupResource(bot, resource) {
        const pickupResult = bot.pickup(resource);
        if (pickupResult === ERR_NOT_IN_RANGE) {
            const moveResult = bot.moveTo(resource);
            if (moveResult !== OK) {
                log.info(`${bot.name} suffered ${moveResult} while moving`);
            }
        }
        else if (pickupResult !== OK) {
            log.info(`${bot.name} suffered ${pickupResult} while picking up`);
        }
    }
    dropOffResource(bot, structure, resource) {
        const transferResult = bot.transfer(structure, resource);
        if (transferResult === ERR_NOT_IN_RANGE) {
            const moveResult = bot.moveTo(structure);
            if (moveResult !== OK) {
                log.info(`${bot.name} suffered ${moveResult} while moving`);
            }
        }
        else if (transferResult !== OK) {
            log.info(`${bot.name} suffered ${transferResult} while dropping ${resource} off at ${structure}`);
        }
    }
    pickupEnergy(bot) {
        const droppedEnergy = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.droppedResources).sort(([, droppedResourceA], [, droppedResourceB]) => droppedResourceB.amount - droppedResourceA.amount);
        if (droppedEnergy[0]) {
            this.pickupResource(bot, Game.getObjectById(droppedEnergy[0][0]));
        }
    }
    withdrawEnergy(bot, structure) {
        const withdrawResult = bot.withdraw(structure, RESOURCE_ENERGY);
        if (withdrawResult === ERR_NOT_IN_RANGE) {
            bot.moveTo(structure);
        }
    }
    scavengeEnergyFromRuin(bot) {
        // const ruins = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.ruins)
        //     .sort(([, ruinA], [, ruinB]) => ruinA.contents[RESOURCE_ENERGY] - ruinB.contents[RESOURCE_ENERGY]
        //     )
        // const ruinId = ruins[0][0] as Id<Ruin>
        const ruins = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.ruins)
            .filter(([, ruinMonitorData]) => ruinMonitorData.contents[RESOURCE_ENERGY] > 0)
            .map(([ruinId]) => Game.getObjectById(ruinId));
        const ruin = bot.pos.findClosestByPath(ruins);
        if (ruin) {
            if (ruin.store[RESOURCE_ENERGY] > 0) {
                this.withdrawEnergy(bot, ruin);
            }
        }
    }
    fetchEnergy(bot) {
        const room = Game.rooms[bot.memory.room];
        if (room) {
            const storage = room.storage;
            if (storage) {
                if (storage.store[RESOURCE_ENERGY] > bot.store.getFreeCapacity()) {
                    this.withdrawEnergy(bot, storage);
                }
            }
            else {
                const ruins = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.ruins);
                if (ruins.length > 0) {
                    this.scavengeEnergyFromRuin(bot);
                }
                else {
                    this.pickupEnergy(bot);
                }
            }
        }
    }
    fillSpawn(bot) {
        const spawnsInRoom = Object.values(Game.spawns)
            .filter(spawn => spawn.room.name == bot.memory.room && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            .sort((spawnA, spawnB) => spawnA.store[RESOURCE_ENERGY] / spawnA.store.getCapacity(RESOURCE_ENERGY) -
            spawnB.store[RESOURCE_ENERGY] / spawnB.store.getCapacity(RESOURCE_ENERGY));
        if (spawnsInRoom.length > 0) {
            this.dropOffResource(bot, spawnsInRoom[0], RESOURCE_ENERGY);
        }
        else {
            const extensionsInRoom = [];
            Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.extensions).forEach(extensionId => {
                extensionsInRoom.push(Game.getObjectById(extensionId));
            });
            const extensionToFill = extensionsInRoom
                .filter(extension => extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                .sort((extensionA, extensionB) => extensionA.store[RESOURCE_ENERGY] - extensionB.store[RESOURCE_ENERGY])[0];
            if (extensionToFill) {
                this.dropOffResource(bot, extensionToFill, RESOURCE_ENERGY);
            }
        }
    }
    recycleBot(bot) {
        const roomSpawn = Object.values(Game.spawns).filter(spawn => spawn.pos.roomName === bot.memory.room)[0];
        const recycleResult = roomSpawn.recycleCreep(bot);
        if (recycleResult === ERR_NOT_IN_RANGE) {
            bot.moveTo(roomSpawn);
        }
    }
    repairStructure(bot, structure) {
        const repairResult = bot.repair(structure);
        if (repairResult === ERR_NOT_IN_RANGE) {
            bot.moveTo(structure);
        }
    }
}

class BuildBot extends Bot {
    constructor(roomName, index) {
        super();
        this.parts = config.bots.buildBots.parts;
        this.priority = config.bots.buildBots.priority;
        this.role = config.bots.buildBots.role;
        this.memory = {
            role: config.bots.buildBots.role,
            params: {},
            room: roomName
        };
        this.name = `bB-${roomName}-${index}`;
    }
    buildConstructionSite(bot) {
        const constructionSiteEntries = Object.entries(Memory.rooms[bot.memory.room].monitoring.construction).sort(([, constructionSiteA], [, constructionSiteB]) => constructionSiteA.progress / constructionSiteA.progressTotal +
            constructionSiteB.progress / constructionSiteB.progressTotal)[0];
        if (constructionSiteEntries) {
            const constructionSiteId = constructionSiteEntries[0];
            if (constructionSiteId) {
                const constructionSite = Game.getObjectById(constructionSiteId);
                log.debug(`BuildBot ${bot.name} is building ${constructionSiteId}`);
                if (constructionSite) {
                    const buildResult = bot.build(constructionSite);
                    if (buildResult == ERR_NOT_IN_RANGE) {
                        bot.moveTo(constructionSite);
                    }
                    else if (buildResult != OK) {
                        log.info(`BuildBot ${bot.name} encountered error ${buildResult} while building ${constructionSiteId}`);
                    }
                }
            }
        }
        else {
            this.recycleBot(bot);
        }
    }
    runBot(bot) {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning";
                return;
            }
        }
        if (bot.store.getFreeCapacity() === bot.store.getCapacity()) {
            bot.memory.status = "pickingUp";
        }
        else if (bot.store.getFreeCapacity() === 0) {
            bot.memory.status = "building";
        }
        switch (bot.memory.status) {
            case "pickingUp":
                this.fetchEnergy(bot);
                break;
            case "building":
                this.buildConstructionSite(bot);
                break;
        }
    }
}

class ExplorerBot extends Bot {
    constructor(roomName, params) {
        super();
        this.parts = config.bots.explorerBots.parts;
        this.priority = config.bots.explorerBots.priority;
        this.role = config.bots.explorerBots.role;
        Object.keys(this.parts).forEach(energyCapacityAvailableIndex => {
            const energyCapacityAvailable = parseInt(energyCapacityAvailableIndex);
            if (params.isClaiming) {
                this.parts[energyCapacityAvailable] = [...this.parts[energyCapacityAvailable], CLAIM];
            }
            if (params.isReserving) {
                this.parts[energyCapacityAvailable] = [...this.parts[energyCapacityAvailable], CLAIM, CLAIM];
            }
        });
        this.memory = {
            role: config.bots.explorerBots.role,
            params,
            room: roomName
        };
        this.name = `eB-${roomName}`;
    }
    runBot(bot) {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning";
                return;
            }
        }
        if (bot.memory.params.isClaiming === true) {
            bot.memory.status = "claiming";
        }
        else if (bot.memory.params.isReserving === true) {
            bot.memory.status = "reserving";
        }
        else {
            bot.memory.status = "exploring";
        }
        switch (bot.memory.status) {
            case "claiming":
                break;
            case "reserving":
                const controllerArray = Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.controller);
                const controllerId = controllerArray[0];
                const controller = Game.getObjectById(controllerId);
                if (controller) {
                    const reserveResult = bot.reserveController(controller);
                    if (reserveResult === ERR_NOT_IN_RANGE) {
                        bot.moveTo(controller);
                    }
                }
                else {
                    bot.moveTo(new RoomPosition(25, 25, bot.memory.room));
                }
                break;
            case "exploring":
                bot.moveTo(new RoomPosition(25, 25, bot.memory.room));
                break;
        }
    }
}

class SourceBot extends Bot {
    constructor(sourceId, room) {
        super();
        this.parts = sourceBotConfig.parts;
        this.priority = sourceBotConfig.priority;
        this.role = sourceBotConfig.role;
        this.memory = {
            role: sourceBotConfig.role,
            room,
            params: {
                sourceId
            }
        };
        this.name = `sB-${sourceId}`;
        this.room = room;
    }
    runBot(bot) {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning";
                return;
            }
        }
        if (bot.store.getFreeCapacity() > 0 || bot.getActiveBodyparts(CARRY) == 0) {
            bot.memory.status = "harvesting";
        }
        else {
            bot.memory.status = "depositing";
            // let spawnsFull: boolean[] = []
            // Object.values(Game.spawns).filter(spawn => spawn.room.name == bot.room.name).forEach((spawn) => {
            //     if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            //         spawnsFull.push(false)
            //     } else {
            //         spawnsFull.push(true)
            //     }
            // })
            // if (spawnsFull.includes(false)) {
            //     bot.memory.status = "depositing"
            // } else {
            //     bot.drop(RESOURCE_ENERGY)
            // }
        }
        switch (bot.memory.status) {
            case "harvesting":
                this.harvestSource(bot);
                break;
            case "depositing":
                const transportBots = Object.values(Game.creeps).filter(transportBot => transportBot.memory.role === "transportBot" &&
                    transportBot.memory.room === bot.memory.room &&
                    transportBot.memory.params.pickup === null &&
                    transportBot.memory.params.dropOff === "spawns");
                if (transportBots.length > 0) {
                    bot.drop(RESOURCE_ENERGY);
                    this.harvestSource(bot);
                }
                else {
                    const spawnsInRoom = Object.values(Game.spawns).filter(spawn => spawn.room.name === bot.room.name);
                    if (spawnsInRoom.length > 0) {
                        this.fillSpawn(bot);
                    }
                    else {
                        bot.drop(RESOURCE_ENERGY);
                        this.harvestSource(bot);
                    }
                }
                break;
        }
    }
}

class TransportBot extends Bot {
    constructor(roomName, params) {
        super();
        this.parts = config.bots.transportBots.parts;
        this.priority = config.bots.transportBots.priority;
        this.role = config.bots.transportBots.role;
        this.memory = {
            role: config.bots.transportBots.role,
            params: {
                pickup: (params.pickup && params.pickup) || null,
                dropOff: (params.dropOff && params.dropOff) || null
            },
            room: roomName
        };
        this.name = `tB-${roomName}`;
        if (params.pickup) {
            this.name = `${this.name}-${params.pickup}`;
        }
        if (params.dropOff) {
            this.name = `${this.name}-${params.dropOff}`;
            if (params.dropOff === "towers" || params.dropOff === "spawns" || params.dropOff === "links") {
                this.priority = this.priority + 2;
            }
        }
    }
    fillTowers(bot) {
        const towers = [];
        Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.towers).forEach(towerId => {
            const tower = Game.getObjectById(towerId);
            if (tower) {
                towers.push(tower);
            }
        });
        const nextTower = towers.sort((towerA, towerB) => towerA.store[RESOURCE_ENERGY] - towerB.store[RESOURCE_ENERGY])[0];
        if (nextTower) {
            this.dropOffResource(bot, nextTower, RESOURCE_ENERGY);
        }
    }
    fillLinks(bot) {
        const links = Object.keys(Memory.rooms[bot.memory.room].monitoring.structures.links).map(linkId => Game.getObjectById(linkId));
        const linksToSend = links.filter(link => Memory.rooms[bot.memory.room].analysis.links[link.id].mode === "send");
        const linkToFill = linksToSend.sort((linkA, linkB) => linkA.store[RESOURCE_ENERGY] - linkB.store[RESOURCE_ENERGY])[0];
        if (linkToFill) {
            this.dropOffResource(bot, linkToFill, RESOURCE_ENERGY);
        }
    }
    runBot(bot) {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning";
                return;
            }
        }
        if (bot.store.getFreeCapacity() === bot.store.getCapacity()) {
            bot.memory.status = "pickingUp";
        }
        else if (bot.store.getFreeCapacity() === 0) {
            bot.memory.status = "droppingOff";
        }
        switch (bot.memory.status) {
            case "pickingUp":
                if (bot.memory.params.pickup != null) {
                    if (bot.memory.params.pickup === "loot") {
                        if (bot.pos.roomName !== bot.memory.room) {
                            const droppedEnergy = Object.entries(Memory.rooms[bot.memory.room].monitoring.resources.droppedResources).sort(([, droppedResourceA], [, droppedResourceB]) => droppedResourceB.amount - droppedResourceA.amount);
                            if (droppedEnergy.length > 0) {
                                bot.moveTo(Game.getObjectById(droppedEnergy[0][0]));
                            }
                            else {
                                bot.moveTo(new RoomPosition(25, 25, bot.memory.room));
                            }
                        }
                        else {
                            this.pickupEnergy(bot);
                        }
                    }
                }
                else {
                    this.fetchEnergy(bot);
                }
                break;
            case "droppingOff":
                if (bot.memory.params.dropOff != null) {
                    if (bot.memory.params.dropOff === "towers") {
                        this.fillTowers(bot);
                    }
                    else if (bot.memory.params.dropOff === "spawns") {
                        this.fillSpawn(bot);
                    }
                    else if (bot.memory.params.dropOff === "links") {
                        this.fillLinks(bot);
                    }
                    else {
                        const dropOff = Game.getObjectById(bot.memory.params.dropOff);
                        if (dropOff) {
                            this.dropOffResource(bot, dropOff, RESOURCE_ENERGY);
                        }
                    }
                }
                else {
                    this.fillSpawn(bot);
                }
                break;
        }
    }
}

class UpgradeBot extends Bot {
    constructor(controllerId, roomName, index) {
        super();
        this.parts = config.bots.upgradeBots.parts;
        this.priority = config.bots.upgradeBots.priority;
        this.role = config.bots.upgradeBots.role;
        this.memory = {
            role: config.bots.upgradeBots.role,
            params: {
                controllerId
            },
            room: roomName
        };
        this.name = `uB-${controllerId}-${index}`;
    }
    upgradeController(bot) {
        const controller = Game.getObjectById(bot.memory.params.controllerId);
        if (controller) {
            const upgradeResult = bot.upgradeController(controller);
            if (upgradeResult === ERR_NOT_IN_RANGE) {
                bot.moveTo(controller);
            }
        }
    }
    checkForLinks(bot) {
        const room = Game.rooms[bot.memory.room];
        let nearbyLink;
        if (room) {
            if (room.controller) {
                const linksInRoom = Object.keys(Memory.rooms[room.name].monitoring.structures.links).map(linkId => Game.getObjectById(linkId));
                const linksToRecieve = linksInRoom.filter(link => Memory.rooms[room.name].analysis.links[link.id].mode === "receive");
                linksToRecieve.forEach(link => {
                    if (link.pos.inRangeTo(room.controller.pos, 3)) {
                        nearbyLink = link;
                    }
                });
            }
        }
        return nearbyLink;
    }
    runBot(bot) {
        if (!bot.memory.status) {
            if (bot.spawning) {
                bot.memory.status = "spawning";
                return;
            }
        }
        if (bot.store.getFreeCapacity() === bot.store.getCapacity()) {
            bot.memory.status = "pickingUp";
        }
        else if (bot.store.getFreeCapacity() === 0) {
            bot.memory.status = "upgrading";
        }
        switch (bot.memory.status) {
            case "pickingUp":
                const nearbyLink = this.checkForLinks(bot);
                if (nearbyLink) {
                    const withdrawResult = bot.withdraw(nearbyLink, RESOURCE_ENERGY);
                    if (withdrawResult === ERR_NOT_IN_RANGE) {
                        bot.moveTo(nearbyLink);
                    }
                }
                else {
                    this.fetchEnergy(bot);
                }
                break;
            case "upgrading":
                this.upgradeController(bot);
                break;
        }
    }
}

function actionBots() {
    Object.values(Game.creeps).forEach(creep => {
        switch (creep.memory.role) {
            case "sourceBot":
                const sourceBot = new SourceBot(creep.memory.params.sourceId, creep.memory.room);
                sourceBot.runBot(creep);
                break;
            case "upgradeBot":
                const upgradeBot = new UpgradeBot(creep.memory.params.controllerId, creep.memory.room, 0);
                upgradeBot.runBot(creep);
                break;
            case "buildBot":
                const buildBot = new BuildBot(creep.memory.room, 0);
                buildBot.runBot(creep);
                break;
            case "transportBot":
                const transportBot = new TransportBot(creep.memory.room, {});
                transportBot.runBot(creep);
                break;
            case "explorerBot":
                const explorerBot = new ExplorerBot(creep.memory.room, {
                    isClaiming: creep.memory.params.isClaiming,
                    isReserving: creep.memory.params.isReserving
                });
                explorerBot.runBot(creep);
                break;
            default:
                log.info(`Creep ${creep.name} has invalid role ${creep.memory.role}`);
                break;
        }
    });
}

function getOwnedRooms() {
    return Object.keys(Game.rooms).filter(roomName => { var _a; return Game.rooms[roomName].controller && ((_a = Game.rooms[roomName].controller) === null || _a === void 0 ? void 0 : _a.my); });
}
function findClosestStorage(roomName) {
    const storages = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_STORAGE);
    const storageMatrix = {};
    storages.forEach(storage => {
        const distanceFromStorage = Game.map.getRoomLinearDistance(roomName, storage.room.name);
        storageMatrix[storage.id] = distanceFromStorage;
    });
    const sortedStorageMatrix = Object.entries(storageMatrix).sort(([, a], [, b]) => a - b);
    if (sortedStorageMatrix.length > 0) {
        return sortedStorageMatrix[0][0];
    }
    return;
}
function findClosestSpawn(roomName) {
    const spawns = Object.values(Game.spawns).filter(spawn => spawn.room.name === roomName);
    if (spawns.length > 0) {
        return spawns[0];
    }
    else {
        const spawnMatrix = {};
        Object.values(Game.spawns).forEach(spawn => {
            const distanceFromSpawn = Game.map.getRoomLinearDistance(roomName, spawn.room.name);
            spawnMatrix[spawn.name] = distanceFromSpawn;
        });
        const sortedSpawnMatrix = Object.entries(spawnMatrix).sort(([, a], [, b]) => a - b);
        const spawnName = sortedSpawnMatrix[0][0];
        return Game.spawns[spawnName];
    }
}

function clearBadSpawnRequests() {
    Object.entries(Memory.analysis.queues.spawn)
        .filter(([, spawnEntry]) => spawnEntry.parts === undefined)
        .forEach(([botName]) => {
        delete Memory.analysis.queues.spawn[botName];
    });
}
function processSpawnedCreeps() {
    Object.entries(Memory.analysis.queues.spawn)
        .filter(([, spawnEntry]) => {
        spawnEntry.status === "spawning";
    })
        .forEach(([botName]) => {
        if (Game.creeps[botName]) {
            if (Game.creeps[botName].id !== undefined) {
                delete Memory.analysis.queues.spawn[botName];
            }
        }
    });
}
function processNewSpawnRequests() {
    const spawnQueue = Object.entries(Memory.analysis.queues.spawn)
        .filter(([, botData]) => botData.status === "new")
        .sort(([, a], [, b]) => a.priority - b.priority);
    if (spawnQueue.length === 0) {
        return;
    }
    const botName = spawnQueue[0][0];
    const botData = spawnQueue[0][1];
    const spawns = Object.values(Game.spawns).filter(spawn => spawn.room.name === botData.room && !spawn.spawning);
    let spawn;
    let parts;
    if (spawns.length) {
        spawn = spawns[0];
        parts = botData.parts;
    }
    else {
        spawn = findClosestSpawn(botData.memory.room);
        parts = config.bots[`${botData.memory.role}s`].parts[spawn.room.energyCapacityAvailable];
    }
    // console.log(`${parts}, ${botData.name}, ${{ memory: botData.memory }}`);
    const spawnResult = spawn.spawnCreep(parts, botData.name, { memory: botData.memory });
    log.info(`Spawning ${botName} in ${botData.room} with result ${spawnResult}`);
    if (spawnResult === OK) {
        Memory.analysis.queues.spawn[botName].status = "spawning";
    }
}
function processSpawnQueue() {
    clearBadSpawnRequests();
    processNewSpawnRequests();
    processSpawnedCreeps();
}
function actionSpawns() {
    processSpawnQueue();
}

function actionTowers(roomName) {
    const towers = [];
    Object.keys(Memory.rooms[roomName].monitoring.structures.towers).forEach(towerId => {
        const tower = Game.getObjectById(towerId);
        if (tower) {
            towers.push(tower);
        }
    });
    const hostilesInRoom = [];
    Object.keys(Memory.rooms[roomName].monitoring.hostiles).forEach(hostileId => {
        const hostile = Game.getObjectById(hostileId);
        if (hostile) {
            hostilesInRoom.push(hostile);
        }
    });
    if (hostilesInRoom.length > 0) {
        let target = hostilesInRoom[0];
        const hostilesWithHeal = hostilesInRoom.filter(hostile => {
            return hostile.getActiveBodyparts(HEAL) > 0;
        });
        if (hostilesWithHeal.length > 0) {
            target = hostilesWithHeal[0];
        }
        towers.forEach(tower => {
            if (target) {
                tower.attack(target);
            }
        });
    }
    const roadsInDisrepair = Object.keys(Memory.rooms[roomName].monitoring.structures.roads)
        .map(roadId => Game.getObjectById(roadId))
        .filter(road => road && road.hits < road.hitsMax);
    const containersInDisrepair = [];
    const structuresInDisrepair = [...roadsInDisrepair, ...containersInDisrepair];
    if (structuresInDisrepair.length > 0) {
        towers.forEach(tower => {
            const target = structuresInDisrepair.sort((structureA, structureB) => structureA.hits / structureA.hitsMax - structureB.hits / structureB.hitsMax)[0];
            tower.repair(target);
        });
    }
}

function actionLinks(roomName) {
    const linksInRoom = Object.keys(Memory.rooms[roomName].monitoring.structures.links).map(linkId => Game.getObjectById(linkId));
    const linksToSend = linksInRoom.filter(link => Memory.rooms[roomName].analysis.links[link.id].mode === "send");
    const linksToRecieve = linksInRoom.filter(link => Memory.rooms[roomName].analysis.links[link.id].mode === "receive");
    const nextLinkToSendFrom = linksToSend.sort((linkA, linkB) => linkA.store[RESOURCE_ENERGY] - linkB.store[RESOURCE_ENERGY])[0];
    const nextLinkToSendTo = linksToRecieve.sort((linkA, linkB) => linkA.store[RESOURCE_ENERGY] - linkB.store[RESOURCE_ENERGY])[0];
    if (nextLinkToSendFrom && nextLinkToSendTo) {
        if (nextLinkToSendFrom.cooldown === 0) {
            nextLinkToSendFrom.transferEnergy(nextLinkToSendTo);
        }
    }
}

function actionPhase() {
    actionSpawns();
    actionBots();
    const roomsToAction = [...getOwnedRooms()];
    roomsToAction.forEach(roomName => {
        actionTowers(roomName);
        actionLinks(roomName);
    });
}

function buildSourceAnalysisMemory(roomName) {
    log.debug(`Building Source Analysis Memory for ${roomName}`);
    if (Memory.rooms[roomName].analysis.sources === undefined) {
        Memory.rooms[roomName].analysis.sources = {};
    }
}
function buildSourceAnalysisEntryMemory(roomName) {
    log.debug(`Building Source Analysis Entry Memory for ${roomName}`);
    Object.entries(Memory.rooms[roomName].monitoring.structures.sources).forEach(([sourceId, sourceData]) => {
        log.debug(`Analysing source ${sourceId} in room ${roomName}`);
        if (!Memory.rooms[roomName].analysis.sources[sourceId]) {
            Memory.rooms[roomName].analysis.sources[sourceId] = {
                assignedBot: null
            };
        }
    });
}
function createSourceBotJobs(roomName) {
    Object.entries(Memory.rooms[roomName].analysis.sources).forEach(([sourceId, sourceData]) => {
        if (sourceData.assignedBot === null) {
            const sourceBot = new SourceBot(sourceId, roomName);
            const parts = (Object.values(Game.creeps).filter(creep => creep.memory.room === roomName).length > 0 &&
                sourceBot.parts[Game.rooms[roomName].energyCapacityAvailable]) ||
                sourceBot.parts[Game.rooms[roomName].energyAvailable];
            if (!Memory.analysis.queues.spawn[sourceBot.name] ||
                Memory.analysis.queues.spawn[sourceBot.name].parts !== parts) {
                Memory.analysis.queues.spawn[sourceBot.name] = {
                    name: sourceBot.name,
                    room: roomName,
                    priority: sourceBot.priority,
                    parts,
                    memory: sourceBot.memory,
                    status: "new"
                };
            }
        }
    });
}
function assignSourceBotJobs(roomName) {
    Object.keys(Memory.rooms[roomName].monitoring.structures.sources).forEach(sourceId => {
        const sourceBot = new SourceBot(sourceId, roomName);
        if (Game.creeps[sourceBot.name]) {
            Memory.rooms[roomName].analysis.sources[sourceId].assignedBot = sourceBot.name;
            delete Memory.analysis.queues.spawn[sourceBot.name];
        }
        else {
            Memory.rooms[roomName].analysis.sources[sourceId].assignedBot = null;
        }
    });
}
function analyseSources(roomName) {
    log.debug(`Analysing sources in room ${roomName}`);
    buildSourceAnalysisMemory(roomName);
    buildSourceAnalysisEntryMemory(roomName);
    createSourceBotJobs(roomName);
    assignSourceBotJobs(roomName);
}

function createTransportBotJobs(roomName) {
    let storageId;
    const storageArray = Object.keys(Memory.rooms[roomName].monitoring.structures.storage)
        .map(storageId => Game.getObjectById(storageId))
        .filter(storage => storage);
    if (storageArray.length > 0) {
        storageId = storageArray[0].id;
    }
    else {
        storageId = findClosestStorage(roomName);
    }
    if (storageId) {
        const transportBot = new TransportBot(roomName, { pickup: "loot", dropOff: storageId });
        Memory.analysis.queues.spawn[transportBot.name] = {
            name: transportBot.name,
            room: roomName,
            parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            priority: transportBot.priority,
            memory: transportBot.memory,
            status: "new"
        };
    }
}
function analyseDroppedResources(roomName) {
    if (Object.values(Memory.rooms[roomName].monitoring.resources.droppedResources).length > 0) {
        let storageId;
        const storageArray = Object.keys(Memory.rooms[roomName].monitoring.structures.storage)
            .map(storageId => Game.getObjectById(storageId))
            .filter(storage => storage);
        if (storageArray.length > 0) {
            storageId = storageArray[0].id;
        }
        else {
            storageId = findClosestStorage(roomName);
        }
        if (storageId) {
            const transportBot = new TransportBot(roomName, { pickup: "loot", dropOff: storageId });
            if (!Game.creeps[transportBot.name]) {
                createTransportBotJobs(roomName);
            }
            else {
                delete Memory.analysis.queues.spawn[transportBot.name];
            }
        }
    }
    else {
        Object.entries(Memory.analysis.queues.spawn)
            .filter(([, spawnQueueEntry]) => spawnQueueEntry.memory.role === "transportBot" &&
            spawnQueueEntry.memory.params.pickup === "loot" &&
            spawnQueueEntry.memory.room === roomName)
            .forEach(([spawnQueueEntryName]) => {
            delete Memory.analysis.queues.spawn[spawnQueueEntryName];
        });
    }
}

function analyseResources(roomName) {
    analyseDroppedResources(roomName);
}

function buildControllerMemory(roomName) {
    if (!Memory.rooms[roomName].analysis.controller) {
        Memory.rooms[roomName].analysis.controller = {};
    }
}
function manageUpgradeBotJobs(roomName) {
    const controllerId = Object.keys(Memory.rooms[roomName].monitoring.structures.controller)[0];
    const controller = Game.getObjectById(controllerId);
    if (!controller) {
        return;
    }
    if (!controller.my) {
        return;
    }
    Object.keys(Memory.rooms[roomName].monitoring.structures.controller).forEach(controllerId => {
        const upgradeBotCount = config.bots.upgradeBots.count;
        for (let i = 1; i <= upgradeBotCount; i++) {
            const upgradeBot = new UpgradeBot(controllerId, roomName, i);
            if (!Memory.analysis.queues.spawn[upgradeBot.name]) {
                if (!Memory.analysis.queues.spawn[upgradeBot.name]) {
                    Memory.analysis.queues.spawn[upgradeBot.name] = {
                        name: upgradeBot.name,
                        room: roomName,
                        priority: upgradeBot.priority,
                        parts: upgradeBot.parts[Game.rooms[roomName].energyCapacityAvailable],
                        memory: upgradeBot.memory,
                        status: "new"
                    };
                }
                else {
                    delete Memory.analysis.queues.spawn[upgradeBot.name];
                }
            }
        }
    });
}
function analyseController(roomName) {
    log.debug(`Analysing controller in room ${roomName}`);
    buildControllerMemory(roomName);
    manageUpgradeBotJobs(roomName);
}

function createBuildBotJobs(roomName, index) {
    const buildBot = new BuildBot(roomName, index);
    if (!Memory.analysis.queues.spawn[buildBot.name]) {
        Memory.analysis.queues.spawn[buildBot.name] = {
            name: buildBot.name,
            room: roomName,
            parts: buildBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            priority: buildBot.priority,
            memory: buildBot.memory,
            status: "new"
        };
    }
}
function deleteBuildBotJobs(roomName, index) {
    const buildBot = new BuildBot(roomName, index);
    if (Memory.analysis.queues.spawn[buildBot.name]) {
        delete Memory.analysis.queues.spawn[buildBot.name];
    }
}
function analyseConstruction(roomName) {
    const buildBotCount = Math.round(Object.keys(Memory.rooms[roomName].monitoring.construction).length / 3);
    if (buildBotCount > 0) {
        for (let index = 1; index <= buildBotCount; index++) {
            const buildBot = new BuildBot(roomName, index);
            if (Object.keys(Memory.rooms[roomName].monitoring.construction).length > 0) {
                if (Game.creeps[buildBot.name]) {
                    deleteBuildBotJobs(roomName, index);
                }
                else {
                    createBuildBotJobs(roomName, index);
                }
            }
            else {
                deleteBuildBotJobs(roomName, index);
            }
        }
    }
    else {
        Object.entries(Memory.analysis.queues.spawn)
            .filter(([, spawnQueueEntry]) => spawnQueueEntry.memory.role === "buildBot")
            .forEach(([spawnQueueEntryName]) => {
            delete Memory.analysis.queues.spawn[spawnQueueEntryName];
        });
    }
}

function createTransportBotJob(roomName) {
    const transportBot = new TransportBot(roomName, {
        dropOff: "towers"
    });
    if (!Game.creeps[transportBot.name]) {
        Memory.analysis.queues.spawn[transportBot.name] = {
            name: transportBot.name,
            room: roomName,
            priority: transportBot.priority,
            parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            memory: transportBot.memory,
            status: "new"
        };
    }
    else {
        delete Memory.analysis.queues.spawn[transportBot.name];
    }
}
function analyseTowers(roomName) {
    const towersInRoom = Object.keys(Memory.rooms[roomName].monitoring.structures.towers);
    if (towersInRoom.length > 0) {
        createTransportBotJob(roomName);
    }
}

function analyseStorage(roomName) {
    const storage = Object.keys(Memory.rooms[roomName].monitoring.structures.storage)
        .map(storageId => Game.getObjectById(storageId))
        .filter(storage => storage);
    if (storage.length > 0) ;
}

function buildLinkAnalysisMemory(roomName) {
    if (!Memory.rooms[roomName].analysis.links) {
        Memory.rooms[roomName].analysis.links = {};
    }
}
function setLinkConfig(roomName, link) {
    const linkConfig = config.links[link.id];
    if (linkConfig) {
        Memory.rooms[roomName].analysis.links[link.id] = {
            mode: linkConfig.mode
        };
    }
}
function createLinkTransportJob(roomName) {
    const linkTransportBot = new TransportBot(roomName, { dropOff: "links" });
    if (!Game.creeps[linkTransportBot.name]) {
        Memory.analysis.queues.spawn[linkTransportBot.name] = {
            name: linkTransportBot.name,
            room: roomName,
            priority: linkTransportBot.priority,
            parts: linkTransportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
            memory: linkTransportBot.memory,
            status: "new"
        };
    }
    else {
        delete Memory.analysis.queues.spawn[linkTransportBot.name];
    }
}
function analyseLinks(roomName) {
    buildLinkAnalysisMemory(roomName);
    const linksInRoom = Object.keys(Memory.rooms[roomName].monitoring.structures.links).map(linkId => Game.getObjectById(linkId));
    linksInRoom.forEach(link => {
        setLinkConfig(roomName, link);
    });
    const linksToSend = linksInRoom.filter(link => Memory.rooms[roomName].analysis.links[link.id].mode === "send");
    if (linksToSend.length > 0) {
        createLinkTransportJob(roomName);
    }
}

function buildRoomAnalysisMemory(roomName) {
    log.debug(`Building Room Analysis Memory for ${roomName}`);
    if (Memory.rooms[roomName].analysis === undefined) {
        Memory.rooms[roomName].analysis = {};
    }
}
function analyseRoom(roomName) {
    log.debug(`Analysing room ${roomName}`);
    buildRoomAnalysisMemory(roomName);
    analyseSources(roomName);
    analyseResources(roomName);
    analyseStorage(roomName);
    analyseController(roomName);
    analyseConstruction(roomName);
    analyseTowers(roomName);
    analyseLinks(roomName);
}

function buildSpawnQueueMemory() {
    log.debug("Building Spawn Queue Memory");
    if (!Memory.analysis.queues.spawn) {
        Memory.analysis.queues.spawn = {};
    }
}
function createSpawnTransportBotJobs() {
    const roomNames = Object.values(Game.spawns).map(spawn => spawn.room.name);
    roomNames.forEach(roomName => {
        const transportBot = new TransportBot(roomName, {
            dropOff: "spawns"
        });
        if (!Game.creeps[transportBot.name]) {
            Memory.analysis.queues.spawn[transportBot.name] = {
                name: transportBot.name,
                room: roomName,
                priority: (Object.values(Game.creeps).filter(bot => bot.memory.role === "sourceBot" && bot.memory.room === roomName)
                    .length > 0 &&
                    1) ||
                    transportBot.priority,
                parts: transportBot.parts[Game.rooms[roomName].energyCapacityAvailable],
                memory: transportBot.memory,
                status: "new"
            };
        }
        else {
            delete Memory.analysis.queues.spawn[transportBot.name];
        }
    });
}
function analyseSpawning() {
    log.debug("Analysing Spawns");
    buildSpawnQueueMemory();
    createSpawnTransportBotJobs();
    //
}

function buildAnalysisMemory() {
    log.debug("Building Analysis Memory");
    if (!Memory.analysis) {
        Memory.analysis = {
            queues: {}
        };
    }
    if (!Memory.analysis.queues) {
        Memory.analysis.queues = {};
    }
}
function analysisPhase() {
    log.debug("Running Analysis Phase");
    buildAnalysisMemory();
    analyseSpawning();
    const roomsToAnalyse = [...getOwnedRooms()];
    config.rooms.roomsToMine.forEach(roomName => {
        if (Game.rooms[roomName]) {
            roomsToAnalyse.push(roomName);
        }
    });
    roomsToAnalyse.forEach(roomName => {
        analyseRoom(roomName);
    });
}

function buildSourceMonitorMemory(roomName) {
    log.debug(`Building source monitor memory for ${roomName}`);
    if (!Memory.rooms[roomName].monitoring.structures.sources) {
        Memory.rooms[roomName].monitoring.structures.sources = {};
    }
}
function monitorSources(roomName) {
    log.debug(`Monitoring sources in ${roomName}`);
    buildSourceMonitorMemory(roomName);
    const room = Game.rooms[roomName];
    const sources = room.find(FIND_SOURCES);
    Object.values(sources).forEach(source => {
        log.debug(`Monitoring source ${source.id} in ${roomName}`);
        const sourceMonitorEntry = {
            energy: source.energy,
            energyCapacity: source.energyCapacity,
            regenTime: source.ticksToRegeneration || 300
        };
        Memory.rooms[roomName].monitoring.structures.sources[source.id] = sourceMonitorEntry;
    });
}

function buildStructureMonitorMemory$1(roomName) {
    log.debug(`Building structure monitor memory for ${roomName}`);
    if (!Memory.rooms[roomName].monitoring.structures.controller) {
        Memory.rooms[roomName].monitoring.structures.controller = {};
    }
}
function monitorController(roomName) {
    log.debug(`Monitoring controller in ${roomName}`);
    buildStructureMonitorMemory$1(roomName);
    if (Game.rooms[roomName].controller) {
        Memory.rooms[roomName].monitoring.structures.controller[Game.rooms[roomName].controller.id] = {
            progress: Game.rooms[roomName].controller.progress,
            nextLevel: Game.rooms[roomName].controller.progressTotal,
            rcl: Game.rooms[roomName].controller.level,
            downgrade: Game.rooms[roomName].controller.ticksToDowngrade,
            safeMode: (Game.rooms[roomName].controller.safeMode && Game.rooms[roomName].controller.safeMode) || null
        };
    }
}

function buildExtensionMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.extensions) {
        Memory.rooms[roomName].monitoring.structures.extensions = {};
    }
}
function monitorExtensions(roomName) {
    buildExtensionMonitorMemory(roomName);
    Object.values(Game.structures)
        .filter(structure => structure.structureType === STRUCTURE_EXTENSION && structure.pos.roomName === roomName)
        .forEach(extension => {
        const typedExtension = extension;
        Memory.rooms[roomName].monitoring.structures.extensions[typedExtension.id] = {
            energy: typedExtension.store[RESOURCE_ENERGY],
            energyCapacity: typedExtension.store.getCapacity(RESOURCE_ENERGY)
        };
    });
}

function buildStorageMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.storage) {
        Memory.rooms[roomName].monitoring.structures.storage = {};
    }
}
function monitorStorage(roomName) {
    buildStorageMonitorMemory(roomName);
    const storage = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_STORAGE && structure.room.name === roomName);
    storage.forEach(storage => {
        Memory.rooms[roomName].monitoring.structures.storage[storage.id] = {
            contents: storage.store
        };
    });
}

function buildTowerMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.towers) {
        Memory.rooms[roomName].monitoring.structures.towers = {};
    }
}
function monitorTowers(roomName) {
    buildTowerMonitorMemory(roomName);
    const towers = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_TOWER && structure.room.name === roomName);
    towers.forEach(tower => {
        Memory.rooms[roomName].monitoring.structures.towers[tower.id] = {
            energy: tower.store[RESOURCE_ENERGY]
        };
    });
}

function buildContainerMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.containers) {
        Memory.rooms[roomName].monitoring.structures.containers = {};
    }
}
function monitorContainers(roomName) {
    buildContainerMonitorMemory(roomName);
    const room = Game.rooms[roomName];
    if (room) {
        const containers = room.find(FIND_STRUCTURES, {
            filter: structure => structure.structureType === STRUCTURE_CONTAINER
        });
        containers.forEach(container => {
            if (!Memory.rooms[roomName].monitoring.structures.containers[container.id]) {
                Memory.rooms[roomName].monitoring.structures.containers[container.id] = {
                    hits: container.hits,
                    hitsMax: container.hitsMax,
                    decayTime: container.ticksToDecay,
                    contents: container.store
                };
            }
        });
    }
}

function buildRoadMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.roads) {
        Memory.rooms[roomName].monitoring.structures.roads = {};
    }
}
function monitorRoads(roomName) {
    buildRoadMonitorMemory(roomName);
    let roads = [];
    const room = Game.rooms[roomName];
    if (room) {
        Object.keys(Memory.rooms[roomName].monitoring.structures.roads).forEach(roadId => {
            if (!Game.getObjectById(roadId)) {
                delete Memory.rooms[roomName].monitoring.structures.roads[roadId];
            }
        });
        roads = room.find(FIND_STRUCTURES, { filter: structure => structure.structureType === STRUCTURE_ROAD });
    }
    roads.forEach(road => {
        Memory.rooms[roomName].monitoring.structures.roads[road.id] = {
            hits: road.hits,
            hitsMax: road.hitsMax,
            decayTime: road.ticksToDecay
        };
    });
}

function buildLinkMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.links) {
        Memory.rooms[roomName].monitoring.structures.links = {};
    }
}
function monitorLinks(roomName) {
    buildLinkMonitorMemory(roomName);
    const linksInRoom = Object.values(Game.structures).filter(structure => structure.structureType === STRUCTURE_LINK && structure.pos.roomName === roomName);
    linksInRoom.forEach(link => {
        Memory.rooms[roomName].monitoring.structures.links[link.id] = {
            energy: link.store[RESOURCE_ENERGY],
            energyCapacity: link.store.getCapacity(RESOURCE_ENERGY),
            cooldown: link.cooldown
        };
    });
}

function buildSpawnMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.structures.spawns) {
        Memory.rooms[roomName].monitoring.structures.spawns = {};
    }
}
function monitorSpawns(roomName) {
    buildSpawnMonitorMemory(roomName);
    Object.values(Game.spawns)
        .filter(spawn => spawn.pos.roomName === roomName)
        .forEach(spawn => {
        Memory.rooms[roomName].monitoring.structures.spawns[spawn.id] = {
            energy: spawn.store[RESOURCE_ENERGY],
            energyCapacity: spawn.store.getCapacity(RESOURCE_ENERGY),
            spawning: (spawn.spawning && 1) || 0
        };
    });
}

function buildStructureMonitorMemory(roomName) {
    log.debug(`Building structure monitor memory for ${roomName}`);
    if (!Memory.rooms[roomName].monitoring.structures) {
        Memory.rooms[roomName].monitoring.structures = {};
    }
}
function monitorStructures(roomName) {
    log.debug(`Monitoring structures in ${roomName}`);
    buildStructureMonitorMemory(roomName);
    monitorSources(roomName);
    monitorSpawns(roomName);
    monitorController(roomName);
    monitorExtensions(roomName);
    monitorStorage(roomName);
    monitorTowers(roomName);
    monitorContainers(roomName);
    monitorRoads(roomName);
    monitorLinks(roomName);
}

function buildDroppedResourceMonitorMemory(roomName) {
    log.debug(`Building dropped resource monitor memory for ${roomName}`);
    if (!Memory.rooms[roomName].monitoring.resources.droppedResources) {
        Memory.rooms[roomName].monitoring.resources.droppedResources = {};
    }
}
function cleanDroppedResourceMonitoring(roomName) {
    Object.keys(Memory.rooms[roomName].monitoring.resources.droppedResources).forEach(droppedResourceId => {
        if (Game.getObjectById(droppedResourceId) === null) {
            delete Memory.rooms[roomName].monitoring.resources.droppedResources[droppedResourceId];
        }
    });
}
function documentDroppedResources(roomName) {
    Object.values(Game.rooms[roomName].find(FIND_DROPPED_RESOURCES)).forEach(droppedResource => {
        Memory.rooms[roomName].monitoring.resources.droppedResources[droppedResource.id] = {
            resourceType: droppedResource.resourceType,
            pos: droppedResource.pos,
            amount: droppedResource.amount
        };
    });
}
function monitorDroppedResources(roomName) {
    log.debug(`Monitoring dropped resources in ${roomName}`);
    buildDroppedResourceMonitorMemory(roomName);
    cleanDroppedResourceMonitoring(roomName);
    documentDroppedResources(roomName);
}

function buildRuinsMonitorMemory(roomName) {
    log.debug(`Building dropped resource monitor memory for ${roomName}`);
    if (!Memory.rooms[roomName].monitoring.resources.ruins) {
        Memory.rooms[roomName].monitoring.resources.ruins = {};
    }
}
function cleanRuinsMonitoring(roomName) {
    Object.keys(Memory.rooms[roomName].monitoring.resources.ruins).forEach(ruinsId => {
        if (Game.getObjectById(ruinsId) === null) {
            delete Memory.rooms[roomName].monitoring.resources.ruins[ruinsId];
        }
    });
}
function documentRuins(roomName) {
    Object.values(Game.rooms[roomName].find(FIND_RUINS)).forEach(ruin => {
        Memory.rooms[roomName].monitoring.resources.ruins[ruin.id] = {
            contents: ruin.store
        };
    });
}
function monitorRuins(roomName) {
    log.debug(`Monitoring dropped resources in ${roomName}`);
    buildRuinsMonitorMemory(roomName);
    cleanRuinsMonitoring(roomName);
    documentRuins(roomName);
}

function buildResourceMonitorMemory(roomName) {
    log.debug(`Building resource monitor memory for ${roomName}`);
    if (!Memory.rooms[roomName].monitoring.resources) {
        Memory.rooms[roomName].monitoring.resources = {};
    }
}
function monitorResources(roomName) {
    log.debug(`Monitoring resources in ${roomName}`);
    buildResourceMonitorMemory(roomName);
    monitorDroppedResources(roomName);
    monitorRuins(roomName);
}

function buildConstructionMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.construction) {
        Memory.rooms[roomName].monitoring.construction = {};
    }
}
function documentConstruction(roomName) {
    Object.values(Game.constructionSites)
        .filter(constructionSite => constructionSite.pos.roomName === roomName)
        .forEach(constructionSite => {
        Memory.rooms[roomName].monitoring.construction[constructionSite.id] = {
            progress: constructionSite.progress,
            progressTotal: constructionSite.progressTotal,
            structureType: constructionSite.structureType
        };
    });
}
function cleanConstruction(roomName) {
    Object.keys(Memory.rooms[roomName].monitoring.construction).forEach(constructionSiteId => {
        if (Game.getObjectById(constructionSiteId) === null) {
            delete Memory.rooms[roomName].monitoring.construction[constructionSiteId];
        }
    });
}
function monitorConstruction(roomName) {
    buildConstructionMonitorMemory(roomName);
    cleanConstruction(roomName);
    documentConstruction(roomName);
}

function buildHostileMonitorMemory(roomName) {
    if (!Memory.rooms[roomName].monitoring.hostiles) {
        Memory.rooms[roomName].monitoring.hostiles = {};
    }
}
function cleanHostileMonitorMemory(roomName) {
    Object.keys(Memory.rooms[roomName].monitoring.hostiles).forEach(hostileId => {
        if (!Game.getObjectById(hostileId)) {
            delete Memory.rooms[roomName].monitoring.hostiles[hostileId];
        }
    });
}
function monitorHostiles(roomName) {
    buildHostileMonitorMemory(roomName);
    cleanHostileMonitorMemory(roomName);
    const hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    hostiles.forEach(hostile => {
        Memory.rooms[roomName].monitoring.hostiles[hostile.id] = {
            hits: hostile.hits,
            hitsMax: hostile.hitsMax,
            parts: hostile.body.map(part => part.type),
            owner: hostile.owner.username
        };
    });
}

function buildRoomMonitorMemory(roomName) {
    log.debug(`Building room monitor memory for ${roomName}`);
    // Only needed for Mockup
    if (!Memory.rooms) {
        Memory.rooms = {};
    }
    if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {};
    }
    // End of Mockup Requirement
    if (!Memory.rooms[roomName].monitoring) {
        Memory.rooms[roomName].monitoring = {};
    }
}
function createExplorerBotJobs(roomName) {
    let parts = [MOVE];
    let params = { isClaiming: false, isReserving: false };
    if (Memory.rooms[roomName].monitoring) {
        const controllerArray = Object.keys(Memory.rooms[roomName].monitoring.structures.controller);
        if (controllerArray.length > 0) {
            const controller = controllerArray[0];
            if (controller) {
                const closestSpawn = findClosestSpawn(roomName);
                if (closestSpawn) {
                    if (closestSpawn.room.energyCapacityAvailable >= 1250) {
                        parts = [MOVE, CLAIM, CLAIM];
                        params = { isClaiming: false, isReserving: true };
                    }
                }
            }
        }
    }
    const explorerBot = new ExplorerBot(roomName, params);
    if (!Memory.analysis.queues.spawn[explorerBot.name]) {
        if (!Game.creeps[explorerBot.name]) {
            Memory.analysis.queues.spawn[explorerBot.name] = {
                name: explorerBot.name,
                room: roomName,
                priority: explorerBot.priority,
                parts,
                memory: explorerBot.memory,
                status: "new"
            };
        }
        else {
            delete Memory.analysis.queues.spawn[explorerBot.name];
        }
    }
}
function monitorRooms() {
    const roomsToMonitor = [...getOwnedRooms()];
    config.rooms.roomsToMine.forEach(roomName => {
        if (Game.rooms[roomName]) {
            roomsToMonitor.push(roomName);
            if (Game.rooms[roomName].controller) {
                if (!Game.rooms[roomName].controller.my) {
                    const closestSpawn = findClosestSpawn(roomName);
                    if (closestSpawn) {
                        if (closestSpawn.room.energyCapacityAvailable >= 1250) {
                            createExplorerBotJobs(roomName);
                        }
                    }
                }
            }
        }
        else {
            if (Memory.analysis.queues) {
                createExplorerBotJobs(roomName);
            }
        }
    });
    roomsToMonitor.forEach(roomName => {
        log.debug(`Monitoring room ${roomName}`);
        buildRoomMonitorMemory(roomName);
        monitorHostiles(roomName);
        monitorStructures(roomName);
        monitorResources(roomName);
        monitorConstruction(roomName);
    });
}

function monitorPhase() {
    log.debug("Running Monitor Phase");
    monitorRooms();
}

class PhaseController {
    constructor() {
        this.runPhases();
    }
    runPhases() {
        log.debug("Running Phases");
        monitorPhase();
        analysisPhase();
        actionPhase();
    }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
const loop = ErrorMapper.wrapLoop(() => {
    log.info(`Current game tick is ${Game.time}`);
    log.debug("Starting Phase Controller");
    if (Game.cpu.generatePixel) {
        global.environment = "production";
        if (Game.cpu.bucket == 10000) {
            Game.cpu.generatePixel();
        }
    }
    else {
        global.environment = "development";
    }
    new PhaseController();
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
});

exports.loop = loop;
//# sourceMappingURL=main.js.map
