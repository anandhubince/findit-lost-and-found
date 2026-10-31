# FindIt – Lost & Found

A responsive Lost & Found web app built with **HTML, CSS and JavaScript** (no frameworks, no backend).

**Live demo:** https://anandhubince.github.io/findit/

## Screenshots

<!-- Drag your screenshots into the editor here and GitHub will add them -->

## Features
- Report a lost or found item with a photo preview
- Search and filter by text and category
- Browse items by category
- Item details popup with a tappable phone or email contact
- Mark items as returned
- Form validation with clear error messages
- Fully responsive for phones, tablets and desktops
- Dark theme with a black, hot pink and electric yellow palette

## Tech used
- HTML5, CSS3 (mobile-first design, media queries, CSS variables)
- Vanilla JavaScript (DOM, events, form validation, FileReader and Canvas for image resizing)
- Browser LocalStorage to save reports

## Pages
Home, Lost Items, Found Items, Report, Categories, About, Contact

## Project structure
```
findit/
├── index.html
├── lost.html
├── found.html
├── report.html
├── categories.html
├── about.html
├── contact.html
├── style.css
└── script.js
```

## Run it locally
1. Download or clone this repository.
2. Open `index.html` in your browser (or use the VS Code **Live Server** extension).

## Limitation
This is a front-end demo. Reports are saved in each visitor's own browser, so other users cannot see them.

## Next steps
- Add a Python Flask backend with a MySQL database
- Add user login so reports are shared between users

## Author
Anandhu Bince – [LinkedIn](https://linkedin.com/in/anandhubince) · [GitHub](https://github.com/anandhubince)
