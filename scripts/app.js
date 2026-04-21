/**
 * LaTeX Helper - Main Controller (Refactored for Clean Code)
 */

const App = {
    // --- Configuration & Data ---
    COMMANDS: [
        { name: "Phân số", cmd: "\\frac{a}{b}", desc: "Tạo phân số", category: "Toán học" },
        { name: "Căn bậc hai", cmd: "\\sqrt{x}", desc: "Căn bậc hai", category: "Toán học" },
        { name: "Lũy thừa", cmd: "x^{n}", desc: "Mũ n", category: "Toán học" },
        { name: "Tổng (Sigma)", cmd: "\\sum_{i=1}^{n}", desc: "Ký hiệu tổng", category: "Toán học" },
        { name: "Tích phân", cmd: "\\int_{a}^{b} f(x) dx", desc: "Tích phân", category: "Toán học" },
        { name: "Hệ tọa độ Oxy", cmd: "\\begin{tikzpicture}\n\\draw[->] (-1,0) -- (4,0) node[right] {$x$};\n\\draw[->] (0,-1) -- (0,4) node[above] {$y$};\n\\draw[step=1,gray!20,very thin] (-0.9,-0.9) grid (3.9,3.9);\n\\end{tikzpicture}", desc: "Mẫu vẽ Oxy chuyên nghiệp", category: "Hình học" },
        { name: "Tam giác ABC", cmd: "\\begin{tikzpicture}\n\\coordinate (A) at (0,3);\n\\coordinate (B) at (-2,0);\n\\coordinate (C) at (2,0);\n\\draw (A) -- (B) -- (C) -- cycle;\n\\node[above] at (A) {A};\n\\node[left] at (B) {B};\n\\node[right] at (C) {C};\n\\end{tikzpicture}", desc: "Vẽ tam giác cơ bản", category: "Hình học" }
    ],

    SUGGESTIONS: ["\\frac{}{}", "\\sqrt{}", "\\alpha", "\\beta", "\\gamma", "\\delta", "\\sum", "\\int", "\\infty", "\\text{}", "\\begin{enumerate}", "\\item", "\\begin{tikzpicture}"],

    // --- Core Methods ---
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadDraft();
        this.initExternalModules();
        this.renderEncy(this.COMMANDS);
        this.makeGrid();
    },

    cacheDOM() {
        this.input = document.getElementById("latex-input");
        this.preview = document.getElementById("latex-preview");
        this.autoList = document.getElementById("autocomplete-list");
        this.encySearch = document.getElementById("encyclopedia-search");
        
        // Table Builder elements
        this.rowsInput = document.getElementById("table-rows");
        this.colsInput = document.getElementById("table-cols");
        this.tableBooktabs = document.getElementById("table-booktabs");
        this.tableCenter = document.getElementById("table-center");
        this.tableCaption = document.getElementById("table-caption");
        this.tableLabel = document.getElementById("table-label");
    },

    bindEvents() {
        document.querySelectorAll("[data-tab]").forEach(el => {
            el.addEventListener("click", () => {
                this.switchTab(el.dataset.tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Global Hotkeys
        window.addEventListener("keydown", (e) => this.handleGlobalHotkeys(e));

        // Editor Logic
        if (this.input) {
            this.input.addEventListener("input", () => this.handleInput());
        }

        // Action Buttons
        this.setupActionButtons();

        // Utility Features
        if (this.encySearch) this.encySearch.addEventListener("input", (e) => this.handleEncySearch(e));
        if (this.rowsInput) this.rowsInput.addEventListener("input", () => this.makeGrid());
        if (this.colsInput) this.colsInput.addEventListener("input", () => this.makeGrid());
    },

    setupActionButtons() {
        const actions = {
            "btn-clear": () => { if(window.confirm("Xoá hết code?")) { this.input.value = ""; this.render(); } },
            "btn-copy": () => { navigator.clipboard.writeText(this.input.value); this.showToast("Đã sao chép mã nguồn!"); },
            "btn-export": () => this.exportFile(),
            "btn-conv-insert": () => this.insertToEditor(document.getElementById("conv-output").value),
            "btn-generate-table": () => this.generateTableCode(),
            "btn-table-insert": () => this.insertToEditor(document.getElementById("table-output-code").value)
        };

        Object.entries(actions).forEach(([id, fn]) => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = fn;
        });
    },

    // --- Tab Management ---
    switchTab(tabId) {
        const activeClass = "active";
        const currentTab = document.querySelector(".tab-content." + activeClass);
        const targetTab = document.getElementById(`tab-${tabId}`);
        
        if (!targetTab || currentTab === targetTab) return;

        // Update Navigation UI
        document.querySelectorAll(".nav-btn, .dropdown-item").forEach(el => el.classList.remove(activeClass));
        const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeBtn) {
            activeBtn.classList.add(activeClass);
            if (activeBtn.classList.contains("dropdown-item")) {
                document.querySelector(".dropdown .nav-btn").classList.add(activeClass);
            }
        }

        // Simple visibility toggle (CSS handles animation)
        if (currentTab) currentTab.classList.remove(activeClass);
        targetTab.classList.add(activeClass);
    },

    // --- Editor logic ---
    handleInput() {
        this.render();
        this.handleAutocomplete();
        localStorage.setItem("latex_draft_v2", this.input.value);
    },

    render() {
        if (!this.preview || !this.input) return;
        this.preview.innerHTML = this.input.value;
        if (window.renderMathInElement) {
            renderMathInElement(this.preview, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    },

    loadDraft() {
        if (!this.input) return;
        const saved = localStorage.getItem("latex_draft_v2");
        if (saved) {
            this.input.value = saved;
            this.render();
        }
    },

    handleAutocomplete() {
        const val = this.input.value;
        const pos = this.input.selectionStart;
        const textBefore = val.substring(0, pos);
        const lastSlash = textBefore.lastIndexOf("\\");
        
        this.autoList.innerHTML = "";
        if (lastSlash === -1) {
            this.autoList.style.display = "none";
            return;
        }
        
        const query = textBefore.substring(lastSlash).split(/\s/)[0];
        if (!query || query.length < 2) {
            this.autoList.style.display = "none";
            return;
        }

        const filtered = this.SUGGESTIONS.filter(s => s.startsWith(query));
        if (filtered.length === 0) {
            this.autoList.style.display = "none";
            return;
        }

        this.autoList.style.display = "block";
        
        const lines = textBefore.split("\n");
        const currentLineIndex = lines.length;
        const charInLine = lines[lines.length - 1].length;
        
        const topPos = Math.min(currentLineIndex * 28 + 20, this.input.offsetHeight - 100);
        const leftPos = Math.min(charInLine * 9 + 20, this.input.offsetWidth - 200);
        
        this.autoList.style.top = `${topPos}px`;
        this.autoList.style.left = `${leftPos}px`;
        this.autoList.style.bottom = "auto";

        filtered.forEach(s => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = s;
            div.onclick = () => {
                this.input.value = val.substring(0, lastSlash) + s + val.substring(pos);
                this.autoList.innerHTML = "";
                this.autoList.style.display = "none";
                this.render();
                this.input.focus();
            };
            this.autoList.appendChild(div);
        });
    },

    handleGlobalHotkeys(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.exportFile();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.render();
            this.showToast("Đã làm mới Preview!");
        }
    },

    // --- Actions ---
    exportFile() {
        const blob = new Blob([this.input.value], {type: "text/plain"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "tai_lieu_latex.tex";
        a.click();
        this.showToast("Đã tải tệp .tex!");
    },

    convertVNToLaTeX() {
        if (window.performConversion) {
            window.performConversion();
        }
    },

    generateTableCode() {
        const r = parseInt(this.rowsInput.value);
        const c = parseInt(this.colsInput.value);
        const useBooktabs = this.tableBooktabs.checked;
        const useCenter = this.tableCenter.checked;
        const caption = this.tableCaption.value.trim();
        const label = this.tableLabel.value.trim();

        let code = "";
        
        // Wrap in table environment if caption/label exists
        if (caption || label) {
            code += "\\begin{table}[ht!]\n";
        }
        
        if (useCenter) code += "  \\centering\n";
        
        const colSpec = useBooktabs ? "c".repeat(c) : "|c".repeat(c) + "|";
        code += `  \\begin{tabular}{${colSpec}}\n`;
        
        const topRule = useBooktabs ? "    \\toprule" : "    \\hline";
        const midRule = useBooktabs ? "    \\midrule" : "    \\hline";
        const bottomRule = useBooktabs ? "    \\bottomrule" : "    \\hline";
        
        code += `${topRule}\n`;
        
        for(let i=0; i<r; i++) {
            let cells = [];
            for(let j=0; j<c; j++) {
                const el = document.querySelector(`input[data-r="${i}"][data-c="${j}"]`);
                cells.push(el ? el.value : "");
            }
            code += "    " + cells.join(" & ") + " \\\\\n";
            if (i === 0 && r > 1) {
                code += `${midRule}\n`;
            } else if (i < r - 1 && !useBooktabs) {
                code += "    \\hline\n";
            }
        }
        
        code += `${bottomRule}\n`;
        code += "  \\end{tabular}\n";
        
        if (caption) code += `  \\caption{${caption}}\n`;
        if (label) code += `  \\label{${label}}\n`;
        
        if (caption || label) {
            code += "\\end{table}";
        } else if (useCenter && !caption && !label) {
            // If just centering without table environment, wrap in center
            code = `\\begin{center}\n${code.trim()}\n\\end{center}`;
        }

        document.getElementById("table-output-code").value = code.trim();
        this.showToast("Đã tạo bảng Pro Max!");
    },

    makeGrid() {
        if (!this.rowsInput || !this.colsInput) return;
        const r = Math.min(this.rowsInput.value, 20);
        const c = Math.min(this.colsInput.value, 10);
        let html = '<table style="border-collapse:separate; border-spacing:8px; margin: 0 auto;">';
        for(let i=0; i<r; i++) {
            html += '<tr>';
            for(let j=0; j<c; j++) {
                html += `<td><input type="text" data-r="${i}" data-c="${j}" placeholder="${i+1},${j+1}" class="grid-input"></td>`;
            }
            html += '</tr>';
        }
        document.getElementById("table-grid-wrapper").innerHTML = html + '</table>';
    },

    // --- Encyclopedia ---
    handleEncySearch(e) {
        const q = e.target.value.toLowerCase();
        this.renderEncy(this.COMMANDS.filter(c => 
            c.name.toLowerCase().includes(q) || 
            c.cmd.toLowerCase().includes(q) || 
            c.category.toLowerCase().includes(q)
        ));
    },

    renderEncy(data) {
        const res = document.getElementById("encyclopedia-results");
        if (!res) return;
        res.innerHTML = "";
        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "ency-card";
            card.innerHTML = `
                <span class="category-tag">${item.category}</span>
                <h4>${item.name}</h4>
                <code>${item.cmd}</code>
                <button class="insert-btn" onclick="App.insertToEditor(\`${item.cmd.replace(/\\/g, '\\\\')}\`)">Chèn vào Editor</button>
            `;
            res.appendChild(card);
        });
    },

    // --- Helpers ---
    insertToEditor(t) {
        const s = this.input.selectionStart;
        const e = this.input.selectionEnd;
        
        // Thêm khoảng trắng để tránh chen chúc (chen nhau)
        const prefix = (s > 0 && this.input.value[s-1] !== "\n") ? "\n\n" : "";
        const suffix = "\n";
        const content = prefix + t + suffix;
        
        this.input.value = this.input.value.substring(0, s) + content + this.input.value.substring(e);
        this.render();
        this.input.focus();
        this.input.selectionStart = s + content.length;
        this.input.selectionEnd = s + content.length;
        this.showToast("Đã chèn nội dung!");
        this.switchTab("editor");
    },

    showToast(m) {
        const t = document.createElement("div");
        t.className = "toast";
        t.textContent = m;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add("show"), 10);
        setTimeout(() => {
            t.classList.remove("show");
            setTimeout(() => t.remove(), 400);
        }, 3000);
    },

    initExternalModules() {
        if (window.initMCQWizard) window.initMCQWizard();
        if (window.initDocumentSetup) window.initDocumentSetup();
        if (window.initGeometryWizard) window.initGeometryWizard();
    },

    jumpToEncyclopedia(cat) {
        this.switchTab("encyclopedia");
        const filter = document.getElementById("category-filter");
        if (filter) {
            filter.value = cat;
            // Dispatch event to trigger encyclopedia's filter logic
            filter.dispatchEvent(new Event("change"));
        }
    }
};

// Start the App
document.addEventListener("DOMContentLoaded", () => App.init());

// Global exposed methods for HTML events
window.insertToEditor = (t) => App.insertToEditor(t);
window.showToast = (m) => App.showToast(m);
window.App = App;
