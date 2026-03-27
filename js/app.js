// app.js – Logic chính của LaTeX Helper

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ── Editor ────────────────────────────────────────────────────────────────────
const editor = document.getElementById("latex-editor");
const preview = document.getElementById("preview-output");
const statusLine = document.getElementById("status-line");
const acDropdown = document.getElementById("ac-dropdown");

const TEMPLATE = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[vietnamese]{babel}
\\usepackage{amsmath, amssymb}
\\usepackage{tikz}

\\title{Tài liệu của tôi}
\\author{Tên tác giả}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Giới thiệu}
Viết nội dung của bạn ở đây...

\\end{document}`;

// Load từ localStorage hoặc dùng template
editor.value = localStorage.getItem("latex_draft") || TEMPLATE;

// Auto-save
editor.addEventListener("input", () => {
  localStorage.setItem("latex_draft", editor.value);
  updateStatus();
  renderPreview();
});

function updateStatus() {
  const lines = editor.value.split("\n").length;
  const chars = editor.value.length;
  const words = editor.value.trim().split(/\s+/).filter(Boolean).length;
  statusLine.textContent = `${lines} dòng · ${words} từ · ${chars} ký tự`;
}

// ── Preview (KaTeX-based render) ─────────────────────────────────────────────
function renderPreview() {
  const code = editor.value;
  
  // 1. Clear previous content
  preview.innerHTML = "";
  
  // 2. Create a container for rendering
  // We use a div to let KaTeX auto-render handle the math delimiters
  const container = document.createElement("div");
  container.className = "preview-paper";
  
  // Convert newlines to actual breaks for the paper view, 
  // but keep math blocks intact for KaTeX.
  // We'll use a simple escape + newline replacement.
  container.textContent = code;
  
  preview.appendChild(container);

  // 3. Trigger KaTeX auto-render
  if (window.renderMathInElement) {
    window.renderMathInElement(container, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
  }
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Tab key inserts spaces not changing focus ─────────────────────────────────
editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && !window._acActive) {
    e.preventDefault();
    const s = editor.selectionStart;
    const v = editor.value;
    editor.value = v.substring(0, s) + "  " + v.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = s + 2;
  }
});

// ── Autocomplete ──────────────────────────────────────────────────────────────
const ac = new Autocomplete(editor, acDropdown);

// ── Insert from encyclopedia ──────────────────────────────────────────────────
window.insertToEditor = (text) => {
  const s = editor.selectionStart;
  const v = editor.value;
  editor.value = v.substring(0, s) + text + v.substring(s);
  editor.selectionStart = editor.selectionEnd = s + text.length;
  editor.focus();
  editor.dispatchEvent(new Event("input"));
  // Switch to editor tab
  document.querySelector('[data-tab="tab-editor"]').click();
};

// ── Copy & Export ────────────────────────────────────────────────────────────
document.getElementById("btn-copy").addEventListener("click", () => {
  navigator.clipboard.writeText(editor.value).then(() => {
    showToast("Đã sao chép toàn bộ code.");
  });
});

document.getElementById("btn-export").addEventListener("click", () => {
  const blob = new Blob([editor.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "document.tex";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Đã tải file document.tex");
});

// ── Clear / Template ──────────────────────────────────────────────────────────
document.getElementById("btn-template").addEventListener("click", () => {
  if (confirm("Đặt lại về template mặc định? Draft hiện tại sẽ bị xoá.")) {
    editor.value = TEMPLATE;
    localStorage.setItem("latex_draft", TEMPLATE);
    renderPreview();
    updateStatus();
  }
});

document.getElementById("btn-clear").addEventListener("click", () => {
  if (confirm("Xoá toàn bộ nội dung editor?")) {
    editor.value = "";
    localStorage.removeItem("latex_draft");
    renderPreview();
    updateStatus();
  }
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("toast-show"), 10);
  setTimeout(() => { t.classList.remove("toast-show"); setTimeout(() => t.remove(), 300); }, 2200);
}

// ── Encyclopedia ──────────────────────────────────────────────────────────────
const enc = new Encyclopedia(
  document.getElementById("enc-list"),
  document.getElementById("enc-search"),
  document.getElementById("enc-category")
);
enc.load();

// ── Converter ─────────────────────────────────────────────────────────────────
const conv = new Converter(
  document.getElementById("converter-input"),
  document.getElementById("converter-output"),
  document.getElementById("converter-info"),
  document.getElementById("btn-convert-action"),
  document.getElementById("btn-converter-insert")
);

// ── Global Helper for Converter -> Encyclopedia ──────────────────────────────
window.showInEncyclopedia = (cmdName) => {
  // 1. Chuyển sang tab Bách khoa
  document.getElementById("btn-tab-encyclopedia").click();
  // 2. Điền text vào ô search
  const searchEl = document.getElementById("enc-search");
  searchEl.value = cmdName;
  // 3. Trigger sự kiện input để Encyclopedia tự filter
  searchEl.dispatchEvent(new Event("input"));
};

// ── Table Builder ─────────────────────────────────────────────────────────────
const tableBuilder = new TableBuilder(
  document.getElementById("tb-grid"),
  document.getElementById("tb-rows"),
  document.getElementById("tb-cols"),
  document.getElementById("tb-border"),
  document.getElementById("tb-center"),
  document.getElementById("tb-output"),
  document.getElementById("btn-tb-generate"),
  document.getElementById("btn-tb-insert")
);

// ── Init ──────────────────────────────────────────────────────────────────────
renderPreview();
updateStatus();
