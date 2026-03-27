// Autocomplete / gợi ý lệnh LaTeX
// Thêm lệnh mới vào mảng LATEX_COMMANDS bên dưới

const LATEX_COMMANDS = [
  // Cấu trúc
  { trigger: "\\documentclass", label: "\\documentclass[]{}", desc: "Khai báo loại tài liệu" },
  { trigger: "\\usepackage", label: "\\usepackage{}", desc: "Nhập gói lệnh" },
  { trigger: "\\begin", label: "\\begin{}", desc: "Bắt đầu môi trường" },
  { trigger: "\\end", label: "\\end{}", desc: "Kết thúc môi trường" },
  { trigger: "\\title", label: "\\title{}", desc: "Tiêu đề tài liệu" },
  { trigger: "\\author", label: "\\author{}", desc: "Tên tác giả" },
  { trigger: "\\maketitle", label: "\\maketitle", desc: "In trang tiêu đề" },
  { trigger: "\\section", label: "\\section{}", desc: "Mục cấp 1" },
  { trigger: "\\subsection", label: "\\subsection{}", desc: "Mục cấp 2" },
  { trigger: "\\subsubsection", label: "\\subsubsection{}", desc: "Mục cấp 3" },
  { trigger: "\\tableofcontents", label: "\\tableofcontents", desc: "Mục lục tự động" },
  { trigger: "\\newpage", label: "\\newpage", desc: "Sang trang mới" },
  // Toán học
  { trigger: "\\frac", label: "\\frac{}{}", desc: "Phân số" },
  { trigger: "\\sqrt", label: "\\sqrt{}", desc: "Căn bậc hai" },
  { trigger: "\\sum", label: "\\sum_{}^{}", desc: "Tổng sigma" },
  { trigger: "\\int", label: "\\int_{}^{}", desc: "Tích phân" },
  { trigger: "\\lim", label: "\\lim_{}", desc: "Giới hạn" },
  { trigger: "\\infty", label: "\\infty", desc: "Vô cùng ∞" },
  { trigger: "\\alpha", label: "\\alpha", desc: "α" },
  { trigger: "\\beta", label: "\\beta", desc: "β" },
  { trigger: "\\gamma", label: "\\gamma", desc: "γ" },
  { trigger: "\\delta", label: "\\delta", desc: "δ" },
  { trigger: "\\Delta", label: "\\Delta", desc: "Δ" },
  { trigger: "\\pi", label: "\\pi", desc: "π" },
  { trigger: "\\theta", label: "\\theta", desc: "θ" },
  { trigger: "\\lambda", label: "\\lambda", desc: "λ" },
  { trigger: "\\sigma", label: "\\sigma", desc: "σ" },
  { trigger: "\\mu", label: "\\mu", desc: "μ" },
  { trigger: "\\omega", label: "\\omega", desc: "ω" },
  { trigger: "\\leq", label: "\\leq", desc: "≤" },
  { trigger: "\\geq", label: "\\geq", desc: "≥" },
  { trigger: "\\neq", label: "\\neq", desc: "≠" },
  { trigger: "\\approx", label: "\\approx", desc: "≈" },
  { trigger: "\\times", label: "\\times", desc: "×" },
  { trigger: "\\cdot", label: "\\cdot", desc: "· (dấu nhân)" },
  { trigger: "\\pm", label: "\\pm", desc: "±" },
  { trigger: "\\in", label: "\\in", desc: "∈" },
  { trigger: "\\mathbb", label: "\\mathbb{}", desc: "Ký hiệu tập hợp số ℝ ℕ ℤ" },
  { trigger: "\\vec", label: "\\vec{}", desc: "Vectơ" },
  { trigger: "\\hat", label: "\\hat{}", desc: "Dấu mũ ^" },
  { trigger: "\\overline", label: "\\overline{}", desc: "Gạch trên" },
  { trigger: "\\underbrace", label: "\\underbrace{}_{}",  desc: "Ngoặc dưới có nhãn" },
  { trigger: "\\cdots", label: "\\cdots", desc: "··· ba chấm giữa" },
  // Định dạng
  { trigger: "\\textbf", label: "\\textbf{}", desc: "In đậm" },
  { trigger: "\\textit", label: "\\textit{}", desc: "In nghiêng" },
  { trigger: "\\underline", label: "\\underline{}", desc: "Gạch chân" },
  { trigger: "\\emph", label: "\\emph{}", desc: "Nhấn mạnh" },
  { trigger: "\\textcolor", label: "\\textcolor{}{}", desc: "Màu chữ" },
  { trigger: "\\hspace", label: "\\hspace{}", desc: "Khoảng cách ngang" },
  { trigger: "\\vspace", label: "\\vspace{}", desc: "Khoảng cách dọc" },
  // Danh sách
  { trigger: "\\itemize", label: "\\begin{itemize}\n  \\item \n\\end{itemize}", desc: "Danh sách gạch đầu dòng" },
  { trigger: "\\enumerate", label: "\\begin{enumerate}\n  \\item \n\\end{enumerate}", desc: "Danh sách đánh số" },
  { trigger: "\\item", label: "\\item ", desc: "Phần tử danh sách" },
  // Hình / bảng
  { trigger: "\\includegraphics", label: "\\includegraphics[width=0.8\\textwidth]{}", desc: "Chèn hình ảnh" },
  { trigger: "\\caption", label: "\\caption{}", desc: "Chú thích hình/bảng" },
  { trigger: "\\label", label: "\\label{}", desc: "Gán nhãn tham chiếu" },
  { trigger: "\\ref", label: "\\ref{}", desc: "Tham chiếu đến nhãn" },
  { trigger: "\\footnote", label: "\\footnote{}", desc: "Chú thích cuối trang" },
  { trigger: "\\cite", label: "\\cite{}", desc: "Trích dẫn tài liệu" },
  // Ký hiệu đặc biệt
  { trigger: "\\%", label: "\\%", desc: "Ký hiệu %" },
  { trigger: "\\$", label: "\\$", desc: "Ký hiệu $" },
  { trigger: "\\&", label: "\\&", desc: "Ký hiệu &" },
  { trigger: "\\ldots", label: "\\ldots", desc: "Dấu ..." },
];

class Autocomplete {
  constructor(editor, dropdownEl) {
    this.editor = editor;
    this.dropdown = dropdownEl;
    this.active = false;
    this.selectedIndex = 0;
    this.currentMatches = [];
    this.currentWord = "";
    this._bind();
  }

  _bind() {
    this.editor.addEventListener("input", () => this._onInput());
    this.editor.addEventListener("keydown", (e) => this._onKeydown(e));
    document.addEventListener("click", (e) => {
      if (!this.dropdown.contains(e.target)) this._hide();
    });
  }

  _getWordBeforeCursor() {
    const pos = this.editor.selectionStart;
    const text = this.editor.value.substring(0, pos);
    const match = text.match(/\\[a-zA-Z]*$/);
    return match ? match[0] : "";
  }

  _onInput() {
    const word = this._getWordBeforeCursor();
    if (!word || word.length < 2) { this._hide(); return; }
    this.currentWord = word;
    const matches = LATEX_COMMANDS.filter(c =>
      c.trigger.startsWith(word) && c.trigger !== word
    );
    if (matches.length === 0) { this._hide(); return; }
    this.currentMatches = matches;
    this.selectedIndex = 0;
    this._render();
  }

  _render() {
    this.dropdown.innerHTML = "";
    this.currentMatches.slice(0, 8).forEach((cmd, i) => {
      const item = document.createElement("div");
      item.className = "ac-item" + (i === this.selectedIndex ? " ac-selected" : "");
      item.innerHTML = `<span class="ac-cmd">${this._escHtml(cmd.label)}</span><span class="ac-desc">${this._escHtml(cmd.desc)}</span>`;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this._insert(cmd);
      });
      this.dropdown.appendChild(item);
    });
    this._positionDropdown();
    this.dropdown.style.display = "block";
    this.active = true;
  }

  _positionDropdown() {
    const rect = this.editor.getBoundingClientRect();
    // Position below the editor area
    this.dropdown.style.left = rect.left + "px";
    this.dropdown.style.top = (rect.bottom + 2) + "px";
    this.dropdown.style.width = Math.min(380, rect.width) + "px";
  }

  _onKeydown(e) {
    if (!this.active) return;
    if (e.key === "ArrowDown") { e.preventDefault(); this._move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); this._move(-1); }
    else if (e.key === "Tab" || e.key === "Enter") {
      if (this.active && this.currentMatches.length > 0) {
        e.preventDefault();
        this._insert(this.currentMatches[this.selectedIndex]);
      }
    } else if (e.key === "Escape") { this._hide(); }
  }

  _move(dir) {
    this.selectedIndex = (this.selectedIndex + dir + this.currentMatches.length) % Math.min(this.currentMatches.length, 8);
    this._render();
  }

  _insert(cmd) {
    const pos = this.editor.selectionStart;
    const text = this.editor.value;
    const before = text.substring(0, pos - this.currentWord.length);
    const after = text.substring(pos);
    const inserted = cmd.label;
    this.editor.value = before + inserted + after;
    // Position cursor inside first {} if exists
    const cursorOffset = inserted.indexOf("{}");
    const newPos = before.length + (cursorOffset >= 0 ? cursorOffset + 1 : inserted.length);
    this.editor.setSelectionRange(newPos, newPos);
    this.editor.focus();
    this._hide();
    this.editor.dispatchEvent(new Event("input"));
  }

  _hide() {
    this.dropdown.style.display = "none";
    this.active = false;
    this.currentMatches = [];
  }

  _escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
