/**
 * Main App Controller
 */

document.addEventListener("DOMContentLoaded", () => {
    // ── Tab Management ──
    const navBtns = document.querySelectorAll(".nav-btn");
    const tabs = document.querySelectorAll(".tab-content");

    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.tab;
            navBtns.forEach(b => b.classList.remove("active"));
            tabs.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(`tab-${target}`).classList.add("active");
        });
    });

    // ── Editor Logic ──
    const input = document.getElementById("latex-input");
    const preview = document.getElementById("latex-preview");
    const charCount = document.getElementById("char-count");

    // Live Render
    input.addEventListener("input", () => {
        renderPreview();
        updateStatus();
        saveDraft();
    });

    function renderPreview() {
        const text = input.value.trim();
        if (!text) {
            preview.innerHTML = '<div class="preview-placeholder">Kết quả sẽ hiện ở đây...</div>';
            return;
        }

        try {
            // Render KaTeX
            preview.innerHTML = text; // Set text first
            renderMathInElement(preview, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        } catch (e) {
            console.error("KaTeX Error:", e);
        }
    }

    function updateStatus() {
        const text = input.value;
        const lines = text ? text.split("\n").length : 0;
        const words = text ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        charCount.textContent = `${lines} dòng · ${words} từ · ${chars} ký tự`;
    }

    function saveDraft() {
        localStorage.setItem("latex_helper_draft", input.value);
    }

    // Load Draft
    const saved = localStorage.getItem("latex_helper_draft");
    if (saved) {
        input.value = saved;
        renderPreview();
        updateStatus();
    }

    // ── Button Actions ──
    document.getElementById("btn-clear").addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn xoá hết không?")) {
            input.value = "";
            renderPreview();
            updateStatus();
            saveDraft();
        }
    });

    document.getElementById("btn-copy").addEventListener("click", () => {
        input.select();
        document.execCommand("copy");
        toast("Đã sao chép vào bộ nhớ tạm!");
    });

    document.getElementById("btn-template").addEventListener("click", () => {
        const template = `\\documentclass{article}\n\\usepackage[utf8]{vietnam}\n\\usepackage{amsmath, amssymb}\n\\usepackage{tikz}\n\n\\begin{document}\n\nXin chào mẹ! Chúc mẹ soạn thảo LaTeX thật vui.\n\n$ E = mc^2 $\n\n\\end{document}`;
        input.value = template;
        renderPreview();
        updateStatus();
        saveDraft();
    });

    document.getElementById("btn-export").addEventListener("click", () => {
        const blob = new Blob([input.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tai-lieu.tex";
        a.click();
        URL.revokeObjectURL(url);
    });

    // Helper: Toast
    function toast(msg) {
        const t = document.createElement("div");
        t.className = "toast";
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add("toast-show"), 10);
        setTimeout(() => {
            t.classList.remove("toast-show");
            setTimeout(() => t.remove(), 300);
        }, 2000);
    }

    window.toast = toast;
    window.insertToEditor = (text) => {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.substring(0, start) + text + input.value.substring(end);
        input.focus();
        renderPreview();
        updateStatus();
        saveDraft();
    };

    // ── Module Init ──
    if (window.initAutocomplete) window.initAutocomplete(input);
    if (window.initEncyclopedia) window.initEncyclopedia();
    if (window.initConverter) window.initConverter();
    if (window.initTableBuilder) window.initTableBuilder();
});
