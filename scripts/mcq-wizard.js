/**
 * MCQ Wizard Module
 * Handles creation of multiple choice questions in LaTeX
 */

(function() {
    const MCQWizard = {
        init() {
            this.cacheElements();
            this.bindEvents();
            this.renderLive();
        },

        cacheElements() {
            this.questionInput = document.getElementById('mcq-question');
            this.imageUrlInput = document.getElementById('mcq-image');
            this.optA = document.getElementById('mcq-opt-a');
            this.optB = document.getElementById('mcq-opt-b');
            this.optC = document.getElementById('mcq-opt-c');
            this.optD = document.getElementById('mcq-opt-d');
            this.colsSelect = document.getElementById('mcq-cols');
            this.correctSelect = document.getElementById('mcq-correct');
            this.markerSelect = document.getElementById('mcq-marker');
            this.outputCode = document.getElementById('mcq-output-code');
            this.livePreview = document.getElementById('mcq-live-preview');
            this.btnGenerate = document.getElementById('btn-mcq-generate');
            this.btnInsert = document.getElementById('btn-mcq-insert');
        },

        bindEvents() {
            const inputs = [
                this.questionInput, this.imageUrlInput, 
                this.optA, this.optB, this.optC, this.optD, 
                this.colsSelect, this.correctSelect, this.markerSelect
            ];
            inputs.forEach(el => {
                if (el) el.addEventListener('input', () => this.renderLive());
            });

            if (this.btnGenerate) {
                this.btnGenerate.addEventListener('click', () => {
                    this.renderLive();
                    if (window.toast) window.toast("Đã cập nhật mã LaTeX!");
                });
            }

            if (this.btnInsert) {
                this.btnInsert.addEventListener('click', () => {
                    const code = this.generateLaTeX();
                    if (window.insertToEditor) {
                        window.insertToEditor(code);
                        const editorBtn = document.querySelector('[data-tab="editor"]');
                        if (editorBtn) editorBtn.click();
                    }
                });
            }
        },

        generateLaTeX() {
            const q = this.questionInput.value || "Nội dung câu hỏi...";
            const img = this.imageUrlInput.value;
            const a = this.optA.value || "Phương án A";
            const b = this.optB.value || "Phương án B";
            const c = this.optC.value || "Phương án C";
            const d = this.optD.value || "Phương án D";
            const cols = this.colsSelect.value || "4";
            const correct = this.correctSelect.value;
            const marker = this.markerSelect.value || "Alph";

            let latex = `\\begin{question}\n    ${q}\n`;
            
            if (img) {
                latex += `    \\begin{center}\n        \\includegraphics[width=0.5\\textwidth]{${img}}\n    \\end{center}\n`;
            }

            let labelPattern = "";
            if (marker === "Alph") labelPattern = "label=\\Alph*.";
            else if (marker === "alph") labelPattern = "label=\\alph*)";
            else if (marker === "arabic") labelPattern = "label=\\arabic*.";
            else if (marker === "roman") labelPattern = "label=\\roman*.";

            latex += `    \\begin{tasks}(${cols})[${labelPattern}]\n`;
            
            const formatOpt = (label, val) => {
                const isCorrect = correct === label;
                const markerComment = isCorrect ? " % ĐÁP ÁN ĐÚNG" : "";
                return `        \\task ${val}${markerComment}`;
            };

            latex += formatOpt("A", a) + "\n";
            latex += formatOpt("B", b) + "\n";
            latex += formatOpt("C", c) + "\n";
            latex += formatOpt("D", d) + "\n";
            latex += `    \\end{tasks}\n\\end{question}`;

            return latex;
        },

        renderLive() {
            const code = this.generateLaTeX();
            this.outputCode.value = code;

            const q = this.questionInput.value || "Nội dung câu hỏi...";
            const img = this.imageUrlInput.value;
            const a = this.optA.value || "A";
            const b = this.optB.value || "B";
            const c = this.optC.value || "C";
            const d = this.optD.value || "D";
            const cols = parseInt(this.colsSelect.value) || 4;
            const marker = this.markerSelect.value || "Alph";

            const getMarkerText = (i) => {
                const markers = {
                    "Alph": ["A.", "B.", "C.", "D."],
                    "alph": ["a)", "b)", "c)", "d)"],
                    "arabic": ["1.", "2.", "3.", "4."],
                    "roman": ["i.", "ii.", "iii.", "iv."]
                };
                return markers[marker][i];
            };

            let imgHtml = img ? `<div style="text-align:center; margin: 10px 0;"><img src="${img}" style="max-width:80%; border-radius:4px; border:1px solid #eee;"></div>` : "";

            let html = `<div class="mcq-preview-item">
                <p><strong>Câu hỏi:</strong> ${q}</p>
                ${imgHtml}
                <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 10px; margin-top: 15px;">
                    <div><strong>${getMarkerText(0)}</strong> ${a}</div>
                    <div><strong>${getMarkerText(1)}</strong> ${b}</div>
                    <div><strong>${getMarkerText(2)}</strong> ${c}</div>
                    <div><strong>${getMarkerText(3)}</strong> ${d}</div>
                </div>
            </div>`;

            this.livePreview.innerHTML = html;
            
            if (window.renderMathInElement) {
                renderMathInElement(this.livePreview, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                    ],
                    throwOnError: false
                });
            }
        }
    };

    window.initMCQWizard = () => MCQWizard.init();
})();
