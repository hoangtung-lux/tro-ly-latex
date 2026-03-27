/**
 * TableBuilder – Công cụ tạo bảng LaTeX trực quan
 */

class TableBuilder {
  constructor(gridEl, rowsEl, colsEl, borderEl, centerEl, outputEl, btnGenerate, btnInsert) {
    this.grid = gridEl;
    this.rowsInput = rowsEl;
    this.colsInput = colsEl;
    this.borderInput = borderEl;
    this.centerInput = centerEl;
    this.output = outputEl;
    this.btnGenerate = btnGenerate;
    this.btnInsert = btnInsert;
    this._bind();
    this.updateGrid();
  }

  _bind() {
    this.rowsInput.addEventListener("change", () => this.updateGrid());
    this.colsInput.addEventListener("change", () => this.updateGrid());
    this.btnGenerate.addEventListener("click", () => this.generateCode());
    this.btnInsert.addEventListener("click", () => {
      if (this.output.value.trim() && window.insertToEditor) {
        window.insertToEditor(this.output.value);
      }
    });
  }

  updateGrid() {
    const rows = parseInt(this.rowsInput.value) || 3;
    const cols = parseInt(this.colsInput.value) || 3;
    
    let html = "";
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td><input type="text" class="tb-cell" data-r="${r}" data-c="${c}"></td>`;
      }
      html += "</tr>";
    }
    this.grid.innerHTML = html;
  }

  generateCode() {
    const rows = parseInt(this.rowsInput.value);
    const cols = parseInt(this.colsInput.value);
    const hasBorder = this.borderInput.checked;
    const isCentered = this.centerInput.checked;

    let colAlign = hasBorder ? "|" : "";
    for (let i = 0; i < cols; i++) colAlign += " c " + (hasBorder ? "|" : "");

    let code = (isCentered ? "\\begin{center}\n" : "") + `\\begin{tabular}{${colAlign.trim()}}\n`;
    if (hasBorder) code += "  \\hline\n";

    for (let r = 0; r < rows; r++) {
      let rowData = [];
      for (let c = 0; c < cols; c++) {
        const val = this.grid.querySelector(`input[data-r="${r}"][data-c="${c}"]`).value || "";
        rowData.push(val);
      }
      code += "  " + rowData.join(" & ") + " \\\\ " + (hasBorder ? "\\hline" : "") + "\n";
    }

    code += "\\end{tabular}" + (isCentered ? "\n\\end{center}" : "");
    this.output.value = code;
  }
}
