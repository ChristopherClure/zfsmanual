const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Stub elasticlunr.stemmer (simple identity stemmer for tests)
global.elasticlunr = {
  stemmer: (word) => word.replace(/ing$|tion$|ed$|s$/, '')
};

const { makeTeaser, substringByByte, getByteByBinary, getByteByHex } = require('./search.js');

describe('makeTeaser', () => {
  test('returns body unchanged when shorter than max words', () => {
    const body = 'ZFS is a file system';
    const result = makeTeaser(body, ['zfs']);
    assert.ok(result.includes('ZFS') || result.includes('zfs'));
  });

  test('wraps matched terms in <b> tags', () => {
    const body = 'ZFS uses checksums to verify data integrity on every block.';
    const result = makeTeaser(body, ['checksum']);
    assert.ok(result.includes('<b>'), `Expected <b> tag in: ${result}`);
    assert.ok(result.includes('</b>'), `Expected </b> tag in: ${result}`);
  });

  test('returns a truncated excerpt ending with ellipsis', () => {
    const words = Array.from({length: 100}, (_, i) => `word${i}`);
    const body = words.join(' ');
    const result = makeTeaser(body, ['word50']);
    assert.ok(result.endsWith('…'), `Expected ellipsis at end of: ${result}`);
  });

  test('positions excerpt near matched term', () => {
    const prefix = Array.from({length: 50}, () => 'padding').join(' ');
    const body = `${prefix} snapshot clone ${prefix}`;
    const result = makeTeaser(body, ['snapshot']);
    assert.ok(result.includes('snapshot'), `Expected "snapshot" in excerpt: ${result}`);
  });

  test('handles empty body', () => {
    const result = makeTeaser('', ['zfs']);
    assert.equal(result, '');
  });

  test('handles terms not found in body', () => {
    const body = 'ZFS is a reliable file system for data storage.';
    const result = makeTeaser(body, ['kubernetes']);
    // Should still return something (first window)
    assert.ok(typeof result === 'string');
    assert.ok(result.length > 0);
  });

  test('handles multiple search terms', () => {
    const body = 'ZFS pool creation requires specifying the vdev topology and disk devices.';
    const result = makeTeaser(body, ['pool', 'vdev']);
    assert.ok(typeof result === 'string');
  });
});

describe('getByteByBinary', () => {
  test('returns 0 for empty binary', () => {
    assert.equal(getByteByBinary(''), 0);
  });

  test('returns 1 for 8-bit binary (ASCII)', () => {
    // 8-bit binary = 1 byte
    assert.equal(getByteByBinary('01000001'), 1); // 'A'
  });

  test('returns 2 for 16-bit value', () => {
    assert.equal(getByteByBinary('1000000000000000'), 2);
  });
});

describe('getByteByHex', () => {
  test('returns 1 for ASCII hex (0x41 = "A")', () => {
    assert.equal(getByteByHex('41'), 1);
  });

  test('returns 2 for 2-byte hex', () => {
    // 0x0800 = 16-bit
    assert.equal(getByteByHex('0800'), 2);
  });
});

describe('substringByByte', () => {
  test('returns full ASCII string within byte limit', () => {
    const result = substringByByte('hello', 10);
    assert.equal(result, 'hello');
  });

  test('truncates ASCII string at byte limit', () => {
    const result = substringByByte('hello world', 5);
    assert.equal(result, 'hello');
  });

  test('handles empty string', () => {
    const result = substringByByte('', 10);
    assert.equal(result, '');
  });
});
