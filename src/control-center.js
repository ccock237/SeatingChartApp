import './table-object.js';
import { get, put, post, remove } from './db-utility.js';
import { DEFAULT_SEATING, DEFAULT_TABLE_LIST } from './constants.js';

class ControlCenter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.renderLoading();
        this.getTables();
    }

    async getTables() {
        let tableList;

        try {
            tableList = await get("/api/table/list");
        }
        catch (error) {
            tableList = DEFAULT_TABLE_LIST;
        }

        if (!tableList || tableList.length === 0) {
            return;
        }


        this.gridSize = {
            rows: Math.max(...tableList.map(s => s.grid_row)),
            cols: Math.max(...tableList.map(s => s.grid_col))
        };

        this.tableGrid = Array.from({ length: this.gridSize.rows }, () => Array(this.gridSize.cols).fill(null));
        for (const { table_number, grid_row, grid_col, type, label } of tableList) {
            this.tableGrid[grid_row - 1][grid_col - 1] = { table_number, type, label };
        }

        this.render();
    }

    saveTables() {
        const updates = [];
        for (let row = 1; row <= this.gridSize.rows; row += 1) {
            for (let col = 1; col <= this.gridSize.cols; col += 1) {
                const tableNumber = this.getTableAtPosition(row, col);
                if (tableNumber) {
                    updates.push({ table_number: tableNumber, grid_row: row, grid_col: col });
                }
            }
        }

        Promise.all(updates.map(({ table_number, grid_row, grid_col }) => {
            if (table_number) {
                return put(`/api/table?table=${table_number}`, { grid_row, grid_col });
            }
        }));

        this.getTables();
    }

    createTable() {
        this.tableGrid[this.tableGrid.length] = [...Array(this.gridSize.cols).fill(null)];
        this.gridSize.rows += 1;

        const newTable = {
            table_number: Number(this.querySelector("#table-number-input").value),
            grid_row: this.gridSize.rows,
            grid_col: this.gridSize.cols
        };

        post("/api/table", newTable);

        this.getTables();
    }

    getCellStyle(row, col, tableType) {
        return (!tableType || tableType == "Round") ? `grid-area: ${row} / ${col} / span 1 / span 1;` : `grid-area: ${row} / ${col} / span 3 / span 1;`;
    }

    getTableAtPosition(row, col) {
        return this.tableGrid[row - 1][col - 1];
    }

    renderLoading() {
        this.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:220px;color:#475569;">
                Loading table map...
            </div>
        `;
    }

    render() {
        if (!this.tableGrid || this.tableGrid.length === 0) {
            return;
        }

        const cells = [];
        for (let row = 1; row <= this.gridSize.rows; row += 1) {
            for (let col = 1; col <= this.gridSize.cols; col += 1) {
                const table = this.tableGrid[row - 1][col - 1];
                if (table && typeof table.table_number === "number" && !isNaN(table.table_number)) {
                    cells.push(`
                        <div class="table-cell" data-row="${row}" data-col="${col}" style="${this.getCellStyle(row, col, table.type)}">
                            <table-object draggable="true" table-number="${table.table_number}" label="${table.label}" type="${table.type}"></table-object>
                        </div>
                    `);
                }
                else {
                    cells.push(`
                        <div class="table-cell empty" data-row="${row}" data-col="${col}" style="${this.getCellStyle(row, col)}"></div>
                    `);
                }
            }
        }

        this.innerHTML = `
            <div class="page-header">
                <button class="custom-button back-button">
                    <span style="font-size: 1rem; font-weight: bold;">&#x25C0;</span>
                    <span class="page-header-button-text">Back</span>
                </button>
                <h1 class="title-text">Control Center</h1>
            </div>

            <div class="button-section">
                <button class="custom-button control-center-button" id="create-table-button">Create Table</button>
                <button class="custom-button control-center-button" id="update-table-button">Update Table</button>
                <button class="custom-button control-center-button" id="create-person-button">Create Person</button>
                <button class="custom-button control-center-button" id="update-person-button">Update Person</button>
            </div>
            
            <div class="panel-card">
                <div class="table-grid">
                    ${cells.join('')}
                </div>
            </div>
        `;

        this.innerHTML += `
            <div id="create-table-modal" class="custom-modal">
                <div class="custom-modal-body">
                    <div class="custom-input">
                        <label for="table-number-modal-input-two" style="grid-area: 1 / 1">Table Number</label>
                        <input type="number" id="table-number-modal-input-two" min="1"  style="grid-area: 1 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="table-label-modal-input-two" style="grid-area: 1 / 1">Table Label</label>
                        <input type="text" id="table-label-modal-input-two" style="grid-area: 1 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="table-type-modal-input-two" style="grid-area: 1 / 1">Table Type</label>
                        <select id="table-type-modal-input-two" style="grid-area: 1 / 2">
                            <option value="Round">Round</option>
                            <option value="Rectangle">Rectangle</option>
                        </select>
                    </div>
                    <div class="custom-input">
                        <label for="grid-row-modal-input-two" style="grid-area: 2 / 1">Grid Row</label>
                        <input type="number" id="grid-row-modal-input-two" min="1" style="grid-area: 2 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="grid-col-modal-input-two" style="grid-area: 3 / 1">Grid Column</label>
                        <input type="number" id="grid-col-modal-input-two" min="1" style="grid-area: 3 / 2" />
                    </div>

                    <div>
                        <button class="custom-button" id="close-table-modal-button-two" style="grid-area: 4 / 1">Close</button>
                        <button class="custom-button" id="create-table-modal-button" style="grid-area: 4 / 2">Create</button>
                    </div>
                </div>
            </div>
            <div id="update-table-modal" class="custom-modal">
                <div class="custom-modal-body">
                    <div class="custom-input">
                        <label for="table-number-modal-input" style="grid-area: 1 / 1">Table Number</label>
                        <input type="number" id="table-number-modal-input" min="1"  style="grid-area: 1 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="table-label-modal-input" style="grid-area: 1 / 1">Table Label</label>
                        <input type="text" id="table-label-modal-input" style="grid-area: 1 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="table-type-modal-input" style="grid-area: 1 / 1">Table Type</label>
                        <select id="table-type-modal-input" style="grid-area: 1 / 2">
                            <option value="Round">Round</option>
                            <option value="Rectangle">Rectangle</option>
                        </select>
                    </div>
                    <div class="custom-input">
                        <label for="grid-row-modal-input" style="grid-area: 2 / 1">Grid Row</label>
                        <input type="number" id="grid-row-modal-input" min="1" style="grid-area: 2 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="grid-col-modal-input" style="grid-area: 3 / 1">Grid Column</label>
                        <input type="number" id="grid-col-modal-input" min="1" style="grid-area: 3 / 2" />
                    </div>

                    <div>
                        <button class="custom-button" id="close-table-modal-button" style="grid-area: 4 / 1">Close</button>
                        <button class="custom-button" id="update-table-modal-button" style="grid-area: 4 / 2">Update</button>
                    </div>
                </div>
            </div>
            <div id="create-person-modal" class="custom-modal">
                <div class="custom-modal-body">
                    <div class="custom-input">
                        <label for="person-name-input-two" style="grid-area: 1 / 1">Name</label>
                        <input id="person-name-input-two" style="grid-area: 1 / 2" />
                    </div>
                    <div class="custom-input">
                        <label for="person-table-input" style="grid-area: 1 / 1">Table Number</label>
                        <input type="number" id="person-table-input" min="1"  style="grid-area: 1 / 2" />
                    </div>

                    <div>
                        <button class="custom-button" id="close-person-modal-button-two" style="grid-area: 4 / 1">Close</button>
                        <button class="custom-button" id="create-person-modal-button" style="grid-area: 4 / 2">Create</button>
                    </div>
                </div>
            </div>
            <div id="update-person-modal" class="custom-modal">
                <div class="custom-modal-body">
                    <div class="custom-input">
                        <label for="person-name-input" style="grid-area: 1 / 1">Name</label>
                        <input id="person-name-input" style="grid-area: 2 / 1" />
                    </div>

                    <div class="person-list-display"></div>

                    <div class="person-edit-display"></div>

                    <button class="custom-button" id="close-person-modal-button" style="grid-area: 3 / 1">Close</button>
                </div>
            </div>
        `;

        this.querySelector('#close-table-modal-button-two').addEventListener('click', () => {
            this.querySelector('#create-table-modal').style.display = "none";
        });

        this.querySelector('#close-table-modal-button').addEventListener('click', () => {
            this.querySelector('#update-table-modal').style.display = "none";
        });

        this.querySelector("#close-person-modal-button-two").addEventListener("click", () => {
            this.querySelector('#create-person-modal').style.display = "none";
        });

        this.querySelector("#close-person-modal-button").addEventListener("click", () => {
            this.querySelector('#update-person-modal').style.display = "none";
        });

        this.querySelector('#create-table-modal-button').addEventListener('click', () => {
            const tableNumber = Number(this.querySelector("#table-number-modal-input-two").value);
            const tableLabel = this.querySelector("#table-label-modal-input-two").value;
            const tableType = this.querySelector("#table-type-modal-input-two").value;
            const gridRow = Number(this.querySelector("#grid-row-modal-input-two").value);
            const gridCol = Number(this.querySelector("#grid-col-modal-input-two").value);

            this.createTable(tableNumber, tableLabel, tableType, gridRow, gridCol);
        });

        this.querySelector('#update-table-modal-button').addEventListener('click', () => {
            const tableNumber = Number(this.querySelector("#table-number-modal-input").value);
            const tableLabel = this.querySelector("#table-label-modal-input").value;
            const tableType = this.querySelector("#table-type-modal-input").value;
            const gridRow = Number(this.querySelector("#grid-row-modal-input").value);
            const gridCol = Number(this.querySelector("#grid-col-modal-input").value);

            this.updateTable(tableNumber, tableLabel, tableType, gridRow, gridCol);
        });

        this.querySelector('#create-person-modal-button').addEventListener('click', () => {
            const name = this.querySelector("#person-name-input-two").value;
            const tableNumber = Number(this.querySelector("#person-table-input").value);

            this.createPerson(name, tableNumber);
        });

        this.querySelector('.back-button').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent("screenchange", {
                bubbles: true,
                composed: true,
                detail: { screen: 'name-search' }
            }))
        });

        this.querySelector("#create-table-button").addEventListener("click", () => {
            this.querySelector('#create-table-modal').style.display = "flex";
        });

        this.querySelector('#update-table-button').addEventListener('click', () => {
            this.querySelector('#update-table-modal').style.display = "flex";
        });

        this.querySelector("#create-person-button").addEventListener("click", () => {
            this.querySelector("#create-person-modal").style.display = "flex";
        });

        this.querySelector("#update-person-button").addEventListener("click", () => {
            this.querySelector("#update-person-modal").style.display = "flex";
        });

        this.querySelector("#person-name-input").addEventListener("input", event => {
            this.getPerson(event.target.value);
        });

        this.attachDragHandlers();
    }

    attachDragHandlers() {
        const tableObjects = this.querySelectorAll('table-object');
        tableObjects.forEach(tableObject => {
            tableObject.addEventListener('dragstart', event => {
                const tableNumber = tableObject.getAttribute('table-number');
                event.dataTransfer.setData('text/plain', tableNumber);
                event.dataTransfer.effectAllowed = 'move';
            });
        });

        const cells = this.querySelectorAll('.table-cell');
        cells.forEach(cell => {
            cell.addEventListener('dragover', event => {
                event.preventDefault();
                cell.classList.add('drop-target');
            });

            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drop-target');
            });

            cell.addEventListener('drop', event => {
                event.preventDefault();
                cell.classList.remove('drop-target');

                const sourceTable = Number(event.dataTransfer.getData('text/plain'));
                const targetRow = Number(cell.dataset.row);
                const targetCol = Number(cell.dataset.col);
                const targetTable = this.getTableAtPosition(targetRow, targetCol);

                if (!sourceTable) {
                    return;
                }

                this.moveTable(sourceTable, targetRow, targetCol, targetTable);
            });
        });

        // Allow dropping anywhere on the control-center element to grow the grid
        this.addEventListener('dragover', event => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        });

        this.addEventListener('drop', event => {
            event.preventDefault();

            const sourceTable = Number(event.dataTransfer.getData('text/plain'));
            if (!sourceTable) return;

            const gridEl = this.querySelector('.table-grid');
            if (!gridEl) return;

            const rect = gridEl.getBoundingClientRect();
            const clientX = event.clientX;
            const clientY = event.clientY;

            const cols = Math.max(1, this.gridSize.cols || 1);
            const rows = Math.max(1, this.gridSize.rows || 1);

            // Detect if drop is outside the grid bounds to add new rows/cols
            let row = rows;
            let col = cols;

            // Check vertical position
            if (clientY >= rect.top && clientY < rect.bottom) {
                const cellHeight = rect.height / rows;
                row = Math.max(1, Math.ceil((clientY - rect.top) / cellHeight));
            } else if (clientY < rect.top) {
                row = 0;  // Insert at top (before first row)
            } else {
                row = rows + 1;  // Append below
            }

            // Check horizontal position
            if (clientX >= rect.left && clientX < rect.right) {
                const cellWidth = rect.width / cols;
                col = Math.max(1, Math.ceil((clientX - rect.left) / cellWidth));
            } else if (clientX < rect.left) {
                col = 0;  // Insert at left (before first col)
            } else {
                col = cols + 1;  // Append to right
            }

            const pos = this.ensureGridForPosition(row, col);

            const targetRow = pos.row;
            const targetCol = pos.col;
            const targetTable = this.getTableAtPosition(targetRow, targetCol);

            this.moveTable(sourceTable, targetRow, targetCol, targetTable);
        });
    }

    ensureGridIncludes(row, col) {
        // expand rows if needed
        while (this.gridSize.rows < row) {
            this.tableGrid.push(Array(this.gridSize.cols).fill(null));
            this.gridSize.rows += 1;
        }

        // expand cols if needed
        if (this.gridSize.cols < col) {
            const add = col - this.gridSize.cols;
            this.tableGrid.forEach(r => {
                for (let i = 0; i < add; i += 1) r.push(null);
            });
            this.gridSize.cols = col;
        }
    }

    ensureGridForPosition(row, col) {
        // row or col may be 0 (insert before first) or > current size (append)
        // handle inserting a row at the top
        if (row === 0) {
            this.tableGrid.unshift(Array(this.gridSize.cols).fill(null));
            this.gridSize.rows += 1;
            row = 1;
        }

        if (col === 0) {
            // insert a column at the start of each row
            this.tableGrid.forEach(r => r.unshift(null));
            this.gridSize.cols += 1;
            col = 1;
        }

        // if beyond bounds, grow the grid
        if (row > this.gridSize.rows || col > this.gridSize.cols) {
            this.ensureGridIncludes(row, col);
        }

        // return normalized 1-based indices
        return { row: Number(row), col: Number(col) };
    }

    moveTable(sourceTable, targetRow, targetCol, targetTable) {
        const sourcePosition = this.tableGrid.flatMap((row, rowIndex) => row.map((table, colIndex) => ({ table, row: rowIndex + 1, col: colIndex + 1 })))
            .find(cell => cell.table === sourceTable);

        const targetPosition = { row: targetRow, col: targetCol };

        if (!sourcePosition || (sourcePosition.row === targetRow && sourcePosition.col === targetCol)) {
            return;
        }

        // Update the tableGrid with the new positions
        this.tableGrid[sourcePosition.row - 1][sourcePosition.col - 1] = targetTable;
        this.tableGrid[targetRow - 1][targetCol - 1] = sourceTable;

        this.render();
    }

    async getPerson(personName) {
        if (personName) {
            let results;
            try {
                results = await get(`/api/table?name=${encodeURIComponent(personName)}`);
            }
            catch (error) {
                //results = DEFAULT_SEATING.filter(({ name }) => name.toLowerCase().includes(personName.toLowerCase()));
            }

            if (results) {
                const personRows = [];
                results.forEach(person => {
                    personRows.push(`<div class='person-list-row' data-name="${person.name}" data-table="${person.table_number}" >${person.name} (#${person.table_number})</div>`)
                });

                this.querySelector(".person-list-display").innerHTML = personRows.join('');

                this.querySelectorAll(".person-list-row").forEach(personElement => {
                    personElement.addEventListener("click", event => {

                        const name = event.target.dataset.name;
                        const tableNumber = event.target.dataset.table;



                        this.querySelector(".person-edit-display").innerHTML = `
                            <div class="custom-input">
                                <label for="person-edit-name-input" style="grid-area: 1 / 1">Name</label>
                                <input id="person-edit-name-input" style="grid-area: 2 / 1" value="${name}" />
                            </div>
                            <div class="custom-input">
                                <label for="person-edit-table-input" style="grid-area: 1 / 1">Table Number</label>
                                <input id="person-edit-table-input" style="grid-area: 2 / 1" value="${tableNumber}" />
                            </div>
                            <div>
                                <button class="custom-button" id="delete-person-button">Delete</button>
                                <button class="custom-button" id="update-person-button-two">Update</button>
                            </div>
                            
                        `;

                        this.querySelector("#delete-person-button").addEventListener("click", event => {
                            this.deletePerson(name);
                        });

                        this.querySelector("#update-person-button-two").addEventListener("click", event => {
                            const newName = this.querySelector("#person-edit-name-input").value;
                            const newTable = Number(this.querySelector("#person-edit-table-input").value);
                            this.updatePerson(name, newName, newTable);
                        });
                    });
                });

            }
        }
    }

    createTable(tableNumber, tableLabel, tableType, gridRow, gridCol) {
        post("/api/table", { table_number: tableNumber, label: tableLabel, type: tableType, grid_row: gridRow, grid_col: gridCol }).then(() => {
            this.querySelector('#create-table-modal').style.display = "none";
            this.getTables();
        });
    }

    updateTable(tableNumber, tableLabel, tableType, gridRow, gridCol) {
        put(`/api/table?table=${tableNumber}`, { label: tableLabel, type: tableType, grid_row: gridRow, grid_col: gridCol }).then(() => {
            this.querySelector('#update-table-modal').style.display = "none";
            this.getTables();
        });
    }

    createPerson(personName, tableNumber) {
        post("/api/person", { name: personName, table_number: tableNumber }).then(() => {
            this.querySelector('#create-person-modal').style.display = "none";
            this.getTables();
        });
    }

    deletePerson(personName) {
        remove(`/api/person?name=${personName}`).then(() => {
            this.querySelector("#update-person-modal").style.display = "none";
        });
    }

    updatePerson(prevName, newName, newTable) {
        put(`/api/person?name=${prevName}`, { new_name: newName, new_table_number: newTable }).then(() => {
            this.querySelector("#update-person-modal").style.display = "none";
        });
    }
}

customElements.define('control-center', ControlCenter);

export default ControlCenter;