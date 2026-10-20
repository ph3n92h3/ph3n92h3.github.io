// Run with: node --test tests/diffchecker.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { compare, merge, highlightRanges } = require("../docs/javascripts/diffchecker.js");
const reference = require("./fixtures/diffchecker-reference.json");

// Independent LCS oracle for short sequences, using a different algorithm.
function editDistance(a, b) {
  const row = new Uint32Array(b.length + 1);
  for (const token of a) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const previous = row[j];
      row[j] = token === b[j - 1] ? diagonal + 1 : Math.max(row[j], row[j - 1]);
      diagonal = previous;
    }
  }
  return a.length + b.length - 2 * row[b.length];
}

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

function randomGenerator(seed) {
  return n => { seed = (1664525 * seed + 1013904223) >>> 0; return seed % n; };
}

function verifyHighlights(line) {
  let cursor = 0;
  for (const token of line.marks) {
    assert.ok(cursor <= token.start && token.start < token.end && token.end <= line.text.length);
    cursor = token.end;
  }
  for (const range of highlightRanges(line)) {
    assert.ok(range.start >= 0 && range.start < range.end && range.end <= line.content.length);
  }
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

test("automatic highlighting matches the observed Diffchecker baseline example", () => {
  // Observed in the public UI on 2026-10-20, default Smart precision.
  // This reference is supplemented by the saved default-mode comparison corpus.
  const left = "The quick brown fox.\nKeep this line.\nvalue = 1234";
  const right = "The slow brown fox!\nKeep this line.\nvalue = 1235";
  const result = compare(left, right);
  const highlights = side => result.changes.map(block => block.rows.flatMap(row =>
    row[side]?.marks.map(token => row[side].text.slice(token.start, token.end)) ?? []));
  assert.deepEqual(highlights("left"), [["quick", "."], ["4"]]);
  assert.deepEqual(highlights("right"), [["slow", "!"], ["5"]]);
  assert.equal(merge(result, "left"), right);
  assert.equal(merge(result, "right"), left);
});

test("refined numeric highlights preserve Unicode, inserted digits and raw text", () => {
  for (const [a, b, removed, added] of [
    ["123", "1234", [], ["4"]], ["1234", "123", ["4"], []],
    ["12345", "12945", ["3"], ["9"]],
    ["𝟙𝟚𝟛", "𝟙𝟚𝟜", ["𝟛"], ["𝟜"]]
  ]) {
    const left = `  n = ${a}\t\n`, right = `  n = ${b}\t\n`;
    const result = compare(left, right);
    const row = result.changes[0].rows[0];
    for (const [side, expected] of [["left", removed], ["right", added]]) {
      assert.deepEqual(row[side].marks.map(token => row[side].text.slice(token.start, token.end)), expected);
    }
    assert.equal(merge(result, "left"), right);
    assert.equal(merge(result, "right"), left);
  }
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

test("line splitting and joining retain unchanged words in original line order", () => {
  const left = "The quick brown fox.\nSecond old line.\n";
  const right = "The quick\nbrown fox.\nSecond new line.\n";
  for (const [a, b] of [[left, right], [right, left]]) {
    const result = verify(a, b);
    assert.equal(result.removed, 1);
    assert.equal(result.added, 1);
    const lastLeft = result.changes[0].rows.map(row => row.left).filter(Boolean).at(-1);
    const lastRight = result.changes[0].rows.map(row => row.right).filter(Boolean).at(-1);
    assert.equal(lastLeft.content, a.split("\n").at(-2));
    assert.equal(lastRight.content, b.split("\n").at(-2));
    assert.deepEqual(lastLeft.marks.map(token => token.key), [a === left ? "old" : "new"]);
    assert.deepEqual(lastRight.marks.map(token => token.key), [a === left ? "new" : "old"]);
    assert.ok(result.changes[0].rows.flatMap(row => [row.left, row.right]).filter(Boolean)
      .flatMap(line => line.marks).every(token => !["The", "quick", "brown", "fox", "Second", "line"].includes(token.key)));
  }
});

test("automatic highlighting preserves graphemes and refines small changes", () => {
  for (const [left, right, removed, added] of [
    ["你好世界", "你好世间", ["世界"], ["世间"]],
    ["x 👩‍🔬 e\u0301", "x 👩‍🚀 e\u0300", ["👩‍🔬", "e\u0301"], ["👩‍🚀", "e\u0300"]]
  ]) {
    const result = compare(left, right);
    const highlights = side => result.changes.flatMap(block => block.rows.flatMap(row =>
      row[side]?.marks.map(token => row[side].text.slice(token.start, token.end)) ?? []));
    assert.deepEqual(highlights("left"), removed);
    assert.deepEqual(highlights("right"), added);
    assert.equal(merge(result, "left"), right);
    assert.equal(merge(result, "right"), left);
  }
});

test("all 21 saved Diffchecker default Smart reference results match without options", () => {
  assert.equal(reference.cases.length, 21);
  for (const sample of reference.cases) {
    const result = compare(sample.left, sample.right);
    const highlighted = side => result.changes.flatMap(block => block.rows.flatMap(row => row[side]
      ? highlightRanges(row[side]).map(range => row[side].content.slice(range.start, range.end)) : []));
    assert.deepEqual({ removed: highlighted("left"), added: highlighted("right"), blocks: result.changes.length },
      sample.expected, sample.id);
    assert.equal(merge(result, "left"), sample.right);
    assert.equal(merge(result, "right"), sample.left);
  }
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

test("random repeated single-word lines match an independent minimal-edit oracle", () => {
  const random = randomGenerator(42);
  const tokenize = text => text.match(/\S+/g) || [];
  const words = ["cat", "dog", "fox", "cow", "hen"];
  for (let run = 0; run < 1000; run++) {
    const a = Array.from({ length: random(15) }, () => `${words[random(words.length)]}\n`).join("");
    const b = Array.from({ length: random(15) }, () => `${words[random(words.length)]}\n`).join("");
    const result = verify(a, b);
    const left = tokenize(a), right = tokenize(b);
    assert.equal(result.removed + result.added, editDistance(left, right));
  }
});

test("random repeated and blank lines preserve text and block boundaries", () => {
  const random = randomGenerator(71);
  for (let run = 0; run < 1000; run++) {
    const make = () => Array.from({ length: random(20) }, () => ["", "  a b", "c\td", "e"][random(4)]).join("\n");
    const result = verify(make(), make());
    for (const block of result.changes) {
      const left = result.left.slice(...block.left), right = result.right.slice(...block.right);
      assert.equal(block.leftLines.map(line => line.text).join(""), left);
      assert.equal(block.rightLines.map(line => line.text).join(""), right);
      assert.equal(block.rows.map(row => row.left?.text ?? "").join(""), left);
      assert.equal(block.rows.map(row => row.right?.text ?? "").join(""), right);
      for (const row of block.rows) {
        assert.ok(row.left || row.right);
        for (const line of [row.left, row.right].filter(Boolean)) verifyHighlights(line);
      }
    }
  }
});

test("Smart refinement keeps Unicode and whitespace highlight offsets within their original lines", () => {
  const random = randomGenerator(107);
  const pieces = ["ab", "cat", "color", "界", "👩‍🔬", "e\u0301", "123", " ", "\t", "\n", "\r\n", "_", "\\"];
  const make = () => Array.from({ length: random(25) }, () => pieces[random(pieces.length)]).join("");
  for (let run = 0; run < 1000; run++) {
    const a = make(), b = make();
    for (const ignoreWhitespace of [false, true]) {
      const options = { ignoreWhitespace, ignoreCase: Boolean(run % 2) };
      const result = compare(a, b, options);
      for (const side of ["left", "right"]) {
        const source = side === "left" ? "right" : "left";
        assert.equal(compare(merge(result, side), result[source], options).changes.length, 0);
      }
      for (const block of result.changes) for (const row of block.rows) {
        for (const line of [row.left, row.right].filter(Boolean)) verifyHighlights(line);
      }
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

test("large wrapped blocks retain shared context beyond the Myers trace budget", () => {
  const a = Array.from({ length: 700 }, (_, i) => `entry ${i} old value\n`).join("");
  const b = Array.from({ length: 700 }, (_, i) => `entry ${i}\nnew value\n`).join("");
  const words = verify(a, b);
  assert.equal(words.changes.length, 1);
  assert.equal(words.removed, 700);
  assert.equal(words.added, 700);
  assert.equal(words.changes[0].rows.length, 1400);
});

test("fallback anchors preserve long repeated-line comparisons", () => {
  const random = randomGenerator(991);
  for (let run = 0; run < 40; run++) {
    const make = () => Array.from({ length: 400 }, () => `entry ${random(90)}`).join("\n");
    const result = verify(make(), make());
    for (const block of result.changes) {
      assert.equal(block.rows.map(row => row.left?.text ?? "").join(""), result.left.slice(...block.left));
      assert.equal(block.rows.map(row => row.right?.text ?? "").join(""), result.right.slice(...block.right));
    }
  }
});

test("large similar texts and input limits", () => {
  const a = Array.from({ length: 9000 }, (_, i) => `line ${i}`);
  const b = [...a]; b[4500] = "line changed";
  const result = verify(a.join("\n"), b.join("\n"));
  assert.equal(result.removed, 1);
  assert.equal(result.added, 1);
  assert.throws(() => compare("x".repeat(1000001), ""), /smaller section/);
  assert.throws(() => compare("\n".repeat(20001), ""), /smaller section/);
  assert.throws(() => compare("a ".repeat(100001), ""), /smaller section/);
});
