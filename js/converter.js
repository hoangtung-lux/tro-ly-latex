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

  async convert() {
    let text = this.input.value;
    if (!text.trim()) return;

    this.btnConvert.textContent = "Đang xử lý...";
    this.btnConvert.disabled = true;

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      
      this.output.value = data.latex;
      this.output.classList.add("pulse-highlight");
      setTimeout(() => this.output.classList.remove("pulse-highlight"), 1000);
      
      this._renderInfo(data.usedRules);
    } catch (err) {
      console.error(err);
      this._toast("Lỗi kết nối máy chủ chuyển đổi!");
    } finally {
      this.btnConvert.textContent = "Chuyển sang LaTeX";
      this.btnConvert.disabled = false;
    }
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
