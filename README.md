# `<he-pagination>` – Custom Pagination Web Component

**Author:** Henrik Eriksson  
**Email:** [archmiffo@gmail.com](mailto:archmiffo@gmail.com)

A lightweight, configurable, and framework-agnostic pagination component.  
This Web Component is designed to control pagination logic in JavaScript-heavy apps without rendering actual content — perfect for use with arrays, JSON lists, or dynamic frontends.

---

## 🔧 Features

- Fully configurable via attributes and JavaScript properties
- First/Last and Previous/Next buttons with flexible display behavior
- Edge and middle page ranges for advanced pagination UX
- Automatically calculates correct page ranges for slicing
- Dispatches detailed pagination event on every update
- Zero dependencies and minimal DOM structure
- Uses Shadow DOM and CSS variables for encapsulated styling

Example with all nav controls, edge-pages and middle pages.  

![Example of the pagination element](https://heriksson.se/pagination.png)
---

## 🚀 Getting Started

### 1. Include the component

```html
<script type="module" src="./he-pagination.js"></script>
```
### 2. Add to your HTML
```html
<!-- Example values -->
<he-pagination
  total-items="1237"
  items-per-page="12"
  max-visible-pages="10"
  edge-pages="2"
  middle-pages="2"
  nav-buttons="2"
  jump-buttons="1">
</he-pagination>
```
## 📤 Usage & Integration
See ``examples`` for a working demonstration.

```javascript
const fullItemArray = [{item1}, {items2}, ...]; //List of all items to be paginated.

const pagination = document.querySelector('he-pagination');
pagination.totalItems = fullItemArray.length;

pagination.addEventListener('pagination-updated', (e) => {
  const { currentRange } = e.detail;
  const itemsOnPage = fullItemArray.slice(currentRange.start - 1, currentRange.end);
  renderItems(itemsOnPage); //Your render-method
});
```
## 🏷️ Attributes
|Attribute|Default|Description|
|---|---|---|
|total-items|0|Total number of items (1-based indexing). **_Required_**|
|items-per-page|10|Items shown per page|
|current-item|1|Current item index (1-based)|
|max-visible-pages|10|Max number of buttons in the central window|
|edge-pages|0|Number of page buttons fixed to start/end|
|middle-pages|0|Number of "mid-gap" page buttons|
|middle-page-gap|5|The gap required for middle pages to be shown|
|nav-buttons|2|Controls previous/next buttons|
|jump-buttons|2|Controls first/last buttons (same behavior as above)|

### edge-pages
When set to a positive integer, will show the edge-pages of the entire list, for example 1 and 2 for the start of the pages.
Ellipsis will be shown where there is a gap between the edges and the windowed list.

### middle-pages
If set to > 0, will show up when there is a gap of middle-page-gap between the windowed list and the start/end or edge-pages. 

#### nav-buttons and jump-buttons states:

|State|Effect|
|---|---|
|0|hidden|
|1|hidden if inactive|
|2|visible + disabled (default)|
|3|always active, clamped|

## 💻 Properties (JavaScript)
```javascript
pagination.totalItems = 150;
pagination.itemsPerPage = 20;
pagination.currentItem = 21;
pagination.edgePages = 2;
pagination.navButtons = 1;
```
Additionally:
`pagination.totalPages` is a read-only getter

## 📡 Event: `pagination-updated`
Dispatched whenever pagination changes, with the following structure:
```javascript
{
  currentPage: Number,
  totalPages: Number,
  currentItem: Number,
  currentRange: { start, end },
  previousRange: { start, end },
  nextRange: { start, end }
}
```
#### Example
```javascript
pagination.addEventListener('pagination-updated', (e) => {
  console.log('Current range:', e.detail.currentRange);
});
```
The element doesn't control any content from the page itself. It only gives the range of an array-index (based on count, so based-1, not based-0) for the page to slice and display.  
See `example` for a demonstration of this.

## 🎨 Styling
The component uses a a few styling CSS-variables:

|CSS-variable|Default value|
|---|---|
|--he-font-family|Arial, sans-serif|
|--he-font-size|0.7rem|
|--he-color|#000|
|--he-color-disabled|#aaa|
|--he-bg|#eee|
|--he-border|1px solid #ccc|
|--he-border-radius|0|

**Exmple**
```javascript
he-pagination {
  --he-font-family: system-ui, sans-serif;
  --he-font-size: 0.9rem;
}
```
#### Additional classes:
+ `.page-button`
+ `.ellipsis`
+ `.nav-control[data-state="X"]`
You can override styles by applying your own rules or by editing the source if needed.

## ✨ AI Disclosure
AI used for **minor** refactoring, attribute-naming suggestions and logical flow.  
The element was all planned out by me, and the large majority of the codebase is written by me, but I'm very bad at naming things. I also sometimes I find my code too clunky, so I ask an AI for feedback and pseudo-code, not copy-paste code solutions.  
However, AI contributed about half the code for the example-code included. I just wanted a quick and dirty playground.  
Also, most of this document, because who the hell knows how to format an .md-file of the top of their head 😆.

## 📦 License
MIT License

### 👤 Author
**Henrik Eriksson**
**📧 archmiffo@gmail.com**

This component is built for internal use but is shared here in case it helps others.
