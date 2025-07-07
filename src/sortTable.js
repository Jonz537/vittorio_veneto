function tableSearch() {
    document.getElementById("searchInput").addEventListener("keyup",  function () {
        let filter = this.value.toLowerCase();
        let rows = document.querySelectorAll("#user_list tr");
        rows.forEach(row => {
            let username = row.cells[0].textContent.toLowerCase();
            let role = row.cells[1].textContent.toLowerCase();
            row.style.display = username.includes(filter) || role.includes(filter) ? "" : "none";
        });
    });

    document.getElementById("sortName").addEventListener("click", function () {
        sortTable(0, this);
    });

    document.getElementById("sortRuolo").addEventListener("click", function () {
        sortTable(1, this);
    });

    document.getElementById("sortStato").addEventListener("click", function () {
        sortTable(2, this);
    });
}

let sortDirection = {};

function sortTable(n, thElement) {
    const table = document.getElementById("user_list");
    const rows = Array.from(table.rows);


    // Toggle sort direction
    sortDirection[n] = !sortDirection[n];
    const direction = sortDirection[n] ? 1 : -1;

    // Sort rows
    rows.sort((a, b) => {
        const x = a.cells[n].textContent.trim().toLowerCase();
        const y = b.cells[n].textContent.trim().toLowerCase();
        return x.localeCompare(y) * direction;
    });

    // Re-append sorted rows
    rows.forEach(row => table.appendChild(row));

    // Clear all other sort indicators
    document.querySelectorAll(".sort-indicator").forEach(span => {
        span.textContent = "▼";
        span.classList.remove("active");
    });

    const indicator = thElement.querySelector(".sort-indicator");
    indicator.textContent = direction === 1 ? "▲" : "▼";
    indicator.classList.add("active")
}


export {tableSearch, sortTable}