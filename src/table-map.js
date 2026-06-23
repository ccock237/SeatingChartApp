import './table-object.js';
import { get } from './db-utility.js';
import { DEFAULT_SEATING, DEFAULT_TABLE_LIST, MARKERS } from './constants.js';

class TableMap extends HTMLElement {

    static get observedAttributes() {
        return ['highlighted-table'];
    }

    get highlightedTable() {
        return this.getAttribute('highlighted-table');
    }

    set highlightedTable(value) {
        if (value) {
            this.setAttribute('highlighted-table', value);
        }
        else {
            this.removeAttribute('highlighted-table');
        }
    }

    connectedCallback() {
        this.renderLoading();
        this.getTables();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'highlighted-table' && oldValue !== newValue) {
            this.render();
        }
    }

    async getPeopleList() {
        let results;

        if (this.highlightedTable) {
            try {
                results = await get(`/api/table?table=${this.highlightedTable}`);
            }
            catch (error) {
                results = DEFAULT_SEATING.filter(({ table_number }) => table_number == this.highlightedTable);
            }
        }

        return results;
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
            rows: Math.max(...tableList.map(s => s.grid_row), ...MARKERS.map(m => m.row)),
            cols: Math.max(...tableList.map(s => s.grid_col), ...MARKERS.map(m => m.col))
        };

        this.tableGrid = Array.from({ length: this.gridSize.rows }, () => Array(this.gridSize.cols).fill(null));
        for (const { table_number, grid_row, grid_col, type, label, width, height, spanRow, spanCol } of tableList) {
            this.tableGrid[grid_row - 1][grid_col - 1] = { table_number, type, label, width, height, spanRow, spanCol };
        }

        this.render();
    }

    getCellStyle(row, col, tableType, spanRow, spanCol, move) {
        let customStyle = (move) ? `justify-content: ${move};` : "";
        customStyle += ((spanRow && typeof spanRow === 'number') && (spanCol && typeof spanCol === 'number')) ?
            `grid-area: ${row} / ${col} / span ${spanRow} / span ${spanCol}` :
            (!tableType || tableType == "Round") ?
                `grid-area: ${row} / ${col} / span 1 / span 1;` :
                `grid-area: ${row} / ${col} / span 3 / span 1;`;
        return customStyle;
    }

    getMarkerAt(findRow, findCol) {
        return MARKERS.find(mkr => mkr.row === findRow && mkr.col === findCol);
    }

    renderLoading() {
        this.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:220px;color:#475569;">
                Loading seating map...
            </div>
        `;
    }

    async render() {
        if (!this.tableGrid || this.tableGrid.length === 0) {
            return;
        }

        let peopleList = await this.getPeopleList();
        let highlightedTableLabel;

        const cells = [];
        for (let row = 1; row <= this.gridSize.rows; row += 1) {
            for (let col = 1; col <= this.gridSize.cols; col += 1) {
                const table = this.tableGrid[row - 1][col - 1];
                const mkr = this.getMarkerAt(row, col);

                if (table && this.highlightedTable == table.table_number && table.label) {
                    highlightedTableLabel = '"' + table.label + '"';
                }

                if (table && typeof table.table_number === "number" && !isNaN(table.table_number)) {
                    cells.push(`
                        <div class="table-cell" data-row="${row}" data-col="${col}" style="${this.getCellStyle(row, col, table.type, table.spanRow, table.spanCol)}">
                            <table-object table-number="${table.table_number}" label="${table.label}" highlighted="${this.highlightedTable == table.table_number}" type="${table.type}" width="${table.width}" height="${table.height}"></table-object>
                        </div>
                    `);
                }
                else if (mkr) {
                    cells.push(`
                        <div class="table-cell empty" data-row="${row}" data-col="${col}" style="${this.getCellStyle(row, col, null, mkr.spanRow, mkr.spanCol, mkr.move)}">
                            <div class="custom-marker">${mkr.title}</div>
                        </div>
                    `);
                }
                else {
                    cells.push(`
                        <div class="table-cell empty" data-row="${row}" data-col="${col}" style="${this.getCellStyle(row, col, null, null, null)}"></div>
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
                <h1 class="title-text">Table Map</h1>
            </div>

            <details class="table-map-people">
                <summary class="table-map-people-title">Seated at Table ${highlightedTableLabel ? highlightedTableLabel : this.highlightedTable}</summary>
                <div class="content">
                    ${peopleList ? peopleList.map(({ name }) => name).join(', ') : ''}
                </div>
            </details>
            
            <div class="table-map-container">
                ${cells.join('')}
            </div>
        `;

        this.querySelector('.back-button').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent("screenchange", {
                bubbles: true,
                composed: true,
                detail: { screen: 'name-search' }
            }))
        });
    }
}

customElements.define('table-map', TableMap);
export default TableMap;