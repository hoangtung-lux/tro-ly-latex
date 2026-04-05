window.initConverter = function() {
    const input = document.getElementById("conv-input");
    const output = document.getElementById("conv-output");
    const info = document.getElementById("conv-info");
    const btnConvert = document.getElementById("btn-convert");
    const btnInsert = document.getElementById("btn-conv-insert");

    if (btnConvert) btnConvert.addEventListener("click", convert);

    window.performConversion = convert;

    function convert() {
        const text = input.value;
        if (!text.trim()) return;

        const rules = [
            // Basic Math
            { id: "frac", name: "Phân số", cmd: "\\frac", pattern: /phân số\s+(.+)\s+trên\s+(.+)/gi, replace: "\\frac{$1}{$2}" },
            { id: "frac", name: "Phân số", cmd: "\\frac", pattern: /(.+)\s*\/\s*(.+)/g, replace: "\\frac{$1}{$2}" },
            { id: "sqrt", name: "Căn bậc hai", cmd: "\\sqrt{}", pattern: /(?:căn bậc hai|can bac hai|căn|can)\s*(?:của|cua)?\s*(.+)/gi, replace: "\\sqrt{$1}" },
            { id: "sqrt", name: "Căn bậc n", cmd: "\\sqrt", pattern: /căn bậc\s+(.+)\s+của\s+(.+)/gi, replace: "\\sqrt[$1]{$2}" },
            { id: "pow", name: "Lũy thừa", cmd: "^{}", pattern: /(.+)\s+(?:mũ|mu)\s+(.+)/gi, replace: "$1^{$2}" },
            
            // Calculus
            { id: "lim", name: "Giới hạn (Limit)", cmd: "\\lim", pattern: /giới hạn\s+(?:của\s+)?(.+)\s+khi\s+x\s+(?:tiến tới|tien toi)\s+(.+)/gi, replace: "\\lim_{x \\to $2} $1" },
            { id: "int", name: "Tích phân (Integral)", cmd: "\\int", pattern: /tích phân\s+(?:từ\s+)?(.+)\s+(?:đến|den)\s+(.+)\s+của\s+(.+)/gi, replace: "\\int_{$1}^{$2} $3 dx" },
            
            // Trigonometry
            { id: "trig", name: "Lượng giác", cmd: "\\sin, \\cos", pattern: /(sin|cos|tan|cot)\s*(.+)/gi, replace: "\\$1($2)" },
            
            // Vectors & Grouping
            { id: "vec", name: "Vectơ", cmd: "\\vec", pattern: /(?:vectơ|vector|vec)\s+(.+)/gi, replace: "\\vec{$1}" },
            { id: "log", name: "Logarit", cmd: "\\log", pattern: /log\s+(.+)\s+(?:của|cua)\s+(.+)/gi, replace: "\\log_{$1} $2" },
            { id: "ln", name: "Logarit tự nhiên", cmd: "\\ln", pattern: /ln\s*(.+)/gi, replace: "\\ln($1)" },

            // Symbols
            { id: "leq", name: "Nhỏ hơn hoặc bằng", cmd: "\\leq", pattern: /(?:nhỏ hơn hoặc bằng|nho hon hoac bang)/gi, replace: "\\leq" },
            { id: "geq", name: "Lớn hơn hoặc bằng", cmd: "\\geq", pattern: /(?:lớn hơn hoặc bằng|lon hon hoac bang)/gi, replace: "\\geq" },
            { id: "alpha", name: "Alpha", cmd: "\\alpha", pattern: /alpha/gi, replace: "\\alpha" },
            { id: "pi", name: "Pi", cmd: "\\pi", pattern: /pi/gi, replace: "\\pi" },

            // TikZ
            { id: "tikz-circle", name: "Vẽ đường tròn", cmd: "\\draw circle", pattern: /(?:vẽ đường tròn|ve duong tron)\s+tâm\s+(.+)\s+bán kính\s+(.+)/gi, replace: "\\draw ($1) circle ($2);" },
            { id: "tikz-line", name: "Vẽ đoạn thẳng", cmd: "\\draw --", pattern: /(?:vẽ đoạn thẳng|ve doan thang)\s+từ\s+(.+)\s+đến\s+(.+)/gi, replace: "\\draw ($1) -- ($2);" }
        ];

        let result = text;
        let usedRules = [];
        let isDrawing = false;

        rules.forEach(rule => {
            if (result.match(rule.pattern)) {
                result = result.replace(rule.pattern, rule.replace);
                if (!usedRules.some(r => r.id === rule.id)) usedRules.push(rule);
                if (rule.id.startsWith("tikz-")) isDrawing = true;
            }
        });

        if (isDrawing) {
            result = `\\begin{tikzpicture}\n  ${result}\n\\end{tikzpicture}`;
        } else if (!result.includes("\\begin") && !result.includes("$")) {
            result = `$ ${result} $`;
        }

        output.value = result;
        renderInfo(usedRules);
    }

    function renderInfo(usedRules) {
        if (!info) return;
        if (usedRules.length === 0) {
            info.innerHTML = "Nhập bài toán để xem giải thích lệnh LaTeX tại đây nhé!";
            return;
        }
        let html = `<strong>Các lệnh đã dùng:</strong><ul style="margin-top:0.5rem; list-style:none;">`;
        usedRules.forEach(r => {
            html += `<li style="margin-bottom:0.25rem;">- ${r.name}: <code>${r.cmd}</code></li>`;
        });
        html += `</ul>`;
        info.innerHTML = html;
    }

    if (btnInsert) {
        btnInsert.addEventListener("click", () => {
            if (output.value && window.insertToEditor) {
                window.insertToEditor(output.value);
                if (window.toast) window.toast("Đã chèn vào Editor!");
            }
        });
    }
};
