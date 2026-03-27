// Encyclopedia – tra cứu bách khoa lệnh LaTeX

class Encyclopedia {
  constructor(containerEl, searchEl, categoryEl) {
    this.container = containerEl;
    this.search = searchEl;
    this.category = categoryEl;
    this.commands = [];
    this._bind();
  }

  async load() {
    try {
      const resp = await fetch("data/commands.json");
      this.commands = await resp.json();
    } catch (e) {
      // Fallback nếu chạy local không có server
      this.commands = [];
      console.warn("Không tải được commands.json:", e);
    }
    this._buildCategories();
    this._render();
  }

  _bind() {
    this.search.addEventListener("input", () => this._render());
    this.category.addEventListener("change", () => this._render());
  }

  _buildCategories() {
    const cats = [...new Set(this.commands.map(c => c.category))].sort();
    cats.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      this.category.appendChild(opt);
    });
  }

  _render() {
    const query = this.search.value.toLowerCase().trim();
    const cat = this.category.value;
    let filtered = this.commands;
    if (cat) filtered = filtered.filter(c => c.category === cat);
    if (query) filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );

    this.container.innerHTML = "";
    if (filtered.length === 0) {
      this.container.innerHTML = `<div class="enc-empty">Không tìm thấy lệnh nào. Thử từ khoá khác nhé.</div>`;
      return;
    }

    // Group by category
    const groups = {};
    filtered.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });

    Object.entries(groups).forEach(([catName, cmds]) => {
      const group = document.createElement("div");
      group.className = "enc-group";
      group.innerHTML = `<div class="enc-group-title">${catName}</div>`;
      cmds.forEach(cmd => {
        const card = document.createElement("div");
        card.className = "enc-card";
        card.innerHTML = `
          <div class="enc-card-header">
            <code class="enc-name">${this._esc(cmd.name)}</code>
            <span class="enc-category-badge">${this._esc(cmd.category)}</span>
          </div>
          <div class="enc-desc">${this._esc(cmd.description)}</div>
          <div class="enc-syntax-row">
            <span class="enc-label">Cú pháp</span>
            <code class="enc-syntax">${this._esc(cmd.syntax)}</code>
            <button class="enc-copy-btn" title="Sao chép cú pháp" data-copy="${this._escAttr(cmd.syntax)}">Copy</button>
          </div>
          <div class="enc-example-row">
            <span class="enc-label">Ví dụ</span>
            <code class="enc-example">${this._esc(cmd.example)}</code>
            <button class="enc-copy-btn" title="Chèn vào editor" data-insert="${this._escAttr(cmd.example)}">Chèn</button>
          </div>
          <div class="enc-output-row">
            <span class="enc-label">Kết quả</span>
            <span class="enc-output">${this._esc(cmd.output)}</span>
          </div>
        `;
        group.appendChild(card);
      });
      this.container.appendChild(group);
    });

    // Copy / Insert handlers
    this.container.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.copy);
        this._toast("Đã sao chép!");
      });
    });
    this.container.querySelectorAll("[data-insert]").forEach(btn => {
      btn.addEventListener("click", () => {
        window.insertToEditor && window.insertToEditor(btn.dataset.insert);
        this._toast("Đã chèn vào editor!");
      });
    });
  }

  _toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("toast-show"), 10);
    setTimeout(() => { t.classList.remove("toast-show"); setTimeout(() => t.remove(), 300); }, 2000);
  }

  _esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  _escAttr(s) { return String(s).replace(/"/g, "&quot;"); }
}
