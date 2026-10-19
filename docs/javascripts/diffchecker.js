/* Local, dependency-free word comparison and two-way merging. */
(() => {
  "use strict";

  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "word" }) : null;

  function words(text, options, budget = 100000) {
    const segments = segmenter ? segmenter.segment(text)
      : text.matchAll(/[\p{L}\p{N}\p{M}_]+|[^\S\r\n]+|\r\n|[\s\S]/gu);
    const tokens = [];
    for (const part of segments) {
      const segment = part.segment ?? part[0], index = part.index;
      if (options.ignoreWhitespace && /^[^\S\r\n]+$/u.test(segment)) continue;
      if (tokens.length >= budget) {
        throw new Error("Please compare a smaller section (up to 100,000 word, punctuation and whitespace tokens combined).");
      }
      let key = segment.replace(/\r\n?/g, "\n");
      if (options.ignoreCase) key = key.toLowerCase();
      tokens.push({ key, start: index, end: index + segment.length,
        word: part.isWordLike ?? /[\p{L}\p{N}]/u.test(segment) });
    }
    return tokens;
  }

  // Use Myers for nearby edits, with a bounded trace. For larger edit counts,
  // indexed common tokens keep unchanged sections instead of replacing them all.
  function diff(a, b) {
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
      let key = match[0].replace(/\r\n?/g, "\n");
      if (options.ignoreWhitespace) key = key.replace(/[^\S\n]+/gu, "");
      if (options.ignoreCase) key = key.toLowerCase();
      return { text: match[0], content: match[0].replace(/(?:\r\n?|\n)$/, ""),
        start: match.index, end: match.index + match[0].length, number: index + 1, key };
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
        block.rows = [];
        for (let j = 0; j < Math.max(l - startL, r - startR); j++) {
          const a = block.leftLines[j], b = block.rightLines[j];
          const wa = words(a?.text || "", options, budget);
          const wb = words(b?.text || "", options, budget - wa.length);
          budget -= wa.length + wb.length;
          const marks = { left: [], right: [] };
          let x = 0, y = 0;
          for (const edit of diff(wa.map(word => word.key), wb.map(word => word.key))) {
            if (edit === "equal") { x++; y++; }
            else if (edit === "delete") { marks.left.push(wa[x]); removed += Number(wa[x++].word); }
            else { marks.right.push(wb[y]); added += Number(wb[y++].word); }
          }
          block.rows.push({ left: a ? { ...a, marks: marks.left } : null,
            right: b ? { ...b, marks: marks.right } : null });
        }
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

  // Keep the comparison engine testable without a browser or dependencies.
  if (typeof module !== "undefined" && module.exports) module.exports = { compare, merge };
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
      for (const token of line.marks) {
        const start = Math.min(token.start, line.content.length);
        const end = Math.min(token.end, line.content.length);
        text.append(line.content.slice(cursor, start));
        if (end > start) text.append(element("mark", {}, line.content.slice(start, end)));
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
    const results = root.querySelector(".dc-results");
    const output = root.querySelector(".dc-comparison");
    const mergeAll = root.querySelectorAll(".dc-actions [data-merge]");
    let comparison;
    syncScroll(original, changed);

    const navigation = document.querySelector(".md-sidebar--primary");
    const toggle = root.querySelector('[data-action="navigation"]');
    if (navigation) {
      if (!navigation.id) navigation.id = "dc-navigation";
      toggle.setAttribute("aria-controls", navigation.id);
    }

    function invalidate(message = "Text or options changed. Find differences to update the results.") {
      results.hidden = true;
      comparison = null;
      output.replaceChildren();
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
          block.scrollIntoView({ block: "start", behavior: "auto" });
          block.focus({ preventScroll: true });
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
        mergeAll.forEach(button => { button.disabled = !changes.length; });
        status.textContent = changes.length
          ? `${changes.length} changed ${changes.length === 1 ? "block" : "blocks"} · ${removed} removed ${removed === 1 ? "word" : "words"} · ${added} added ${added === 1 ? "word" : "words"}`
          : `No differences${form.elements.ignoreCase.checked || form.elements.ignoreWhitespace.checked ? " with the selected options" : ""}.`;
      } catch (error) {
        invalidate(error.message);
      }
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      render();
    });
  }

  if (typeof document$ !== "undefined") document$.subscribe(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
