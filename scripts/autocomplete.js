/**
 * Autocomplete Module
 */

window.initAutocomplete = function(input) {
    const listContainer = document.getElementById("autocomplete-list");
    const commands = ["\\frac{}{}", "\\sqrt{}", "\\begin{}", "\\end{}", "\\alpha", "\\beta", "\\gamma", "\\sum", "\\int", "\\infty", "\\times", "\\div", "\\pm", "\\neq", "\\leq", "\\geq", "\\approx", "\\mathbb{R}", "\\mathbb{Z}", "\\mathbb{N}", "\\bigcap", "\\bigcup", "\\in", "\\subset", "\\forall", "\\exists", "\\vec{}", "\\hat{}", "\\dot{}"];
    
    let currentFocus = -1;

    input.addEventListener("input", function() {
        const val = this.value;
        const lastSlash = val.lastIndexOf("\\");
        
        closeAllLists();
        if (lastSlash === -1) return;

        const query = val.substring(lastSlash).split(/\s/)[0];
        if (!query) return;

        currentFocus = -1;
        const filtered = commands.filter(cmd => cmd.startsWith(query));

        if (filtered.length === 0) return;

        filtered.forEach(cmd => {
            const div = document.createElement("DIV");
            div.className = "autocomplete-item";
            div.innerHTML = `<strong>${cmd.substr(0, query.length)}</strong>${cmd.substr(query.length)}`;
            div.addEventListener("click", function() {
                input.value = val.substring(0, lastSlash) + cmd + val.substring(lastSlash + query.length);
                closeAllLists();
                input.focus();
                input.dispatchEvent(new Event("input"));
            });
            listContainer.appendChild(div);
        });
    });

    input.addEventListener("keydown", function(e) {
        const items = listContainer.getElementsByTagName("div");
        if (items.length === 0) return;

        if (e.keyCode == 40) { // DOWN
            currentFocus++;
            addActive(items);
        } else if (e.keyCode == 38) { // UP
            currentFocus--;
            addActive(items);
        } else if (e.keyCode == 13 || e.keyCode == 9) { // ENTER or TAB
            if (currentFocus > -1) {
                e.preventDefault();
                items[currentFocus].click();
            }
        }
    });

    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (items.length - 1);
        items[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists() {
        listContainer.innerHTML = "";
    }

    document.addEventListener("click", () => closeAllLists());
};
