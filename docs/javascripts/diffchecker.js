/* Local, dependency-free text comparison and two-way merging. */
(() => {
  "use strict";

  const sides = ["left", "right"];
  const segmenter = Intl.Segmenter && new Intl.Segmenter(undefined, { granularity: "word" });
  const characters = Intl.Segmenter && new Intl.Segmenter(undefined, { granularity: "grapheme" });

  function normalize(text, options) {
    let key = text.replace(/\r\n?/g, "\n");
    if (options.ignoreWhitespace) key = key.replace(/[^\S\n]+/gu, "");
    return options.ignoreCase ? key.toLowerCase() : key;
  }

  const isWord = value => /[\p{L}\p{N}]/u.test(value);

  // Yield { segment, index, word }, splitting words into letter and digit runs.
  function* smartSegments(text) {
    const pieces = segmenter ? segmenter.segment(text)
      : text.matchAll(/[\p{L}\p{N}\p{M}_]+|[^\S\r\n]+|\r\n|[\s\S]/gu);
    for (const part of pieces) {
      const value = part.segment ?? part[0];
      if (!(part.isWordLike ?? isWord(value))) { yield { segment: value, index: part.index, word: false }; continue; }
      for (const match of value.matchAll(/[\p{L}\p{M}]+|\p{N}+|[\s\S]/gu)) {
        yield { segment: match[0], index: part.index + match.index, word: isWord(match[0]) };
      }
    }
  }

  function* characterSegments(text) {
    for (const part of characters ? characters.segment(text) : text.matchAll(/\r\n|[\s\S]/gu)) {
      yield { segment: part.segment ?? part[0], index: part.index, word: true };
    }
  }

  // Count words in blocks too large to tokenize. A run of letters in scripts
  // written without spaces, such as Chinese, counts as one word.
  const countWords = text => text.match(/[\p{L}\p{M}]+|\p{N}+/gu)?.length ?? 0;

  // Returns null once the budget is spent, so callers can skip highlighting.
  function tokenize(text, options, budget, character = false) {
    const tokens = [];
    for (const { segment, index, word } of (character ? characterSegments : smartSegments)(text)) {
      if (options.ignoreWhitespace && /^[^\S\r\n]+$/u.test(segment)) continue;
      if (tokens.length >= budget) return null;
      tokens.push({ key: normalize(segment, options), start: index, end: index + segment.length, word });
    }
    return tokens;
  }

  // Tokenize both sides within the shared budget, or return null without spending it.
  function tokenizePair(input, options, budget, character) {
    const left = tokenize(input.left, options, budget.tokens, character);
    const right = left && tokenize(input.right, options, budget.tokens - left.length, character);
    if (!right) return null;
    budget.tokens -= left.length + right.length;
    return { left, right };
  }

  const repeat = (edits, edit, count) => { for (let i = 0; i < count; i++) edits.push(edit); };

  // Return the "equal", "delete" and "insert" edits that turn keys a into b.
  function diff(a, b) {
    const edits = [];
    solve(a, b, 0, a.length, 0, b.length, 0, edits);
    return edits;
  }

  // Number equal keys alike, so the fallbacks hash and compare integers.
  function number(a, b) {
    const ids = new Map();
    return [a, b].map(keys => Int32Array.from(keys, key => {
      let id = ids.get(key);
      if (id === undefined) ids.set(key, id = ids.size);
      return id;
    }));
  }

  // Use Myers for nearby edits, with a bounded trace. For larger edit counts,
  // unique ordered anchors split larger edits before the indexed fallback.
  // Only the first call sees unnumbered keys; numbering waits until Myers fails.
  function solve(a, b, startA, endA, startB, endB, depth, edits) {
    let prefix = 0, suffix = 0;
    while (startA < endA && startB < endB && a[startA] === b[startB]) { startA++; startB++; prefix++; }
    while (endA > startA && endB > startB && a[endA - 1] === b[endB - 1]) { endA--; endB--; suffix++; }
    repeat(edits, "equal", prefix);
    if (startA === endA || startB === endB) {
      repeat(edits, "delete", endA - startA);
      repeat(edits, "insert", endB - startB);
    } else if (!myers(a, b, startA, endA, startB, endB, edits)) {
      if (!depth) [a, b] = number(a, b);
      const positions = new Map();
      for (let j = startB; j < endB; j++) {
        if (positions.has(b[j])) positions.get(b[j]).push(j);
        else positions.set(b[j], [j]);
      }
      if (depth >= 32 || !anchored(a, b, startA, endA, startB, endB, depth, edits, positions)) {
        greedy(a, startA, endA, startB, endB, positions, edits);
      }
    }
    repeat(edits, "equal", suffix);
  }

  function myers(a, b, startA, endA, startB, endB, edits) {
    const n = endA - startA, m = endB - startB;
    const limit = Math.min(n + m, 512), offset = limit + 1;
    const frontier = new Int32Array(2 * limit + 3).fill(-1), trace = [];
    frontier[offset + 1] = 0;
    for (let d = 0; d <= limit; d++) {
      trace.push(frontier.slice());
      for (let k = -d; k <= d; k += 2) {
        const i = offset + k;
        let x = k === -d || (k !== d && frontier[i - 1] < frontier[i + 1])
          ? frontier[i + 1] : frontier[i - 1] + 1;
        let y = x - k;
        while (x < n && y < m && a[startA + x] === b[startB + y]) { x++; y++; }
        frontier[i] = x;
        if (x < n || y < m) continue;
        const path = [];
        for (let depth = d; depth >= 0; depth--) {
          const previous = trace[depth];
          const diagonal = x - y;
          const previousK = diagonal === -depth || (diagonal !== depth && previous[offset + diagonal - 1] < previous[offset + diagonal + 1])
            ? diagonal + 1 : diagonal - 1;
          const previousX = previous[offset + previousK];
          const previousY = previousX - previousK;
          while (x > previousX && y > previousY) { path.push("equal"); x--; y--; }
          if (depth > 0) {
            if (x === previousX) { path.push("insert"); y--; }
            else { path.push("delete"); x--; }
          }
        }
        for (let j = path.length - 1; j >= 0; j--) edits.push(path[j]);
        return true;
      }
    }
    return false;
  }

  // Split at the longest ordered chain of keys found once on each side.
  // Four-key anchors also identify context when individual characters
  // repeat throughout a long document. Overlapping anchors are skipped.
  function anchored(a, b, startA, endA, startB, endB, depth, edits, positions) {
    for (const span of [1, 4]) {
      const keyAt = span === 1 ? (keys, index) => keys[index]
        : (keys, index) => `${keys[index]},${keys[index + 1]},${keys[index + 2]},${keys[index + 3]}`;
      const matchesByKey = span === 1 ? positions : new Map();
      if (span > 1) {
        for (let j = startB; j + span <= endB; j++) {
          const key = keyAt(b, j);
          if (matchesByKey.has(key)) matchesByKey.get(key).push(j);
          else matchesByKey.set(key, [j]);
        }
      }
      const unique = new Map(), candidates = [], tails = [];
      for (let x = startA; x + span <= endA; x++) {
        const key = keyAt(a, x);
        unique.set(key, unique.has(key) ? -1 : x);
      }
      for (const [key, x] of unique) {
        const matches = matchesByKey.get(key);
        if (x < 0 || matches?.length !== 1) continue;
        const y = matches[0];
        let low = 0, high = tails.length;
        while (low < high) {
          const mid = (low + high) >>> 1;
          if (candidates[tails[mid]].right < y) low = mid + 1;
          else high = mid;
        }
        tails[low] = candidates.length;
        candidates.push({ left: x, right: y, previous: low ? tails[low - 1] : -1 });
      }
      if (!tails.length) continue;
      const anchors = [];
      for (let i = tails.at(-1); i >= 0; i = candidates[i].previous) anchors.push(candidates[i]);
      anchors.reverse().push({ left: endA, right: endB });
      let x = startA, y = startB;
      for (const anchor of anchors) {
        if (anchor.left < x || anchor.right < y) continue;
        solve(a, b, x, anchor.left, y, anchor.right, depth + 1, edits);
        if (anchor.left < endA) repeat(edits, "equal", span);
        x = anchor.left + span; y = anchor.right + span;
      }
      return true;
    }
    return false;
  }

  // Match each key with its next occurrence on the other side.
  function greedy(a, startA, endA, startB, endB, positions, edits) {
    let y = startB;
    for (let x = startA; x < endA; x++) {
      const matches = positions.get(a[x]) || [];
      let low = 0, high = matches.length;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (matches[mid] < y) low = mid + 1;
        else high = mid;
      }
      if (low === matches.length) edits.push("delete");
      else {
        while (y < matches[low]) { edits.push("insert"); y++; }
        edits.push("equal"); y++;
      }
    }
    repeat(edits, "insert", endB - y);
  }

  function compare(original, changed, options = {}) {
    const texts = { left: original, right: changed };
    const split = text => Array.from(text.matchAll(/[^\r\n]*(?:\r\n?|\n)|[^\r\n]+$/g), (match, index) => ({
      text: match[0], content: match[0].replace(/(?:\r\n?|\n)$/, ""),
      start: match.index, end: match.index + match[0].length, number: index + 1, key: normalize(match[0], options)
    }));
    const lines = { left: split(original), right: split(changed) };
    const edits = diff(lines.left.map(line => line.key), lines.right.map(line => line.key));
    const blocks = [], changes = [], words = { left: 0, right: 0 }, budget = { tokens: 100000 };
    let l = 0, r = 0;

    // Mark changed words, refined to characters for small edits, on each line.
    function highlight(block) {
      const input = {}, marked = { left: [], right: [] };
      for (const side of sides) {
        for (const line of block[`${side}Lines`]) line.marks = [];
        input[side] = texts[side].slice(...block[side]);
      }
      const tokens = tokenizePair(input, options, budget);
      if (!tokens) {
        // Too large for word highlights: keep the line-level change.
        for (const side of sides) words[side] += countWords(input[side]);
        return;
      }
      const operations = diff(tokens.left.map(token => token.key), tokens.right.map(token => token.key));
      let x = 0, y = 0;
      for (let j = 0; j < operations.length;) {
        if (operations[j] === "equal") { x++; y++; j++; continue; }
        const startX = x, startY = y;
        while (j < operations.length && operations[j] !== "equal") {
          if (operations[j++] === "delete") words.left += Number(tokens.left[x++].word);
          else words.right += Number(tokens.right[y++].word);
        }
        const group = { left: tokens.left.slice(startX, x), right: tokens.right.slice(startY, y) };
        const offset = {}, text = {};
        for (const side of sides) {
          offset[side] = group[side][0]?.start ?? 0;
          text[side] = group[side].length ? input[side].slice(offset[side], group[side].at(-1).end) : "";
        }
        // Bound refinement of unusually long tokens; the coarse word result
        // remains usable without allocating an unbounded character trace.
        const fine = text.left.length + text.right.length <= 8192 && tokenizePair(text, options, budget, true);
        if (fine) {
          const selected = { left: [], right: [] };
          let a = 0, b = 0;
          for (const edit of diff(fine.left.map(token => token.key), fine.right.map(token => token.key))) {
            if (edit === "delete") selected.left.push(fine.left[a++]);
            else if (edit === "insert") selected.right.push(fine.right[b++]);
            else { a++; b++; }
          }
          const ratio = Math.max(...sides.map(side => selected[side].length / Math.max(1, fine[side].length)));
          if ((!text.left.trim() && !text.right.trim()) || ratio < .5) {
            for (const side of sides) {
              group[side] = selected[side].map(token => ({ ...token, start: token.start + offset[side], end: token.end + offset[side] }));
            }
          }
        }
        for (const side of sides) for (const token of group[side]) marked[side].push(token);
      }
      // Move marks from block offsets to offsets within their lines.
      for (const side of sides) {
        const lines = block[`${side}Lines`], start = block[side][0];
        let index = 0;
        for (const token of marked[side]) {
          while (index + 1 < lines.length && start + token.start >= lines[index].end) index++;
          const shift = start - lines[index].start;
          lines[index].marks.push({ ...token, start: token.start + shift, end: token.end + shift });
        }
      }
    }

    for (let i = 0; i < edits.length;) {
      const equal = edits[i] === "equal", from = { left: l, right: r };
      while (i < edits.length && (edits[i] === "equal") === equal) {
        const edit = edits[i++];
        if (edit !== "insert") l++;
        if (edit !== "delete") r++;
      }
      const block = { equal };
      for (const [side, end] of [["left", l], ["right", r]]) {
        const start = lines[side][from[side]]?.start ?? texts[side].length;
        block[side] = [start, end > from[side] ? lines[side][end - 1].end : start];
        block[`${side}Lines`] = lines[side].slice(from[side], end);
      }
      block.rows = Array.from({ length: Math.max(block.leftLines.length, block.rightLines.length) }, (_, index) => ({
        left: block.leftLines[index] ?? null, right: block.rightLines[index] ?? null
      }));
      if (!equal) {
        block.index = changes.length;
        highlight(block);
        changes.push(block);
      }
      blocks.push(block);
    }
    return { left: original, right: changed, blocks, changes, removed: words.left, added: words.right };
  }

  function merge(comparison, target, index) {
    const source = target === "left" ? "right" : "left";
    const changes = index === undefined ? comparison.changes : [comparison.changes[index]];
    const parts = [];
    let cursor = 0;
    for (const change of changes) {
      const [start, end] = change[target];
      const [from, to] = change[source];
      parts.push(comparison[target].slice(cursor, start), comparison[source].slice(from, to));
      cursor = end;
    }
    parts.push(comparison[target].slice(cursor));
    return parts.join("");
  }

  function highlightRanges(line) {
    const ranges = [];
    for (const token of line.marks) {
      const start = Math.min(token.start, line.content.length), end = Math.min(token.end, line.content.length);
      if (end <= start) continue;
      const previous = ranges.at(-1);
      if (previous && (start <= previous.end || /^[^\S\r\n]*$/u.test(line.content.slice(previous.end, start)))) {
        previous.end = Math.max(previous.end, end);
      } else ranges.push({ start, end });
    }
    return ranges;
  }

  // Keep the comparison engine testable without a browser or dependencies.
  if (typeof module !== "undefined" && module.exports) module.exports = { compare, merge, highlightRanges };
  if (typeof document === "undefined") return;

  // Append text as text nodes, including whitespace and literal HTML.
  function element(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
      if (value != null && value !== false) node.setAttribute(name, value === true ? "" : value);
    }
    node.append(...children);
    return node;
  }

  // One element per line; CSS draws the line number from data-line.
  function cell(line, side, changed) {
    const text = element("pre", {
      class: `dc-line${changed ? ` dc-${side === "left" ? "remove" : "add"}-line` : ""}${line ? "" : " dc-gap"}`,
      "data-line": line?.number
    });
    if (changed && line) {
      let cursor = 0;
      for (const { start, end } of highlightRanges(line)) {
        text.append(line.content.slice(cursor, start), element("mark", {}, line.content.slice(start, end)));
        cursor = end;
      }
      text.append(line.content.slice(cursor));
      if (line.marks.length && line.marks.every(token => token.start >= line.content.length)) {
        text.append(element("mark", { class: "dc-eol", title: "Line break changed" }, "↵"));
      }
    } else text.textContent = line?.content ?? "";
    return text;
  }

  function syncScroll(a, b) {
    const pending = new WeakMap();
    for (const [source, target] of [[a, b], [b, a]]) {
      source.addEventListener("scroll", () => {
        const expected = pending.get(source);
        pending.delete(source);
        if (expected && Math.abs(source.scrollTop - expected[0]) < 1 && Math.abs(source.scrollLeft - expected[1]) < 1) return;
        const ratio = (position, size, viewport) => position / Math.max(1, size - viewport);
        target.scrollTop = ratio(source.scrollTop, source.scrollHeight, source.clientHeight) * (target.scrollHeight - target.clientHeight);
        target.scrollLeft = ratio(source.scrollLeft, source.scrollWidth, source.clientWidth) * (target.scrollWidth - target.clientWidth);
        pending.set(target, [target.scrollTop, target.scrollLeft]);
      }, { passive: true });
    }
  }

  function init() {
    const root = document.querySelector("[data-diffchecker]");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    const form = root.querySelector("form");
    const original = root.querySelector("#dc-original");
    const changed = root.querySelector("#dc-changed");
    const status = root.querySelector(".dc-status");
    const workspace = root.querySelector(".dc-workspace");
    const back = root.querySelector('[data-action="edit"]');
    const results = root.querySelector(".dc-results");
    const output = root.querySelector(".dc-comparison");
    const overview = root.querySelector(".dc-overview");
    const mergeAll = root.querySelectorAll(".dc-actions [data-merge]");
    const headers = document.querySelectorAll(".md-header, .md-tabs");
    let comparison, pinned = false;
    syncScroll(original, changed);

    function fitWorkspace() {
      if (results.hidden) return;
      let top = window.visualViewport?.offsetTop ?? 0;
      for (const bar of headers) {
        const rect = bar.getBoundingClientRect();
        if (["fixed", "sticky"].includes(getComputedStyle(bar).position) && rect.top <= top + 1) {
          top = Math.max(top, rect.bottom);
        }
      }
      workspace.style.setProperty("--dc-top", `${top}px`);
      const bottom = (window.visualViewport?.offsetTop ?? 0) + (window.visualViewport?.height ?? window.innerHeight);
      workspace.style.setProperty("--dc-height", `${Math.max(0, bottom - top)}px`);
      if (pinned) workspace.scrollIntoView({ block: "start", behavior: "instant" });
    }

    function updateViewport() {
      const height = Math.max(1, output.scrollHeight);
      overview.style.setProperty("--dc-view-top", `${100 * output.scrollTop / height}%`);
      overview.style.setProperty("--dc-view-height", `${100 * output.clientHeight / height}%`);
    }

    function drawOverview() {
      if (!root.isConnected) { resize.disconnect(); events.abort(); return; }
      overview.hidden = !comparison?.changes.length;
      if (overview.hidden || results.hidden) { overview.replaceChildren(); return; }
      const current = overview.querySelector("[aria-current]")?.dataset.go;
      const top = output.getBoundingClientRect().top - output.scrollTop;
      const height = Math.max(1, output.scrollHeight);
      const markers = document.createDocumentFragment();
      for (const [index, block] of output.querySelectorAll(".dc-block").entries()) {
        const change = comparison.changes[index];
        const rect = block.getBoundingClientRect();
        const label = `Go to change ${index + 1} of ${comparison.changes.length} (original line ${change.leftLines[0]?.number ?? "—"}, changed line ${change.rightLines[0]?.number ?? "—"})`;
        markers.append(element("button", {
          type: "button", "data-go": index, "aria-label": label,
          class: `dc-map-change${change.leftLines.length ? " dc-map-remove" : ""}${change.rightLines.length ? " dc-map-add" : ""}`,
          "aria-controls": block.id, "aria-current": String(index) === current ? "location" : null, title: label,
          style: `top:${Math.min(99.25, 100 * (rect.top - top) / height)}%;height:${Math.max(.75, 100 * rect.height / height)}%`
        }));
      }
      overview.replaceChildren(markers);
      updateViewport();
    }
    output.addEventListener("scroll", updateViewport, { passive: true });
    const events = new AbortController();
    window.addEventListener("scroll", () => {
      pinned = !results.hidden && Math.abs(workspace.getBoundingClientRect().top - parseFloat(workspace.style.getPropertyValue("--dc-top"))) < 1;
    }, { passive: true, signal: events.signal });
    window.addEventListener("resize", fitWorkspace, { signal: events.signal });
    window.visualViewport?.addEventListener("resize", fitWorkspace, { signal: events.signal });
    const resize = new ResizeObserver(() => { fitWorkspace(); drawOverview(); });
    resize.observe(output);
    headers.forEach(bar => resize.observe(bar));

    const navigation = document.querySelector(".md-sidebar--primary");
    const toggle = root.querySelector('[data-action="navigation"]');
    if (navigation) {
      if (!navigation.id) navigation.id = "dc-navigation";
      toggle.setAttribute("aria-controls", navigation.id);
    }

    function invalidate(message = "Text or options changed. Find differences to update the results.") {
      results.hidden = true;
      back.hidden = true;
      pinned = false;
      workspace.removeAttribute("data-active");
      comparison = null;
      output.replaceChildren();
      overview.replaceChildren();
      overview.hidden = true;
      mergeAll.forEach(button => { button.disabled = true; });
      status.textContent = message;
    }

    form.addEventListener("input", () => invalidate());
    form.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    root.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      const { action, go, merge: target, change } = button.dataset;
      if (action === "navigation" && navigation) {
        const collapsed = root.dataset.navigation !== "collapsed";
        root.dataset.navigation = collapsed ? "collapsed" : "expanded";
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.textContent = collapsed ? "Show navigation" : "Hide navigation";
      } else if (action === "edit") {
        pinned = false;
        form.style.scrollMarginTop = workspace.style.getPropertyValue("--dc-top");
        form.scrollIntoView({ block: "start", behavior: "instant" });
        original.focus({ preventScroll: true });
      } else if (action === "swap") {
        [original.value, changed.value] = [changed.value, original.value];
        invalidate("Texts swapped. Find differences to compare.");
      } else if (action === "clear") {
        original.value = changed.value = "";
        invalidate("Ready to compare.");
        original.focus();
      } else if (go !== undefined) {
        const block = output.querySelector(`#dc-change-${Number(go)}`);
        if (block) {
          pinned = true;
          fitWorkspace();
          output.scrollTop += block.getBoundingClientRect().top - output.getBoundingClientRect().top;
          block.focus({ preventScroll: true });
          overview.querySelector("[aria-current]")?.removeAttribute("aria-current");
          overview.querySelector(`[data-go="${Number(go)}"]`)?.setAttribute("aria-current", "location");
        }
      } else if (target && comparison) {
        const editor = target === "left" ? original : changed;
        const scrollTop = output.scrollTop;
        editor.value = merge(comparison, target, change === undefined ? undefined : Number(change));
        render();
        output.scrollTop = scrollTop;
        output.focus({ preventScroll: true });
      }
    });

    function render() {
      try {
        comparison = compare(original.value, changed.value, {
          ignoreCase: form.elements.ignoreCase.checked,
          ignoreWhitespace: form.elements.ignoreWhitespace.checked
        });
        const { changes, blocks, removed, added } = comparison;
        const fragment = document.createDocumentFragment();
        for (const block of blocks) {
          const section = element("section", { class: block.equal ? "dc-context" : "dc-block" });
          if (!block.equal) {
            const label = `Change ${block.index + 1} of ${changes.length}`;
            section.id = `dc-change-${block.index}`;
            section.tabIndex = -1;
            section.setAttribute("aria-label", label);
            const title = element("div", { class: "dc-block-title" }, element("span", {}, label));
            for (const [step, label, arrow] of [[-1, "Previous change", "↑"], [1, "Next change", "↓"]]) {
              const target = block.index + step;
              const disabled = target < 0 || target >= changes.length;
              title.append(element("button", {
                type: "button", class: "md-button dc-change-nav", "data-go": target, disabled,
                "aria-label": label, "aria-controls": disabled ? null : `dc-change-${target}`
              }, `${arrow} ${label}`));
            }
            section.append(title);
          }
          // Chunks let the browser skip layout of rows outside the viewport.
          for (let index = 0; index < block.rows.length; index += 100) {
            const rows = block.rows.slice(index, index + 100);
            const chunk = element("div", { class: "dc-chunk", style: `--dc-rows:${rows.length}` });
            for (const row of rows) {
              chunk.append(element("div", { class: "dc-row" }, cell(row.left, "left", !block.equal), cell(row.right, "right", !block.equal)));
            }
            section.append(chunk);
          }
          if (!block.equal) {
            const actions = element("div", { class: "dc-block-actions" });
            for (const target of ["right", "left"]) {
              actions.append(element("button", {
                type: "button", class: "md-button dc-merge", "data-merge": target, "data-change": block.index,
                "aria-label": `Merge block ${block.index + 1} from ${target === "right" ? "original to changed" : "changed to original"}`
              }, target === "right" ? "Merge block →" : "← Merge block"));
            }
            section.append(actions);
          }
          fragment.append(section);
        }
        output.replaceChildren(fragment);
        results.hidden = !comparison.left && !comparison.right;
        back.hidden = results.hidden;
        workspace.toggleAttribute("data-active", !results.hidden);
        mergeAll.forEach(button => { button.disabled = !changes.length; });
        status.textContent = changes.length
          ? `${changes.length} changed ${changes.length === 1 ? "block" : "blocks"} · ${removed} removed word${removed === 1 ? "" : "s"} · ${added} added word${added === 1 ? "" : "s"}`
          : `No differences${form.elements.ignoreCase.checked || form.elements.ignoreWhitespace.checked ? " with the selected options" : ""}.`;
        fitWorkspace();
        drawOverview();
      } catch (error) {
        invalidate(error.message);
      }
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      render();
      if (!results.hidden) {
        pinned = true;
        workspace.scrollIntoView({ block: "start", behavior: "instant" });
        // Sticky headers may settle into a new position after scrolling.
        fitWorkspace();
        output.scrollTop = 0;
        output.focus({ preventScroll: true });
      }
    });
  }

  if (typeof document$ !== "undefined") document$.subscribe(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
