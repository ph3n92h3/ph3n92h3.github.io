---
title: Diffchecker
hide:
  - toc
---

# Diffchecker

Compare text word by word and merge changes by block. Text is processed locally in your browser.

<div class="diffchecker" data-diffchecker>
  <button type="button" class="md-button dc-navigation-toggle" data-action="navigation" aria-expanded="true">Hide navigation</button>
  <form>
    <div class="dc-editors">
      <div>
        <label for="dc-original">Original text</label>
        <textarea id="dc-original" spellcheck="false" placeholder="Paste the original text here…" aria-describedby="dc-hint"></textarea>
      </div>
      <div>
        <label for="dc-changed">Changed text</label>
        <textarea id="dc-changed" spellcheck="false" placeholder="Paste the changed text here…" aria-describedby="dc-hint"></textarea>
      </div>
    </div>
    <div class="dc-options">
      <label><input type="checkbox" name="ignoreCase"> Ignore case</label>
      <label><input type="checkbox" name="ignoreWhitespace"> Ignore spaces and tabs</label>
    </div>
    <div class="dc-actions">
      <button type="submit" class="md-button md-button--primary">Find differences</button>
      <button type="button" class="md-button" data-action="swap">Swap</button>
      <button type="button" class="md-button" data-action="clear">Clear</button>
      <button type="button" class="md-button" data-merge="right" disabled>Merge all →</button>
      <button type="button" class="md-button" data-merge="left" disabled>← Merge all</button>
    </div>
  </form>
  <p id="dc-hint" class="dc-hint">Ctrl / ⌘ + Enter to compare. Each block contains consecutive changed lines; darker highlights mark changed words. Spaces, indentation and line breaks are preserved. Use → or ← to merge a whole block into the other side. Both sides scroll together. Line endings are treated as equivalent; a final newline counts as a change.</p>
  <p class="dc-status" role="status" aria-live="polite" aria-atomic="true">Ready to compare.</p>
  <div class="dc-results" hidden role="region" aria-label="Text comparison results">
    <div class="dc-result-head"><span>Original</span><span>Changed</span></div>
    <div class="dc-comparison" tabindex="0" role="region" aria-label="Synchronized text comparison"></div>
  </div>
  <noscript>Please enable JavaScript to compare text.</noscript>
</div>
