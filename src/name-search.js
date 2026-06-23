import { get } from './db-utility.js';
import { DEFAULT_SEATING } from './constants.js';

class NameSearch extends HTMLElement {
    clickCount = 0;

    connectedCallback() {
        this.render();
    }

    async render() {
        this.innerHTML = `
            <h1 class="title-text">Find Your Table</h1>
            <input id="name-query" type="text" placeholder="Enter your name..." autocomplete="off" />
        `;

        this.querySelector('.title-text').addEventListener('click', this.handleTitleClick.bind(this));
        this.querySelector('.title-text').addEventListener('touchstart', this.handleTitleClick.bind(this));

        const input = this.querySelector('#name-query');
        input.addEventListener('input', async () => {
            const query = input.value;

            if (input.value) {
                try {
                    const results = await get(`/api/table?name=${encodeURIComponent(input.value)}`);

                    if (results) {
                        this.dispatchEvent(new CustomEvent('seating-search', {
                            bubbles: true,
                            composed: true,
                            detail: { results }
                        }));
                    }
                }
                catch (error) {
                    this.dispatchEvent(new CustomEvent('seating-search', {
                        bubbles: true,
                        composed: true,
                        detail: { results: DEFAULT_SEATING.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase())) }
                    }));
                }
            }
            else {
                this.dispatchEvent(new CustomEvent('seating-search', {
                    bubbles: true,
                    composed: true,
                    detail: { results: [] }
                }));
            }
        });
    }

    handleTitleClick() {
        this.clickCount++;
        if (this.clickCount === 10) {
            this.dispatchEvent(new CustomEvent("screenchange", {
                bubbles: true,
                composed: true,
                detail: { screen: 'control-center' }
            }));
            this.clickCount = 0;
        }
    }
}

customElements.define('name-search', NameSearch);
export default NameSearch;