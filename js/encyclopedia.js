/**
 * Encyclopedia Module
 */

window.initEncyclopedia = function() {
    const searchInput = document.getElementById("encyclopedia-search");
    const filterSelect = document.getElementById("category-filter");
    const resultsContainer = document.getElementById("encyclopedia-results");
    
    let commandsData = [];

    // Load data
    fetch("data/commands.json")
        .then(res => res.json())
        .then(data => {
            commandsData = data;
            render(data);
        })
        .catch(err => console.error("Error loading commands:", err));

    searchInput.addEventListener("input", filter);
    filterSelect.addEventListener("change", filter);

    function filter() {
        const query = searchInput.value.toLowerCase();
        const category = filterSelect.value;

        const filtered = commandsData.filter(cmd => {
            const matchesQuery = cmd.name.toLowerCase().includes(query) || cmd.cmd.toLowerCase().includes(query);
            const matchesCat = category === "all" || cmd.category === category;
            return matchesQuery && matchesCat;
        });

        render(filtered);
    }

    function render(data) {
        resultsContainer.innerHTML = "";
        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "ency-card";
            card.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
                <code>${item.cmd}</code>
                <div class="card-actions">
                    <button class="btn-copy-cmd">Sao chép</button>
                    <button class="btn-insert-cmd">Chèn</button>
                </div>
            `;
            
            card.querySelector(".btn-copy-cmd").addEventListener("click", () => {
                navigator.clipboard.writeText(item.cmd);
                if (window.toast) window.toast("Đã sao chép lệnh!");
            });

            card.querySelector(".btn-insert-cmd").addEventListener("click", () => {
                if (window.insertToEditor) window.insertToEditor(item.cmd);
            });

            resultsContainer.appendChild(card);
        });
    }

    window.showInEncyclopedia = (cmd) => {
        const btn = document.querySelector('.nav-btn[data-tab="encyclopedia"]');
        if (btn) btn.click();
        searchInput.value = cmd.replace("\\", "");
        filter();
    };
};
