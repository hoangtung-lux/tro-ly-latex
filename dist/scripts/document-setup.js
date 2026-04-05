/**
 * Document Setup Module
 * Handles exam headers and professional LaTeX preamble
 */

(function() {
    const DocumentSetup = {
        init() {
            this.cacheElements();
            this.bindEvents();
            this.renderLive();
        },

        cacheElements() {
            this.orgTop = document.getElementById('doc-org-top');
            this.orgName = document.getElementById('doc-org-name');
            this.examName = document.getElementById('doc-exam-name');
            this.subject = document.getElementById('doc-subject');
            this.duration = document.getElementById('doc-duration');
            this.docId = document.getElementById('doc-id');
            this.ansSheetCheck = document.getElementById('doc-ans-sheet');
            this.fullPreambleCheck = document.getElementById('doc-full-preamble');
            
            this.outputCode = document.getElementById('doc-output-code');
            this.livePreview = document.getElementById('doc-live-preview');
            
            this.btnGenerate = document.getElementById('btn-doc-generate');
            this.btnWrap = document.getElementById('btn-doc-wrap');
        },

        bindEvents() {
            const inputs = [this.orgTop, this.orgName, this.examName, this.subject, this.duration, this.docId, this.ansSheetCheck, this.fullPreambleCheck];
            inputs.forEach(el => {
                if (el) el.addEventListener('input', () => this.renderLive());
            });

            if (this.btnGenerate) {
                this.btnGenerate.addEventListener('click', () => {
                    const code = this.generateLaTeX("");
                    if (window.insertToEditor) {
                        window.insertToEditor(code);
                        this.switchToEditor();
                    }
                });
            }

            if (this.btnWrap) {
                this.btnWrap.addEventListener('click', () => {
                    const currentContent = document.getElementById('latex-input').value;
                    const code = this.generateLaTeX(currentContent);
                    if (window.insertToEditor) {
                        // Clear first then insert for wrapping
                        document.getElementById('latex-input').value = "";
                        window.insertToEditor(code);
                        this.switchToEditor();
                    }
                });
            }
        },

        switchToEditor() {
            const editorBtn = document.querySelector('[data-tab="editor"]');
            if (editorBtn) editorBtn.click();
        },

        generateHeader() {
            const top = this.orgTop.value || "SỞ GIÁO DỤC VÀ ĐÀO TẠO";
            const name = this.orgName.value || "TRƯỜNG THPT CHUYÊN";
            const exam = this.examName.value || "KỲ THI KHẢO SÁT CHẤT LƯỢNG";
            const sub = this.subject.value || "Môn: TOÁN HỌC";
            const dur = this.duration.value || "90 phút";
            const id = this.docId.value || "101";

            return `\\noindent
\\begin{minipage}[t]{0.45\\textwidth}
    \\begin{center}
        \\textbf{${top.toUpperCase()}} \\\\
        \\textbf{${name.toUpperCase()}} \\\\
        \\rule{2cm}{0.4pt}
    \\end{center}
\\end{minipage}
\\begin{minipage}[t]{0.45\\textwidth}
    \\begin{center}
        \\textbf{${exam.toUpperCase()}} \\\\
        \\textbf{NĂM HỌC 2023 - 2024} \\\\
        \\textit{Thời gian làm bài: ${dur}}
    \\end{center}
\\end{minipage}

\\begin{center}
    \\textbf{\\large ${sub.toUpperCase()}} \\\\
    \\fbox{\\textbf{Mã đề thi: ${id}}}
\\end{center}
\\vspace{1cm}`;
        },

        generateAnswerSheet() {
            if (!this.ansSheetCheck.checked) return "";
            
            return `
\\newpage
\\begin{center}
    \\textbf{\\large PHIẾU TRẢ LỜI TRẮC NGHIỆM}
\\end{center}
\\begin{tikzpicture}[scale=0.8]
    \\foreach \\i in {1,...,10} {
        \\foreach \\j in {0,1,2,3,4} {
            \\pgfmathsetmacro{\\num}{int(\\i + \\j*10)}
            \\node at (\\j*3, -\\i*0.6) {\\small \\num.};
            \\foreach \\k [count=\\ki] in {A,B,C,D} {
                \\draw (\\j*3 + \\ki*0.5, -\\i*0.6) circle (0.15);
                \\node at (\\j*3 + \\ki*0.5, -\\i*0.6) {\\tiny \\k};
            }
        }
    }
\\end{tikzpicture}`;
        },

        generateLaTeX(content) {
            const header = this.generateHeader();
            const ans = this.generateAnswerSheet();
            const body = content || "% Nhập nội dung đề thi tại đây...\n";

            if (this.fullPreambleCheck.checked) {
                return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{vietnam}
\\usepackage[top=2cm, bottom=2cm, left=2cm, right=2cm]{geometry}
\\usepackage{amsmath, amssymb, amsfonts}
\\usepackage{tikz}
\\usetikzlibrary{calc,arrows.meta,stealth}
\\usepackage{tasks}

\\begin{document}

${header}

${body}

${ans}

\\end{document}`;
            } else {
                return `${header}\n\n${body}\n\n${ans}`;
            }
        },

        renderLive() {
            const code = this.generateLaTeX("");
            this.outputCode.value = this.generateLaTeX("% [Nội dung Editor]");
            
            // Simplified preview for KaTeX
            const top = this.orgTop.value || "SỞ GIÁO DỤC";
            const name = this.orgName.value || "TRƯỜNG THPT";
            const sub = this.subject.value || "Môn học";
            const id = this.docId.value || "101";

            const previewHtml = `
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 1rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem;">
                    <div>${top}<br>${name}</div>
                    <div>KỲ THI KHẢO SÁT<br>NĂM HỌC 2023-2024</div>
                </div>
                <h3 style="margin-top: 1.5rem; font-size: 1.2rem;">${sub}</h3>
                <div style="border: 1px solid #000; display: inline-block; padding: 4px 15px; margin-top: 10px; font-weight: bold;">Mã đề: ${id}</div>
            </div>
            <div style="color: #999; font-style: italic; text-align: center;">[Nội dung câu hỏi đề thi sẽ hiển thị ở đây]</div>
            ${this.ansSheetCheck.checked ? '<div style="margin-top: 3rem; text-align: center; border-top: 1px dashed #ccc; padding-top: 1rem;">[Phiếu trả lời 50 câu sẽ được chèn ở cuối]</div>' : ''}
            `;

            this.livePreview.innerHTML = previewHtml;
        }
    };

    window.initDocumentSetup = () => DocumentSetup.init();
})();
