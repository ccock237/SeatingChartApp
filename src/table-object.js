class TableObject extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Called when the element is added to the DOM
        this.tableNumber = this.getAttribute('table-number');
        this.label = (this.getAttribute("label") !== "undefined" && this.getAttribute("label") !== "null") ? this.getAttribute("label") : null;
        this.isHighlighted = this.getAttribute('highlighted') === 'true';
        this.type = this.getAttribute("type");
        this.width = this.getAttribute("width") !== "undefined" && this.getAttribute("width") !== "null" ? this.getAttribute("width") : null;
        this.height = this.getAttribute("height") !== "undefined" && this.getAttribute("height") !== "null" ? this.getAttribute("height") : null;
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="table-object-card">
                <div class="chair top ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair top-right ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair right ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair bottom-right ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair bottom ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair bottom-left ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair left ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                <div class="chair top-left ${this.type === 'Rectangle' ? 'rect' : ''}"></div>
                
                <div class="table-plate${this.isHighlighted ? ' highlighted' : ''}${this.type === 'Rectangle' ? ' rect' : ''}" style="${this.width ? `width: ${this.width}px;` : ''}${this.height ? `height: ${this.height}px;` : ''}">
                    <div style="text-align:center;color:#0f172a;font-weight:bold;line-height:1.1;">
                        <div style="${this.label ? 'font-size: 0.6rem;' : 'font-size: 1.3rem;'}">${this.label ? this.label : this.tableNumber}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('table-object', TableObject);

export default TableObject;
