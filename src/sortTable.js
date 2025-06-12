function tableSearch() {
    document.getElementById("searchInput").addEventListener("keyup",  function () {
        let filter = this.value.toLowerCase();
        let rows = document.querySelectorAll("#userTable tr");
        rows.forEach(row => {
            let username = row.cells[0].textContent.toLowerCase();
            let role = row.cells[1].textContent.toLowerCase();
            row.style.display = username.includes(filter) || role.includes(filter) ? "" : "none";
        });
    });

    document.getElementById("sortName").addEventListener("click",
        () => sortTable(0));
    document.getElementById("sortRuolo").addEventListener("click",
        () => sortTable(1));
    document.getElementById("sortStato").addEventListener("click",
        () => sortTable(2));
}

function sortTable(n) {
    let table = document.getElementById("userTable");
    let rows = Array.from(table.rows);
    let sorted = false;
    while (!sorted) {
        sorted = true;
        for (let i = 0; i < rows.length - 1; i++) {
        let x = rows[i].cells[n].textContent.toLowerCase();
        let y = rows[i + 1].cells[n].textContent.toLowerCase();
        if (x > y) {
            [rows[i], rows[i + 1]] = [rows[i + 1], rows[i]];
            sorted = false;
        }
        }
    }
    rows.forEach(row => table.appendChild(row));
}

export {tableSearch, sortTable}