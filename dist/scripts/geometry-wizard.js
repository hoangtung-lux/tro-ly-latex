/**
 * Geometry Wizard Module (TikZ Master)
 */

(function() {
    const GeometryWizard = {
        shapes: {
            "2d": [
                { id: "triangle", name: "Tam giác ABC (Tọa độ)", params: ["xA", "yA", "xB", "yB", "xC", "yC"] },
                { id: "circle", name: "Đường tròn (Tâm & Bán kính)", params: ["xO", "yO", "radius"] },
                { id: "oxy", name: "Hệ tọa độ Oxy", params: ["xmin", "xmax", "ymin", "ymax"] },
                { id: "rectangle", name: "Hình chữ nhật / Vuông", params: ["width", "height"] }
            ],
            "3d": [
                { id: "pyramid", name: "Hình chóp S.ABC", params: ["base_a", "base_b", "height"] },
                { id: "cube", name: "Hình lập phương / Hộp", params: ["a", "b", "c"] },
                { id: "prism", name: "Hình lăng trụ tam giác", params: ["base_side", "height"] }
            ]
        },

        init() {
            this.cacheElements();
            this.bindEvents();
            this.updateShapeList();
        },

        cacheElements() {
            this.mainType = document.getElementById("geo-type-main");
            this.shapeSelect = document.getElementById("geo-shape");
            this.paramsContainer = document.getElementById("geo-params");
            this.labelsToggle = document.getElementById("geo-labels");
            this.lineStyleSelect = document.getElementById("geo-line-style");
            this.svgPreview = document.getElementById("geo-svg-preview");
            this.outputCode = document.getElementById("geo-output-code");
            this.btnInsert = document.getElementById("btn-geo-insert");
        },

        bindEvents() {
            this.mainType.addEventListener("change", () => this.updateShapeList());
            this.shapeSelect.addEventListener("change", () => this.renderInputs());
            this.labelsToggle.addEventListener("change", () => this.generate());
            this.lineStyleSelect.addEventListener("change", () => this.generate());
            
            this.btnInsert.addEventListener("click", () => {
                const code = this.outputCode.value;
                if (window.insertToEditor) window.insertToEditor(code);
            });
        },

        updateShapeList() {
            const type = this.mainType.value;
            const list = this.shapes[type];
            this.shapeSelect.innerHTML = list.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
            this.renderInputs();
        },

        renderInputs() {
            const type = this.mainType.value;
            const shapeId = this.shapeSelect.value;
            const shape = this.shapes[type].find(s => s.id === shapeId);
            
            let html = "";
            const defaultValues = {
                xA: 0, yA: 3, xB: -2, yB: 0, xC: 2, yC: 0,
                xO: 0, yO: 0, radius: 2,
                xmin: -1, xmax: 4, ymin: -1, ymax: 4,
                width: 4, height: 3,
                base_a: 4, base_b: 3, height: 5,
                a: 4, b: 4, c: 4,
                base_side: 3
            };

            shape.params.forEach(p => {
                html += `
                    <div>
                        <label style="font-size:0.85rem; margin-bottom:0.4rem; display:block;">${this.getParamLabel(p)}:</label>
                        <input type="number" step="0.5" class="geo-input" data-param="${p}" value="${defaultValues[p] || 0}" style="width:100%; padding:0.6rem; border-radius:8px; border:1px solid #ddd;">
                    </div>
                `;
            });

            this.paramsContainer.innerHTML = html;
            
            this.paramsContainer.querySelectorAll("input").forEach(inp => {
                inp.addEventListener("input", () => this.generate());
            });

            this.generate();
        },

        getParamLabel(p) {
            const labels = {
                xA: "Hoành độ A", yA: "Tung độ A", xB: "Hoành độ B", yB: "Tung độ B", xC: "Hoành độ C", yC: "Tung độ C",
                xO: "Tâm x", yO: "Tâm y", radius: "Bán kính R",
                xmin: "X min", xmax: "X max", ymin: "Y min", ymax: "Y max",
                width: "Chiều rộng", height: "Chiều cao (h)",
                base_a: "Cạnh đáy a", base_b: "Cạnh đáy b",
                a: "Cạnh a", b: "Cạnh b", c: "Canh c",
                base_side: "Cạnh đáy"
            };
            return labels[p] || p;
        },

        getParams() {
            const data = {};
            this.paramsContainer.querySelectorAll("input").forEach(inp => {
                data[inp.dataset.param] = parseFloat(inp.value);
            });
            return data;
        },

        getGlobalSettings() {
            return {
                showLabels: this.labelsToggle.checked,
                lineStyle: this.lineStyleSelect.value
            };
        },

        generate() {
            const shapeId = this.shapeSelect.value;
            const p = this.getParams();
            const s = this.getGlobalSettings();
            let code = "";
            let svg = "";

            if (shapeId === "triangle") {
                code = this.tikzTriangle(p, s);
                svg = this.svgTriangle(p, s);
            } else if (shapeId === "circle") {
                code = this.tikzCircle(p, s);
                svg = this.svgCircle(p, s);
            } else if (shapeId === "oxy") {
                code = this.tikzOxy(p, s);
                svg = this.svgOxy(p, s);
            } else if (shapeId === "rectangle") {
                code = this.tikzRect(p, s);
                svg = this.svgRect(p, s);
            } else if (shapeId === "pyramid") {
                code = this.tikzPyramid(p, s);
                svg = this.svgPyramid(p, s);
            } else if (shapeId === "cube") {
                code = this.tikzCube(p, s);
                svg = this.svgCube(p, s);
            } else if (shapeId === "prism") {
                code = this.tikzPrism(p, s);
                svg = this.svgPrism(p, s);
            }

            this.outputCode.value = code;
            this.svgPreview.innerHTML = svg;
        },

        // --- Utils ---
        getSvgDashArray(style) {
            if (style === "dashed") return "5,5";
            if (style === "dotted") return "2,2";
            return "";
        },

        getSvgStrokeWidth(style) {
            return style.includes("very thick") ? 3 : 2;
        },

        // --- 2D Generators ---
        tikzTriangle(p, s) {
            let code = `\\begin{tikzpicture}[${s.lineStyle}, line join=round, scale=1]\n`;
            code += `  \\coordinate (A) at (${p.xA},${p.yA});\n`;
            code += `  \\coordinate (B) at (${p.xB},${p.yB});\n`;
            code += `  \\coordinate (C) at (${p.xC},${p.yC});\n`;
            code += `  \\draw (A) -- (B) -- (C) -- cycle;\n`;
            if (s.showLabels) {
                code += `  \\fill (A) circle (1.5pt) node[above] {A};\n`;
                code += `  \\fill (B) circle (1.5pt) node[left] {B};\n`;
                code += `  \\fill (C) circle (1.5pt) node[right] {C};\n`;
            }
            code += `\\end{tikzpicture}`;
            return code;
        },
        svgTriangle(p, s) {
            const scale = 20; const offset = 100;
            const dash = this.getSvgDashArray(s.lineStyle);
            const w = this.getSvgStrokeWidth(s.lineStyle);
            const pts = `${offset+p.xA*scale},${offset-p.yA*scale} ${offset+p.xB*scale},${offset-p.yB*scale} ${offset+p.xC*scale},${offset-p.yC*scale}`;
            return `<svg width="200" height="200"><polygon points="${pts}" fill="none" stroke="#2563eb" stroke-width="${w}" stroke-dasharray="${dash}"/></svg>`;
        },

        tikzCircle(p, s) {
            let code = `\\begin{tikzpicture}[${s.lineStyle}]\n`;
            code += `  \\draw (${p.xO},${p.yO}) circle (${p.radius});\n`;
            if (s.showLabels) {
                code += `  \\fill (${p.xO},${p.yO}) circle (1.5pt) node[below] {O};\n`;
            }
            code += `\\end{tikzpicture}`;
            return code;
        },
        svgCircle(p, s) {
            const scale = 20; const offset = 100;
            const dash = this.getSvgDashArray(s.lineStyle);
            const w = this.getSvgStrokeWidth(s.lineStyle);
            return `<svg width="200" height="200"><circle cx="${offset+p.xO*scale}" cy="${offset-p.yO*scale}" r="${p.radius*scale}" fill="none" stroke="#2563eb" stroke-width="${w}" stroke-dasharray="${dash}"/></svg>`;
        },

        tikzOxy(p, s) {
            return `\\begin{tikzpicture}[>=stealth, scale=0.8]\n  \\draw[->] (${p.xmin},0) -- (${p.xmax},0) node[below] {$x$};\n  \\draw[->] (0,${p.ymin}) -- (0,${p.ymax}) node[left] {$y$};\n  \\draw[step=1, gray!20, very thin] (${p.xmin},${p.ymin}) grid (${p.xmax},${p.ymax});\n  \\node at (0,0) [below left] {$O$};\n\\end{tikzpicture}`;
        },
        svgOxy(p, s) {
            return `<svg width="200" height="200"><line x1="10" y1="100" x2="190" y2="100" stroke="#ccc"/><line x1="100" y1="10" x2="100" y2="190" stroke="#ccc"/></svg>`;
        },

        tikzRect(p, s) {
            return `\\begin{tikzpicture}[${s.lineStyle}]\n  \\draw (0,0) rectangle (${p.width},${p.height});\n\\end{tikzpicture}`;
        },
        svgRect(p, s) {
            const scale = 20;
            const dash = this.getSvgDashArray(s.lineStyle);
            const w = this.getSvgStrokeWidth(s.lineStyle);
            return `<svg width="200" height="200"><rect x="50" y="50" width="${p.width*scale}" height="${p.height*scale}" fill="none" stroke="#2563eb" stroke-width="${w}" stroke-dasharray="${dash}"/></svg>`;
        },

        // --- 3D Generators ---
        tikzPyramid(p, s) {
            let code = `\\begin{tikzpicture}[line join=round, line cap=round, >=stealth, scale=0.8, ${s.lineStyle}]\n`;
            code += `  \\coordinate (A) at (0,0); \\coordinate (B) at (${p.base_a*0.4}, -${p.base_b*0.3}); \\coordinate (C) at (${p.base_a}, 0); \\coordinate (S) at (${p.base_a*0.5}, ${p.height});\n`;
            code += `  \\draw[dashed] (A) -- (C);\n`;
            code += `  \\draw (S) -- (A) (S) -- (B) (S) -- (C) (A) -- (B) -- (C);\n`;
            if (s.showLabels) {
                code += `  \\node[left] at (A) {A}; \\node[below] at (B) {B}; \\node[right] at (C) {C}; \\node[above] at (S) {S};\n`;
            }
            code += `\\end{tikzpicture}`;
            return code;
        },
        svgPyramid(p, s) {
            return `<svg width="200" height="200"><path d="M50,150 L100,180 L150,150 M100,50 L50,150 M100,50 L100,180 M100,50 L150,150" fill="none" stroke="#2563eb"/></svg>`;
        },

        tikzCube(p, s) {
            let code = `\\begin{tikzpicture}[line join=round, line cap=round, scale=0.8, ${s.lineStyle}]\n`;
            code += `  \\coordinate (A) at (0,0); \\coordinate (B) at (${p.a},0); \\coordinate (C) at (${p.a+p.b*0.4}, ${p.b*0.3}); \\coordinate (D) at (${p.b*0.4}, ${p.b*0.3});\n`;
            code += `  \\coordinate (A') at (0,${p.c}); \\coordinate (B') at (${p.a},${p.c}); \\coordinate (C') at (${p.a+p.b*0.4}, ${p.c+p.b*0.3}); \\coordinate (D') at (${p.b*0.4}, ${p.c+p.b*0.3});\n`;
            code += `  \\draw[dashed] (D) -- (A) (D) -- (C) (D) -- (D');\n`;
            code += `  \\draw (A) -- (B) -- (C) (A) -- (A') -- (B') -- (B) (B') -- (C') -- (C) (A') -- (D') -- (C');\n`;
            if (s.showLabels) {
                code += `  \\node[below left] at (A) {A}; \\node[below] at (B) {B}; \\node[right] at (C) {C}; \\node[above left] at (A') {A'};\n`;
            }
            code += `\\end{tikzpicture}`;
            return code;
        },
        svgCube(p, s) {
            return `<svg width="200" height="200"><rect x="40" y="80" width="80" height="80" fill="none" stroke="#2563eb"/><rect x="80" y="40" width="80" height="80" fill="none" stroke="#2563eb"/><line x1="40" y1="80" x2="80" y2="40" stroke="#2563eb"/><line x1="120" y1="80" x2="160" y2="40" stroke="#2563eb"/><line x1="40" y1="160" x2="80" y2="120" stroke="#2563eb"/><line x1="120" y1="160" x2="160" y2="120" stroke="#2563eb"/></svg>`;
        },

        tikzPrism(p, s) {
            let code = `\\begin{tikzpicture}[line join=round, line cap=round, scale=0.8, ${s.lineStyle}]\n`;
            code += `  \\coordinate (A) at (0,0); \\coordinate (B) at (${p.base_side*0.5}, -${p.base_side*0.3}); \\coordinate (C) at (${p.base_side}, 0);\n`;
            code += `  \\coordinate (A') at (0,${p.height}); \\coordinate (B') at (${p.base_side*0.5}, ${p.height-p.base_side*0.3}); \\coordinate (C') at (${p.base_side}, ${p.height});\n`;
            code += `  \\draw[dashed] (A) -- (C);\n`;
            code += `  \\draw (A') -- (B') -- (C') -- (A') (A) -- (B) -- (C) (A) -- (A') (B) -- (B') (C) -- (C');\n`;
            if (s.showLabels) {
                code += `  \\node[left] at (A) {A}; \\node[below] at (B) {B}; \\node[right] at (C) {C}; \\node[above] at (A') {A'};\n`;
            }
            code += `\\end{tikzpicture}`;
            return code;
        },
        svgPrism(p, s) {
            return `<svg width="200" height="200"><path d="M50,150 L100,180 L150,150 M50,50 L100,80 L150,50 L50,50 M50,50 L50,150 M100,80 L100,180 M150,50 L150,150" fill="none" stroke="#2563eb"/></svg>`;
        }
    };

    window.initGeometryWizard = () => GeometryWizard.init();
})();
