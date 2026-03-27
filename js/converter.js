/**
 * Converter – Chuyển đổi ngôn ngữ tự nhiên / shorthand sang LaTeX
 * Chuyên dùng cho người Việt (mẹ soạn toán)
 */

class Converter {
  constructor(inputEl, outputEl, infoEl, btnConvert, btnInsert) {
    this.input = inputEl;
    this.output = outputEl;
    this.info = infoEl;
    this.btnConvert = btnConvert;
    this.btnInsert = btnInsert;
    this._bind();
  }

  _bind() {
    this.btnConvert.addEventListener("click", () => this.convert());
    this.input.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") this.convert();
    });
    this.btnInsert.addEventListener("click", () => {
      if (this.output.value.trim() && window.insertToEditor) {
        window.insertToEditor(this.output.value);
        this._toast("Đã chèn vào Editor!");
      }
    });
  }

  convert() {
    let text = this.input.value;
    if (!text.trim()) return;

    // ── Quy tắc chuyển đổi (từ cụm từ tự nhiên sang mã LaTeX) ──
    const rules = [
      { id: "frac", name: "Phân số", cmd: "\\frac", pattern: /phân số\s+(.+)\s+trên\s+(.+)/gi, replace: "\\frac{$1}{$2}" },
      { id: "frac", name: "Phân số", cmd: "\\frac", pattern: /(.+)\s*\/\s*(.+)/g, replace: "\\frac{$1}{$2}" },
      { id: "sqrt", name: "Căn bậc hai", cmd: "\\sqrt{}", pattern: /(?:căn bậc hai|can bac hai|căn|can)\s*(?:của|cua)?\s*(.+)/gi, replace: "\\sqrt{$1}" },
      { id: "sqrt", name: "Căn bậc n", cmd: "\\sqrt", pattern: /căn bậc\s+(.+)\s+của\s+(.+)/gi, replace: "\\sqrt[$1]{$2}" },
      { id: "pow", name: "Lũy thừa", cmd: "^{}", pattern: /(.+)\s+(?:mũ|mu)\s+(.+)/gi, replace: "$1^{$2}" },
      { id: "sub", name: "Chỉ số dưới", cmd: "_{}", pattern: /(.+)\s+(?:chỉ số dưới|chi so duoi)\s+(.+)/gi, replace: "$1_{$2}" },
      { id: "sum", name: "Tổng", cmd: "\\sum", pattern: /(?:tổng|tong)\s+(?:từ|tu)\s+(.+)\s+(?:đến|den)\s+(.+)/gi, replace: "\\sum_{$1}^{$2}" },
      { id: "sum", name: "Tổng sigma", cmd: "\\sum", pattern: /tổng\s+(.+)/gi, replace: "\\sum $1" },
      { id: "int", name: "Tích phân", cmd: "\\int", pattern: /(?:tích phân|tich phan)\s+(?:từ|tu)\s+(.+)\s+(?:đến|den)\s+(.+)/gi, replace: "\\int_{$1}^{$2}" },
      { id: "leq", name: "Nhỏ hơn hoặc bằng", cmd: "\\leq", pattern: /nhỏ hơn hoặc bằng/gi, replace: "\\leq" },
      { id: "geq", name: "Lớn hơn hoặc bằng", cmd: "\\geq", pattern: /lớn hơn hoặc bằng/gi, replace: "\\geq" },
      { id: "neq", name: "Khác (không bằng)", cmd: "\\neq", pattern: /khác/gi, replace: "\\neq" },
      { id: "approx", name: "Xấp xỉ", cmd: "\\approx", pattern: /xấp xỉ/gi, replace: "\\approx" },
      { id: "inf", name: "Vô cùng", cmd: "\\infty", pattern: /(?:vô cùng|vo cung)/gi, replace: "\\infty" },
      { id: "alpha", name: "Alpha", cmd: "\\alpha", pattern: /alpha/gi, replace: "\\alpha" },
      { id: "beta", name: "Beta", cmd: "\\beta", pattern: /beta/gi, replace: "\\beta" },
      { id: "pi", name: "Pi", cmd: "\\pi", pattern: /pi/gi, replace: "\\pi" },
      { id: "times", name: "Dấu nhân", cmd: "\\times", pattern: /nhân/gi, replace: "\\times" },
      { id: "in", name: "Thuộc tập hợp", cmd: "\\in", pattern: /(?:thuộc|thuoc)/gi, replace: "\\in" },
      { id: "real", name: "Tập số thực", cmd: "\\mathbb{R}", pattern: /(?:tập số thực|tap so thuc)/gi, replace: "\\mathbb{R}" },
      { id: "vec", name: "Vectơ", cmd: "\\vec", pattern: /(?:vectơ|vector)\s+(.+)/gi, replace: "\\vec{$1}" },
      // ── Hình học (TikZ) ──
      { id: "tikz-circle", name: "Vẽ đường tròn", cmd: "\\draw circle", pattern: /(?:vẽ đường tròn|ve duong tron)\s+tâm\s+(.+)\s+bán kính\s+(.+)/gi, replace: "\\draw ($1) circle ($2);" },
      { id: "tikz-line", name: "Vẽ đoạn thẳng", cmd: "\\draw --", pattern: /(?:vẽ đoạn thẳng|ve doan thang)\s+từ\s+(.+)\s+đến\s+(.+)/gi, replace: "\\draw ($1) -- ($2);" },
      { id: "tikz-rect", name: "Vẽ hình chữ nhật", cmd: "\\draw rectangle", pattern: /(?:vẽ hình chữ nhật|ve hinh chu nhat)\s+từ\s+(.+)\s+đến\s+(.+)/gi, replace: "\\draw ($1) rectangle ($2);" },
      { id: "tikz-point", name: "Vẽ điểm", cmd: "\\filldraw", pattern: /(?:vẽ điểm|ve diem)\s+(.+)\s+tại\s+(.+)/gi, replace: "\\filldraw ($2) circle (2pt) node[above] {$1};" },
      { id: "tikz-tri", name: "Vẽ tam giác", cmd: "\\draw cycle", pattern: /(?:vẽ tam giác|ve tam giac)\s+(.+)\s+(.+)\s+(.+)/gi, replace: "\\draw ($1) -- ($2) -- ($3) -- cycle;" },
    ];

    let result = text;
    let usedRules = [];
    let isDrawing = false;

    rules.forEach(rule => {
      if (rule.pattern.test(result)) {
        result = result.replace(rule.pattern, rule.replace);
        if (!usedRules.some(r => r.id === rule.id)) {
          usedRules.push(rule);
        }
        if (rule.id.startsWith("tikz-")) isDrawing = true;
      }
    });

    if (isDrawing) {
      result = `\\begin{tikzpicture}\n  ${result}\n\\end{tikzpicture}`;
    } else if (!result.includes("\\begin") && !result.includes("$")) {
      result = `$ ${result} $`;
    }

    this.output.value = result;
    this.output.classList.add("pulse-highlight");
    setTimeout(() => this.output.classList.remove("pulse-highlight"), 1000);

    this._renderInfo(usedRules);
  }

  _renderInfo(usedRules) {
    if (usedRules.length === 0) {
      this.info.innerHTML = `<div class="conv-info-empty">Nhập bài toán để xem giải thích lệnh LaTeX tại đây nhé!</div>`;
      return;
    }

    let html = `<div class="conv-info-title">Giải thích các lệnh đã dùng:</div>`;
    usedRules.forEach(rule => {
      html += `
        <div class="conv-info-item">
          <span class="conv-info-name">${rule.name}</span>
          <code class="conv-info-code">${rule.cmd}</code>
          <button class="conv-info-link" onclick="window.showInEncyclopedia('${rule.cmd}')">Học thêm</button>
        </div>
      `;
    });
    this.info.innerHTML = html;
  }

  _toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("toast-show"), 10);
    setTimeout(() => { t.classList.remove("toast-show"); setTimeout(() => t.remove(), 300); }, 2000);
  }
}
