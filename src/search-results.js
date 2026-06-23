class SearchResults extends HTMLElement {
    constructor() {
        super();
        this.matches = [];
    }

    connectedCallback() {
        this.render();
        window.addEventListener('seating-search', this.handleSearch.bind(this));
    }

    handleSearch(event) {
        this.matches = event.detail.results;
        this.render();
    }

    render() {
        this.style.display = this.matches.length > 0 ? 'flex' : 'none';
        this.innerHTML = `
            ${this.matches.map(match => {
                return `
                    <div class="search-result-card${match.label ? ' custom-label' : ''}" data-name="${match.name}">
                        ${match.name} → ${match.label ? '"' + match.label + '"' : "#" + match.table_number}
                        <div class="search-result-hint">
                            Tap for more information
                        </div>
                    </div>
                `;
            }).join('')}
        `;

        this.querySelectorAll('.search-result-card').forEach(card => {
            card.addEventListener('click', event => {
                const name = event.currentTarget.getAttribute('data-name');
                const match = this.matches.find(m => m.name === name);
                if (match) {
                    this.dispatchEvent(new CustomEvent("screenchange", {
                        bubbles: true,
                        composed: true,
                        detail: { screen: 'table-map', name: match.name, table_number: match.table_number }
                    }));
                }
            });
        });
    }
}

customElements.define('search-results', SearchResults);

export default SearchResults;
