/**
 * Converter Module
 */

window.initConverter = function() {
    const input = document.getElementById("conv-input");
    const output = document.getElementById("conv-output");
    const info = document.getElementById("conv-info");
    const btnConvert = document.getElementById("btn-convert");
    const btnInsert = document.getElementById("btn-conv-insert");

    btnConvert.addEventListener("click", convert);

    function convert() {
        const text = input.value;
        if (!text.trim()) return;

        const rules = [
            { id: "frac", name: "Phân số", cmd: "\\frac", pattern: /phân số\s+(.+)\s+trên\s+(.+)/gi, replace: "\\frac{$1}{$2}" },
            { id: "frac", name: "Phân số", cmd: "\\frac", pattern: /(.+)\s*\/\s*(.+)/g, replace: "\\frac{$1}{$2}" },
            { id: "sqrt", name: "Căn bậc hai", cmd: "\\sqrt{}", pattern: /(?:căn bậc hai|can bac hai|căn|can)\s*(?:của|cua)?\s*(.+)/gi, replace: "\\sqrt{$1}" },
            { id: "sqrt", name: "Căn bậc n", cmd: "\\sqrt", pattern: /căn bậc\s+(.+)\s+của\s+(.+)/gi, replace: "\\sqrt[$1]{$2}" },
            { id: "pow", name: "Lũy thừa", cmd: "^{}", pattern: /(.+)\s+(?:mũ|mu)\s+(.+)/gi, replace: "$1^{$2}" },
            { id: "sub", name: "Chỉ số dưới", cmd: "_{}", pattern: /(.+)\s+(?:chỉ số dưới|chi so duoi)\s+(.+)/gi, replace: "$1_{$2}" },
            { id: "leq", name: "Nhỏ hơn hoặc bằng", cmd: "\\leq", pattern: /(?:nhỏ hơn hoặc bằng|nho hon hoac bang)/gi, replace: "\\leq" },
            { id: "geq", name: "Lớn hơn hoặc bằng", cmd: "\\geq", pattern: /(?:lớn hơn hoặc bằng|lon hon hoac bang)/gi, replace: "\\geq" },
            { id: "alpha", name: "Alpha", cmd: "\\alpha", pattern: /alpha/gi, replace: "\\alpha" },
            { id: "pi", name: "Pi", cmd: "\\pi", pattern: /pi/gi, replace: "\\pi" },
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

    btnInsert.addEventListener("click", () => {
        if (output.value && window.insertToEditor) {
            window.insertToEditor(output.value);
            if (window.toast) window.toast("Đã chèn vào Editor!");
        }
    });
};
