/**
 * <he-pagination> – Custom Pagination Web Component
 * --------------------------------------------------
 * Author: Henrik Eriksson
 * Email:  archmiffo@gmail.com
 * 
 * A self-contained and configurable pagination controller for use in dynamic web applications.
 * This component does not render paged content but emits an event with relevant pagination data 
 * when the active page changes.
 * 
 * Made with the purpose of working with arrays of items, where the component manages the current
 * item index and calculates the corresponding page ranges. Use array.slice(event.detail.currentRange)
 * to get the items for the current page.
 *
 * Features:
 * - Configurable number of visible page buttons, edge buttons, and middle indicators.
 * - Previous/Next and First/Last controls with four display modes (0–3).
 * - - 0: No buttons
 * - - 1: Hidden instead of disabled, when disabled
 * - - 2: Disabled when not applicable, but visible. Default value.
 * - - 3: Always functional, but clamped to valid ranges
 * - Emits 'pagination-updated' event with current, previous, and next page ranges.
 * - Minimal DOM footprint, CSS-driven visibility behavior via data attributes and :disabled selectors.
 * - Full property-attribute sync with validation and internal state management.
 * 
 * HTML Attributes:
 * - total-items:        Total number of items (default: 0, first item at index 1)
 * - items-per-page:     Items per page (default: 10)
 * - current-item:       Index of current item (default: 1)
 * - max-visible-pages:  Max page buttons in the main window (default: 10)
 * - edge-pages:         Number of edge page buttons (default: 0)
 * - middle-pages:       Number of mid-gap page buttons (default: 0)
 * - middle-page-gap:    Number of pages to skip before showing middle page buttons (default: 5)
 * - nav-buttons:        0–3 (prev/next display mode, default: 2)
 * - jump-buttons:       0–3 (first/last display mode, default: 2)
 * 
 * JavaScript Properties:
 * - totalItems, itemsPerPage, currentItem, edgePages, maxVisiblePages, middlePages
 * - navButtons, jumpButtons (same rules as attributes)
 * - totalPages (read-only)
 * 
 * CSS Custom Properties:   Default:
 * - --he-font-family:      system-ui, sans-serif
 * - --he-font-size:        1rem
 * - --he-border:           1px solid #ccc
 * - --he-color:            #000
 * - --he-color-disabled:   #aaa
 * - --he-bg:               #eee
 * - --he-border-radius:    0
 * 
 * Events:
 * - pagination-updated: Dispatched with detail:
 *   {
 *     currentPage,
 *     totalPages,
 *     currentItem,
 *     currentRange: { start, end },
 *     previousRange: { start, end },
 *     nextRange: { start, end }
 *   }
 * 
 * Example usage:
 * <he-pagination
 *   total-items="1237"
 *   items-per-page="12"
 *   max-visible-pages="10"
 *   edge-pages="2"
 *   middle-pages="2"
 *   nav-buttons="2"
 *   jump-buttons="1">
 * </he-pagination>
 */
'use strict';

class Pagination extends HTMLElement {
    static get observedAttributes() {
        return ['total-items', 'items-per-page', 'edge-pages', 'current-item', 'max-visible-pages', 'middle-pages', 'middle-page-gap', 'nav-buttons', 'jump-buttons'];
    }

    #currentItem;
    #edgePages;
    #totalItems;
    #itemsPerPage;
    #maxVisiblePages;
    #middlePages;
    #middlePageGap;
    #navButtons;
    #jumpButtons;
    #isInitialized;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    --font-family: var(--he-font-family, Arial, sans-serif);
                    --font-size: var(--he-font-size, 0.7rem);
                    --color: var(--he-color, #000);
                    --color-disabled: var(--he-color-disabled, #aaa);
                    --bg: var(--he-bg, #eee);
                    --border: var(--he-border, 1px solid #ccc);
                    --border-radius: var(--he-border-radius, 0);
                }

                #pages {
                    margin: 0;
                    padding: 0;
                }

                .page-button {
                    font-family: var(--font-family);
                    background-color: var(--bg);
                    color: var(--color);
                    border: var(--border);
                    border-radius: var(--border-radius);
                    font-size: var(--font-size);
                    width: calc(var(--font-size) * 2.2);                    
                    box-sizing: border-box;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    aspect-ratio: 1;
                    margin: 0;
                    padding: 0;

                    &:disabled {
                        color: var(--color-disabled);
                        cursor: not-allowed;
                    }
                }

                .ellipsis {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--font-size);
                    width: calc(var(--font-size) * 1);
                    aspect-ratio: 1;
                }

                .nav-control {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;

                    &:disabled {
                        color: var(--color-disabled);
                        cursor: not-allowed;
                    }
                }

                .nav-control[data-state="0"] {
                    display: none;
                }

                .nav-control:disabled[data-state="1"] {
                    display: none;
                    cursor: not-allowed;
                }
            </style>
            <div id="pagination">
                <button id="first" class="page-button nav-control">&laquo;</button>
                <button id="prev" class="page-button nav-control">&lt;</button>
                <span id="pages">

                </span>
                <button id="next" class="page-button nav-control">&gt;</button>
                <button id="last" class="page-button nav-control">&raquo;</button>
            </div>
            `;
        shadow.appendChild(template.content.cloneNode(true));

        this.wrapper = shadow.getElementById('pagination');
        this.prevButton = shadow.getElementById('prev');
        this.nextButton = shadow.getElementById('next');
        this.pages = shadow.getElementById('pages');
        this.firstButton = shadow.getElementById('first');
        this.lastButton = shadow.getElementById('last');

        this.firstButton.addEventListener('click', () => {
            this.currentItem = 1;
        });

        this.lastButton.addEventListener('click', () => {
            this.currentItem = this.#totalItems;
        });

        this.prevButton.addEventListener('click', () => {
            if (this.#currentItem > this.#itemsPerPage) {
                this.currentItem = Math.max(1, this.#currentItem - this.#itemsPerPage);
            }
        });

        this.nextButton.addEventListener('click', () => {
            if (this.#currentItem < this.#totalItems - this.#itemsPerPage + 1) {
                this.currentItem = Math.min(this.#totalItems, this.#currentItem + this.#itemsPerPage);
            }
        });

        this.#isInitialized = false;
        this.#totalItems = parseInt(this.getAttribute('total-items')) || 0; // Required > 0 for element to be displayed.
        this.#itemsPerPage = parseInt(this.getAttribute('items-per-page')) || 10;
        this.#edgePages = parseInt(this.getAttribute('edge-pages')) || 0;
        this.#maxVisiblePages = parseInt(this.getAttribute('max-visible-pages')) || 10;
        this.#middlePages = parseInt(this.getAttribute('middle-pages')) || 0;
        this.#middlePageGap = parseInt(this.getAttribute('middle-page-gap')) || 5;
        this.#navButtons = parseInt(this.getAttribute('nav-buttons')) || 2;
        this.#jumpButtons = parseInt(this.getAttribute('jump-buttons')) || 2;
        this.#currentItem = 1;
    }

    get totalItems() {
        return this.#totalItems;
    }
    set totalItems(value) {
        if (value < 0) {
            throw new Error('Total items must be a non-negative integer.');
        }
        this.#totalItems = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get totalPages() {
        return Math.ceil(this.#totalItems / this.#itemsPerPage);
    }

    get currentItem() {
        return this.#currentItem;
    }
    set currentItem(value) {
        if (value < 1 || value > this.#totalItems) {
            throw new Error('Current item must be between 1 and total pages.');
        }
        this.#currentItem = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get edgePages() {
        return this.#edgePages;
    }
    set edgePages(value) {
        if (value < 0) {
            throw new Error('Edge pages must be a non-negative integer.');
        }
        this.#edgePages = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get itemsPerPage() {
        return this.#itemsPerPage;
    }
    set itemsPerPage(value) {
        if (value <= 0) {
            throw new Error('Items per page must be a positive integer.');
        }
        this.#itemsPerPage = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get maxVisiblePages() {
        return this.#maxVisiblePages || 10; // Default to 10 if not set
    }
    set maxVisiblePages(value) {
        if (value <= 0) {
            throw new Error('Max visible pages must be a positive integer.');
        }
        this.#maxVisiblePages = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get middlePages() {
        return this.#middlePages || 0; // Default to 0 if not set
    }
    set middlePages(value) {
        if (value < 0) {
            throw new Error('Middle pages must be a non-negative integer.');
        }
        this.#middlePages = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get middlePageGap() {
        return this.#middlePageGap || 0; // Default to 0 if not set
    }
    set middlePageGap(value) {
        if (value < 0) {
            throw new Error('Middle page gap must be a non-negative integer.');
        }
        this.#middlePageGap = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get navButtons() {
        return this.#navButtons;
    }
    set navButtons(value) {
        if(value < 0  || value > 3) {
            throw new Error('Nav buttons must have a value between 0 and 3.');
        }
        this.prevButton.dataset.state = value;
        this.nextButton.dataset.state = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    get jumpButtons() {
        return this.#jumpButtons;
    }
    set jumpButtons(value) {
        if(value < 0 || value > 3) {
            throw new Error('Jump buttons must have a value between 0 and 3.');
        }
        this.firstButton.dataset.state = value;
        this.lastButton.dataset.state = value;
        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    updatePagination() {
        const totalPages = this.totalPages;
        const currentPage = this.getPageFromItemIndex(this.#currentItem);
        this.prevButton.disabled = currentPage === 1 && this.prevButton.dataset.state !== '3';
        this.firstButton.disabled = currentPage === 1 && this.firstButton.dataset.state !== '3';
        this.nextButton.disabled = currentPage === totalPages && this.nextButton.dataset.state !== '3';
        this.lastButton.disabled = currentPage === totalPages && this.lastButton.dataset.state !== '3';

        this.pages.innerHTML = '';

        const pageWindowStart = Pagination.#clamp(Math.min(currentPage - Math.floor(this.#maxVisiblePages / 2), totalPages - (this.#maxVisiblePages - 1)), 1, totalPages);
        const pageWindowEnd = Pagination.#clamp(pageWindowStart + this.#maxVisiblePages - 1, 1, totalPages);

        const structure = [];

        structure.push(...this.#getWindowPages(pageWindowStart, pageWindowEnd));
        structure.push(...this.#getEdgePages(pageWindowStart, pageWindowEnd));
        structure.push(...this.#getMiddlePages(pageWindowStart, pageWindowEnd));

        structure.sort((a, b) => a.page - b.page);

        if(this.#totalItems > 0){
            this.#renderPages(structure);
        } else {
            const navControls = this.shadowRoot.querySelectorAll('.nav-control');
            navControls.forEach(control => {
                control.style.display = 'none';
            });
        }

        const previousRange = this.getRangeFromPage(this.getPageFromItemIndex(this.#currentItem - this.#itemsPerPage));
        const nextRange = this.getRangeFromPage(this.getPageFromItemIndex(this.#currentItem + this.#itemsPerPage));

        this.dispatchEvent(new CustomEvent('pagination-updated', {
            detail: {
                currentPage: currentPage,
                totalPages: totalPages,
                currentItem: this.#currentItem,
                currentRange: this.getRangeFromPage(currentPage),
                previousRange: previousRange,
                nextRange: nextRange
            },
            bubbles: true,
            composed: true
        }));
    }

    #renderPages(structure) {
        structure.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.textContent = item.page;
            btn.classList.add('page-button');
            btn.setAttribute('aria-label', `Page ${item.page}`);
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
            if (item.page === this.getPageFromItemIndex(this.#currentItem)) {
                btn.setAttribute('disabled', 'true');
            }
            btn.addEventListener('click', () => {
                this.currentItem = this.getRangeFromPage(item.page).start;
            });
            this.pages.appendChild(btn);

            if(index < structure.length - 1 && structure[index + 1].page - item.page > 1) {
                const ellipsis = document.createElement('span');
                ellipsis.classList.add('ellipsis');
                ellipsis.textContent = '...';
                this.pages.appendChild(ellipsis);
            }
        });
    };

    getPageFromItemIndex(index) {
        index = Pagination.#clamp(index, 1, this.#totalItems);
        return Math.ceil((index) / this.#itemsPerPage);
    }

    getRangeFromPage(page) {
        page = Pagination.#clamp(page, 1, this.totalPages);
        const start = (page - 1) * this.#itemsPerPage + 1;
        const end = Math.min(page * this.#itemsPerPage, this.#totalItems);
        return { start, end };
    }

    connectedCallback() {
        if (!this.#isInitialized) {
            this.updatePagination();
            this.#isInitialized = true;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const propertyName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        if (propertyName in this) {
            this[propertyName] = parseInt(newValue) || 0;
        }
        if(propertyName === 'navButtons' && (newValue < 0 || newValue > 3)) {
            this.prevButton.dataset.state = newValue;
            this.nextButton.dataset.state = newValue;
        }
        if (propertyName === 'jumpButtons' && (newValue < 0 || newValue > 3)) {
            this.firstButton.dataset.state = newValue;
            this.lastButton.dataset.state = newValue;
        }

        if(this.#isInitialized) {
            this.updatePagination();
        }
    }

    #getWindowPages(startPage, endPage) {
        const windowPages = [];
        for (let i = startPage; i <= endPage; i++) {
            const page = { page: i, type: 'window' };
            windowPages.push(page);
        }
        return windowPages;
    }

    #getEdgePages(startPage, endPage) {
        const edgePages = [];
        // Low edge pages
        if (this.#edgePages > 0 && startPage > 1) {
            const lastLowEdge = Math.min(this.#edgePages, startPage - 1);
            for (let i = 1; i <= lastLowEdge; i++) {
                const page = { page: i, type: 'low-edge' };
                edgePages.push(page);
            }
        }

        // High edge pages
        if (this.#edgePages > 0 && endPage < this.totalPages) {
            const firstHighEdge = Math.max(this.totalPages - this.#edgePages + 1, endPage + 1);
            for (let i = firstHighEdge; i <= this.totalPages; i++) {
                const page = { page: i, type: 'high-edge' };
                edgePages.push(page);
            }
        }

        return edgePages;
    }

    #getMiddlePages(startPage, endPage) {
        const middlePages = [];

        if (this.#middlePages <= 0) return middlePages;

        const edgeCount = this.#edgePages > 0 ? this.#edgePages : 0;

        const leftAnchor = edgeCount > 0 ? edgeCount : 1;
        const rightAnchor = edgeCount > 0 ? this.totalPages - edgeCount + 1 : this.totalPages;

        // --- Middle Low Pages ---
        const gapLow = startPage - leftAnchor - 1;
        if (gapLow > this.#middlePageGap) {
            const midStart = leftAnchor + Math.floor((gapLow - this.#middlePages) / 2) + 1;
            const midEnd = Math.min(midStart + this.#middlePages - 1, startPage - 1);
            for (let i = midStart; i <= midEnd; i++) {
                middlePages.push({ page: i, type: 'middle' });
            }
        }

        // --- Middle High Pages ---
        const gapHigh = rightAnchor - endPage - 1;
        if (gapHigh > this.#middlePageGap) {
            const midStart = endPage + Math.floor((gapHigh - this.#middlePages) / 2) + 1;
            const midEnd = Math.min(midStart + this.#middlePages - 1, rightAnchor - 1);
            for (let i = midStart; i <= midEnd; i++) {
                middlePages.push({ page: i, type: 'middle' });
            }
        }

        return middlePages;
    }

    static #clamp = (val, min, max) => Math.min(Math.max(val, min), max);

}
customElements.define('he-pagination', Pagination);