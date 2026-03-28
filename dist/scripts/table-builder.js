/**
 * Table Builder Module
 */

window.initTableBuilder = function() {
    const rowsInput = document.getElementById("table-rows");
    const colsInput = document.getElementById("table-cols");
    const gridWrapper = document.getElementById("table-grid-wrapper");
    const btnGenerate = document.getElementById("btn-generate-table");
    const outputCode = document.getElementById("table-output-code");
    const btnInsert = document.getElementById("btn-table-insert");
    const cbBorder = document.getElementById("table-border");
    const cbCenter = document.getElementById("table-center");

    function createGrid() {
        const rows = parseInt(rowsInput.value) || 1;
        const cols = parseInt(colsInput.value) || 1;
        
        let html = '<table class="table-grid">';
        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                html += `<td><input type="text" data-row="${i}" data-col="${j}" placeholder="..."></td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        gridWrapper.innerHTML = html;
    }

    rowsInput.addEventListener("input", createGrid);
    colsInput.addEventListener("input", createGrid);

    btnGenerate.addEventListener("click", () => {
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        const border = cbBorder.checked;
        const center = cbCenter.checked;
        
        let spec = border ? "|" + "c|".repeat(cols) : "c".repeat(cols);
        let code = `\\begin{tabular}{${spec}}\n`;
        if (border) code += `  \\hline\n`;

        for (let i = 0; i < rows; i++) {
            let rowData = [];
            for (let j = 0; j < cols; j++) {
                const val = gridWrapper.querySelector(`input[data-row="${i}"][data-col="${j}"]`).value || "";
                rowData.push(val);
            }
            code += `  ${rowData.join(" & ")} \\\\ \n`;
            if (border) code += `  \\hline\n`;
        }
        code += `\\end{tabular}`;

        if (center) {
            code = `\\begin{center}\n${code}\n\\end{center}`;
        }

        outputCode.value = code;
    });

    btnInsert.addEventListener("click", () => {
        if (outputCode.value && window.insertToEditor) {
            window.insertToEditor(outputCode.value);
            if (window.toast) window.toast("Đã chèn bảng vào Editor!");
        }
    });

    createGrid();
};
