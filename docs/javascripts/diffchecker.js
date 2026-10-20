/* Local, dependency-free text comparison and two-way merging. */
(() => {
  "use strict";

  const sides = ["left", "right"];
  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "word" }) : null;
  const characters = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

  function normalize(text, options) {
    let key = text.replace(/\r\n?/g, "\n");
    if (options.ignoreWhitespace) key = key.replace(/[^\S\n]+/gu, "");
    return options.ignoreCase ? key.toLowerCase() : key;
  }

  function* smartSegments(text) {
    const pieces = segmenter ? segmenter.segment(text)
      : text.matchAll(/[\p{L}\p{N}\p{M}_]+|[^\S\r\n]+|\r\n|[\s\S]/gu);
    for (const part of pieces) {
      const value = part.segment ?? part[0];
      if (!(part.isWordLike ?? /[\p{L}\p{N}]/u.test(value))) { yield part; continue; }
      for (const match of value.matchAll(/[\p{L}\p{M}]+|\p{N}+|[\s\S]/gu)) {
        yield { segment: match[0], index: part.index + match.index };
      }
    }
  }

  function tokenize(text, options, budget = 100000, character = false) {
    const segments = character ? (characters ? characters.segment(text) : text.matchAll(/\r\n|[\s\S]/gu))
      : smartSegments(text);
    const tokens = [];
    for (const part of segments) {
      const segment = part.segment ?? part[0], index = part.index;
      if (options.ignoreWhitespace && /^[^\S\r\n]+$/u.test(segment)) continue;
      if (tokens.length >= budget) {
        throw new Error("Please compare a smaller section (up to 100,000 comparison tokens combined).");
      }
      tokens.push({ key: normalize(segment, options), start: index, end: index + segment.length,
        word: character || (part.isWordLike ?? /[\p{L}\p{N}]/u.test(segment)) });
    }
    return tokens;
  }

  // Use Myers for nearby edits, with a bounded trace. For larger edit counts,
  // unique ordered anchors split larger edits before the indexed fallback.
  function diff(a, b, depth = 0) {
    let start = 0;
    let endA = a.length;
    let endB = b.length;
    while (start < endA && start < endB && a[start] === b[start]) start++;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
    const n = endA - start;
    const m = endB - start;
    const limit = Math.min(n + m, 512);
    const offset = limit + 1;
    const frontier = new Int32Array(2 * limit + 3);
    const trace = [];
    let middle = !n || !m ? [...Array(n).fill("delete"), ...Array(m).fill("insert")] : null;
    frontier.fill(-1);
    frontier[offset + 1] = 0;

    search: for (let d = 0; !middle && d <= limit; d++) {
      trace.push(frontier.slice());
      for (let k = -d; k <= d; k += 2) {
        const i = offset + k;
        let x = k === -d || (k !== d && frontier[i - 1] < frontier[i + 1])
          ? frontier[i + 1] : frontier[i - 1] + 1;
        let y = x - k;
        while (x < n && y < m && a[start + x] === b[start + y]) { x++; y++; }
        frontier[i] = x;
        if (x < n || y < m) continue;
        middle = [];
        for (let depth = d; depth >= 0; depth--) {
          const previous = trace[depth];
          const diagonal = x - y;
          const previousK = diagonal === -depth || (diagonal !== depth && previous[offset + diagonal - 1] < previous[offset + diagonal + 1])
            ? diagonal + 1 : diagonal - 1;
          const previousX = previous[offset + previousK];
          const previousY = previousX - previousK;
          while (x > previousX && y > previousY) { middle.push("equal"); x--; y--; }
          if (depth > 0) {
            if (x === previousX) { middle.push("insert"); y--; }
            else { middle.push("delete"); x--; }
          }
        }
        middle.reverse();
        break search;
      }
    }
    if (!middle) {
      const positions = new Map();
      for (let j = 0; j < m; j++) {
        const key = b[start + j];
        if (!positions.has(key)) positions.set(key, []);
        positions.get(key).push(j);
      }
      const unique = new Map(), candidates = [], tails = [];
      let width = 1;
      // Four-token anchors also identify context when individual characters
      // repeat throughout a long document. Overlapping anchors are skipped.
      for (const span of depth < 32 ? [1, 4] : []) {
        const keyAt = (tokens, index) => span === 1 ? tokens[start + index]
          : JSON.stringify(tokens.slice(start + index, start + index + span));
        const matchesByKey = span === 1 ? positions : new Map();
        if (span > 1) {
          for (let j = 0; j + span <= m; j++) {
            const key = keyAt(b, j);
            if (!matchesByKey.has(key)) matchesByKey.set(key, []);
            matchesByKey.get(key).push(j);
          }
        }
        unique.clear();
        for (let x = 0; x + span <= n; x++) {
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
        if (tails.length) { width = span; break; }
      }
      const anchors = [];
      for (let i = tails.at(-1) ?? -1; i >= 0; i = candidates[i].previous) anchors.push(candidates[i]);
      anchors.reverse();
      if (anchors.length) {
        const parts = [];
        let x = 0, y = 0;
        for (const anchor of [...anchors, { left: n, right: m }]) {
          if (anchor.left < x || anchor.right < y) continue;
          parts.push(diff(a.slice(start + x, start + anchor.left), b.slice(start + y, start + anchor.right), depth + 1));
          if (anchor.left < n) parts.push(Array(width).fill("equal"));
          x = anchor.left + width; y = anchor.right + width;
        }
        middle = parts.flat();
      }
      if (!middle) {
        middle = [];
        let y = 0;
        for (let x = 0; x < n; x++) {
          const matches = positions.get(a[start + x]) || [];
          let low = 0, high = matches.length;
          while (low < high) {
            const mid = (low + high) >>> 1;
            if (matches[mid] < y) low = mid + 1;
            else high = mid;
          }
          if (low === matches.length) middle.push("delete");
          else {
            while (y < matches[low]) { middle.push("insert"); y++; }
            middle.push("equal"); y++;
          }
        }
        while (y++ < m) middle.push("insert");
      }
    }
    return [
      ...Array(start).fill("equal"),
      ...middle,
      ...Array(a.length - endA).fill("equal")
    ];
  }

  function compare(original, changed, options = {}) {
    if (original.length + changed.length > 1000000) {
      throw new Error("Please compare a smaller section (up to 1,000,000 characters combined).");
    }
    const split = (text, budget = 20000) => Array.from(text.matchAll(/[^\r\n]*(?:\r\n?|\n)|[^\r\n]+$/g), (match, index) => {
      if (index >= budget) throw new Error("Please compare a smaller section (up to 20,000 lines combined).");
      return { text: match[0], content: match[0].replace(/(?:\r\n?|\n)$/, ""),
        start: match.index, end: match.index + match[0].length, number: index + 1, key: normalize(match[0], options) };
    });
    const left = split(original), right = split(changed, 20000 - left.length);
    const edits = diff(left.map(line => line.key), right.map(line => line.key));
    const blocks = [], changes = [];
    let l = 0, r = 0, removed = 0, added = 0, budget = 100000;
    for (let i = 0; i < edits.length;) {
      const equal = edits[i] === "equal", startL = l, startR = r;
      while (i < edits.length && (edits[i] === "equal") === equal) {
        const edit = edits[i++];
        if (edit !== "insert") l++;
        if (edit !== "delete") r++;
      }
      const block = {
        left: [left[startL]?.start ?? original.length, l > startL ? left[l - 1].end : left[startL]?.start ?? original.length],
        right: [right[startR]?.start ?? changed.length, r > startR ? right[r - 1].end : right[startR]?.start ?? changed.length],
        leftLines: left.slice(startL, l), rightLines: right.slice(startR, r), equal
      };
      if (!equal) {
        block.index = changes.length;
        const lines = { left: block.leftLines, right: block.rightLines };
        for (const side of sides) for (const line of lines[side]) line.marks = [];
        const input = { left: original.slice(...block.left), right: changed.slice(...block.right) };
        const wa = tokenize(input.left, options, budget);
        const wb = tokenize(input.right, options, budget - wa.length);
        budget -= wa.length + wb.length;
        const operations = diff(wa.map(word => word.key), wb.map(word => word.key));
        const marked = { left: [], right: [] };
        let x = 0, y = 0;
        for (let j = 0; j < operations.length;) {
          if (operations[j] === "equal") {
            x++; y++; j++;
            continue;
          }
          const startX = x, startY = y;
          while (j < operations.length && operations[j] !== "equal") {
            if (operations[j++] === "delete") removed += Number(wa[x++].word);
            else added += Number(wb[y++].word);
          }
          let group = { left: wa.slice(startX, x), right: wb.slice(startY, y) };
          const offset = {}, text = {}, fine = {};
          for (const side of sides) {
            offset[side] = group[side][0]?.start ?? 0;
            text[side] = group[side].length ? input[side].slice(offset[side], group[side].at(-1).end) : "";
          }
          // Bound refinement of unusually long tokens; the coarse word result
          // remains usable without allocating an unbounded character trace.
          if (text.left.length + text.right.length <= 8192) {
            for (const side of sides) {
              fine[side] = tokenize(text[side], options, budget, true);
              budget -= fine[side].length;
            }
            const edits = diff(fine.left.map(t => t.key), fine.right.map(t => t.key));
            const selected = { left: [], right: [] };
            let a = 0, b = 0;
            for (const edit of edits) {
              if (edit !== "insert") { if (edit === "delete") selected.left.push(fine.left[a]); a++; }
              if (edit !== "delete") { if (edit === "insert") selected.right.push(fine.right[b]); b++; }
            }
            const ratio = Math.max(selected.left.length / Math.max(1, fine.left.length), selected.right.length / Math.max(1, fine.right.length));
            if ((!text.left.trim() && !text.right.trim()) || ratio < .5) {
              group = selected;
              for (const side of sides) {
                group[side] = group[side].map(t => ({ ...t, start: t.start + offset[side], end: t.end + offset[side] }));
              }
            }
          }
          for (const side of sides) for (const token of group[side]) marked[side].push(token);
        }
        for (const side of sides) {
          let index = 0;
          for (const token of marked[side]) {
            const position = token.start + block[side][0];
            while (index + 1 < lines[side].length && position >= lines[side][index].end) index++;
            const offset = lines[side][index].start - block[side][0];
            lines[side][index].marks.push({ ...token, start: token.start - offset, end: token.end - offset });
          }
        }
        block.rows = Array.from({ length: Math.max(lines.left.length, lines.right.length) }, (_, index) => ({
          left: lines.left[index] ?? null, right: lines.right[index] ?? null
        }));
        changes.push(block);
      }
      blocks.push(block);
    }
    return { left: original, right: changed, blocks, changes, removed, added };
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

  function cell(line, side, changed) {
    const text = element("pre", { class: "dc-line-text" });
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
    return element("div", {
      class: `dc-line${changed ? ` dc-${side === "left" ? "remove" : "add"}-line` : ""}${line ? "" : " dc-gap"}`
    }, element("pre", { class: "dc-line-number", "aria-hidden": "true" }, String(line?.number ?? "")), text);
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
          type: "button", class: "dc-map-change", "data-go": index, "aria-label": label,
          "aria-controls": block.id, "aria-current": String(index) === current ? "location" : null, title: label,
          style: `top:${Math.min(99.25, 100 * (rect.top - top) / height)}%;height:${Math.max(.75, 100 * rect.height / height)}%`
        }, element("span", { class: change.leftLines.length ? "dc-map-remove" : "", "aria-hidden": "true" }),
        element("span", { class: change.rightLines.length ? "dc-map-add" : "", "aria-hidden": "true" })));
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
          const rows = block.rows ?? block.leftLines.map((line, index) => ({ left: line, right: block.rightLines[index] }));
          for (const row of rows) {
            section.append(element("div", { class: "dc-row" }, cell(row.left, "left", !block.equal), cell(row.right, "right", !block.equal)));
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
