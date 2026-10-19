// Run with: node --test tests/diffchecker.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { compare, merge } = require("../docs/javascripts/diffchecker.js");

function verify(left, right) {
  const result = compare(left, right);
  assert.equal(merge(result, "left"), right);
  assert.equal(merge(result, "right"), left);
  let l = 0, r = 0;
  for (const change of result.changes) {
    assert.equal(left.slice(l, change.left[0]), right.slice(r, change.right[0]));
    l = change.left[1]; r = change.right[1];
  }
  assert.equal(left.slice(l), right.slice(r));
  return result;
}

test("merge by changed blocks while highlighting words and preserving spaces", () => {
  const result = verify("  The quick  brown\tfox.\nSame\nOld paragraph", "  The slow  brown\tfox!\nSame\nNew paragraph");
  assert.equal(result.changes.length, 2);
  const row = result.changes[0].rows[0];
  assert.deepEqual(row.left.marks.map(token => row.left.text.slice(token.start, token.end)), ["quick", "."]);
  assert.deepEqual(row.right.marks.map(token => row.right.text.slice(token.start, token.end)), ["slow", "!"]);
  assert.equal(row.left.content, "  The quick  brown\tfox.");
  assert.equal(merge(result, "left", 0), "  The slow  brown\tfox!\nSame\nOld paragraph");
  assert.equal(merge(result, "right", 1), "  The slow  brown\tfox!\nSame\nOld paragraph");
  const single = verify("The quick brown fox.", "The slow brown fox!");
  assert.equal(single.changes.length, 1);
  assert.equal(single.removed, 1);
  assert.equal(single.added, 1);
});

test("insertion, deletion, empty text, newlines and literal HTML merge in both directions", () => {
  for (const [left, right] of [
    ["", ""], ["", "new text"], ["old text", ""],
    ["The quick fox", "The quick brown fox"], ["a b c", "a c"],
    ["a\n\nb\n", "a\nb"], ["a", "a\n"], ["a b", "ab"],
    ["<script>alert(1)</script>", "<b>text</b>"],
    ["你好，世界！\n保留😀", "你好，美丽世界！\n保留😄"]
  ]) verify(left, right);
});

test("ignore options retain original offsets and handle spaces around merged words", () => {
  assert.equal(compare(" Ab\tC ", " ab C ", { ignoreCase: true, ignoreWhitespace: true }).changes.length, 0);
  assert.equal(compare("a\r\nb\rc", "a\nb\nc").changes.length, 0);
  for (const [left, right] of [["a b", "a x b"], ["a x b", "a b"], [" a b ", " a y b "]]) {
    const result = compare(left, right, { ignoreWhitespace: true });
    assert.equal(merge(result, "left"), right);
    assert.equal(merge(result, "right"), left);
  }
  const result = compare("HELLO  old\r\nKEEP", "hello new\nkeep", { ignoreCase: true, ignoreWhitespace: true });
  assert.equal(merge(result, "left"), "hello new\nKEEP");
  assert.equal(merge(result, "right"), "HELLO  old\r\nkeep");
});

test("random repeated words produce minimal token edits and reversible merges", () => {
  let seed = 42;
  const random = n => { seed = (1664525 * seed + 1013904223) >>> 0; return seed % n; };
  const tokenize = text => text.match(/\w+|\s+|[^\w\s]/g) || [];
  for (let run = 0; run < 1000; run++) {
    const a = Array.from({ length: random(15) }, () => `w${random(5)}`).join(" ");
    const b = Array.from({ length: random(15) }, () => `w${random(5)}`).join(" ");
    const result = verify(a, b);
    const left = tokenize(a), right = tokenize(b);
    const lengths = Array.from({ length: left.length + 1 }, () => new Uint32Array(right.length + 1));
    for (let i = left.length - 1; i >= 0; i--) {
      for (let j = right.length - 1; j >= 0; j--) {
        lengths[i][j] = left[i] === right[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
      }
    }
    const distance = result.changes.reduce((sum, change) => sum
      + change.rows.reduce((count, row) => count + (row.left?.marks.length || 0) + (row.right?.marks.length || 0), 0), 0);
    assert.equal(distance, left.length + right.length - 2 * lengths[0][0]);
  }
});

test("random repeated and blank lines preserve text and block boundaries", () => {
  let seed = 71;
  const random = n => { seed = (1664525 * seed + 1013904223) >>> 0; return seed % n; };
  for (let run = 0; run < 1000; run++) {
    const make = () => Array.from({ length: random(20) }, () => ["", "  a b", "c\td", "e"][random(4)]).join("\n");
    const result = verify(make(), make());
    for (const block of result.changes) {
      const left = result.left.slice(...block.left), right = result.right.slice(...block.right);
      assert.equal(block.leftLines.map(line => line.text).join(""), left);
      assert.equal(block.rightLines.map(line => line.text).join(""), right);
    }
  }
});

test("many changed LaTeX lines remain separate blocks beyond the old edit limit", () => {
  const a = [], b = [];
  for (let i = 0; i < 350; i++) {
    a.push("\\begin{equation}\n", `\\alpha_${i} = old value\n`, "\\end{equation}\n");
    b.push("\\begin{equation}\n", `\\alpha_${i} = new value\n`, "\\end{equation}\n");
  }
  const result = verify(a.join(""), b.join(""));
  assert.equal(result.changes.length, 350);
  assert.equal(result.removed, 350);
  assert.equal(result.added, 350);
  for (const block of result.changes) {
    assert.equal(block.rows.length, 1);
    assert.deepEqual(block.rows[0].left.marks.map(token => token.key), ["old"]);
    assert.deepEqual(block.rows[0].right.marks.map(token => token.key), ["new"]);
  }
});

test("large blocks still identify unchanged words instead of highlighting everything", () => {
  const a = Array(600).fill("old token").join(" ");
  const b = Array(600).fill("new token").join(" ");
  const result = verify(a, b);
  assert.equal(result.changes.length, 1);
  assert.equal(result.removed, 600);
  assert.equal(result.added, 600);
  assert.ok(result.changes[0].rows[0].left.marks.every(token => token.key === "old"));
  assert.ok(result.changes[0].rows[0].right.marks.every(token => token.key === "new"));
  const multiple = verify("old first\nold second\nSame\nold third", "new first\nnew second\nSame\nnew third");
  assert.equal(multiple.changes.length, 2);
  assert.equal(multiple.changes[0].rows.length, 2);
});

test("large similar texts and input limits", () => {
  const a = Array.from({ length: 9000 }, (_, i) => `line ${i}`);
  const b = [...a]; b[4500] = "line changed";
  const result = verify(a.join("\n"), b.join("\n"));
  assert.equal(result.removed, 1);
  assert.equal(result.added, 1);
  assert.throws(() => compare("x".repeat(1000001), ""), /smaller section/);
  assert.throws(() => compare("\n".repeat(20001), ""), /smaller section/);
  assert.throws(() => compare("a ".repeat(50001), ""), /smaller section/);
});
