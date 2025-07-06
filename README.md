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
|nav-buttons|2|Controls previous/next buttons|
|jump-buttons|2|Controls first/last buttons (same behavior as above)|

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

## 🎨 Styling
The component uses a `--font-size` CSS variable to scale all UI elements:
```javascript
he-pagination {
  --font-size: 0.9rem;
}
```
#### Additional classes:
+ `.page-button`
+ `.ellipsis`
+ `.nav-control[data-state="X"]`
You can override styles by applying your own rules or by editing the source if needed.

## ✨ AI Disclosure
AI used for **minor** refactoring, attribute-naming and workflow. 

## 📦 License
MIT License

### 👤 Author
**Henrik Eriksson**
**📧 archmiffo@gmail.com**

This component is built for internal use but is shared here in case it helps others.
