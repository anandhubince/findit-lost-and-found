/* FindIt – shared script. Every page loads this file. */

/* ---------- 1. Data ---------- */
const PAGES = [
  ["index.html", "Home"],
  ["lost.html", "Lost Items"],
  ["found.html", "Found Items"],
  ["report.html", "Report"],
  ["categories.html", "Categories"],
  ["about.html", "About"],
  ["contact.html", "Contact"]
];

const CATEGORY_ICONS = {
  "Electronics": "📱", "Wallets & Purses": "👛", "Bags": "🎒", "Documents & IDs": "🪪",
  "Keys": "🔑", "Jewellery": "💍", "Accessories": "🕶️", "Others": "📦"
};

const STORAGE_KEY = "findit-items-v2";

/* Returns a date like "2026-10-30", n days before today */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/* Sample items so the site is not empty on the first visit */
const SAMPLE_ITEMS = [
  { id: 1, type: "Lost",  title: "Black leather wallet", category: "Wallets & Purses", location: "KSRTC bus stand, Thodupuzha", date: daysAgo(1), desc: "Has an ID card and two bank cards.", contact: "owner1@example.com" },
  { id: 2, type: "Found", title: "Keys with red keychain", category: "Keys", location: "Technopark, Thiruvananthapuram", date: daysAgo(2), desc: "Handed to the security desk.", contact: "9000000001" },
  { id: 3, type: "Lost",  title: "Redmi phone, green cover", category: "Electronics", location: "Munnar town", date: daysAgo(3), desc: "Cracked screen protector.", contact: "9000000002" },
  { id: 4, type: "Found", title: "Blue backpack", category: "Bags", location: "Marine Drive, Kochi", date: daysAgo(3), desc: "Contains a notebook and a bottle.", contact: "finder@example.com" },
  { id: 5, type: "Lost",  title: "Aadhaar card", category: "Documents & IDs", location: "Idukki collectorate", date: daysAgo(5), desc: "Name starts with A.", contact: "owner2@example.com" },
  { id: 6, type: "Found", title: "Silver bracelet", category: "Jewellery", location: "Kovalam beach", date: daysAgo(6), desc: "Found near the lighthouse.", contact: "9000000003" }
];

/* ---------- 2. Saving and loading (LocalStorage) ---------- */
let memoryItems = null;   // backup if the browser blocks storage

function getItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage blocked */ }
  return memoryItems || SAMPLE_ITEMS.slice();
}

function saveItems(items) {
  memoryItems = items;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* ignore */ }
}

/* ---------- 3. Helpers ---------- */
/* Builds an element safely (text is never read as HTML) */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* One item card, used on every page. Pass onView to add a "View details" button. */
function buildItemCard(item, onView) {
  const li = el("li", "item");

  const thumb = el("div", "thumb");
  if (item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    thumb.appendChild(img);
  } else {
    thumb.textContent = CATEGORY_ICONS[item.category] || "📦";
  }
  thumb.appendChild(el("span", "pill " + item.type.toLowerCase(), item.type));

  const body = el("div", "item-body");
  body.appendChild(el("h3", "", item.title));
  body.appendChild(el("p", "", item.category));
  body.appendChild(el("p", "", "📍 " + item.location));
  body.appendChild(el("p", "", (item.type === "Lost" ? "Lost on " : "Found on ") + formatDate(item.date)));

  if (typeof onView === "function") {
    const btn = el("button", "btn yellow view-btn", "View details");
    btn.addEventListener("click", onView);
    body.appendChild(btn);
  }

  li.append(thumb, body);
  return li;
}

/* ---------- 4. Navigation bar and footer (same on every page) ---------- */
function buildLayout() {
  const current = location.pathname.split("/").pop() || "index.html";

  const nav = el("nav", "nav");
  nav.setAttribute("aria-label", "Main");
  const wrap = el("div", "wrap");

  const logo = el("a", "logo");
  logo.href = "index.html";
  logo.append("Find");
  logo.appendChild(el("span", "", "It"));
  logo.appendChild(el("i"));

  const btn = el("button", "menu-btn", "Menu");
  btn.setAttribute("aria-expanded", "false");

  const ul = el("ul", "links");
  PAGES.forEach(([file, label]) => {
    const li = document.createElement("li");
    const a = el("a", file === current ? "active" : "", label);
    a.href = file;
    li.appendChild(a);
    ul.appendChild(li);
  });

  /* Phone menu: open and close */
  btn.addEventListener("click", () => {
    const open = ul.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  wrap.append(logo, btn, ul);
  nav.appendChild(wrap);
  document.body.prepend(nav);

  const footer = el("footer", "footer");
  const fw = el("div", "wrap");
  fw.appendChild(el("span", "", "© " + new Date().getFullYear() + " FindIt. A demo project; reports are saved only in your browser."));
  const contact = el("a", "", "Contact us");
  contact.href = "contact.html";
  fw.appendChild(contact);
  footer.appendChild(fw);
  document.body.appendChild(footer);
}

/* ---------- 5. Home page: recent items and search ---------- */
function setupHome() {
  const searchBox = document.getElementById("search");
  if (!searchBox) return;   // not the home page, so do nothing

  const items = getItems().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  function showRecent(listId, type, query) {
    const q = query.trim().toLowerCase();
    const list = items
      .filter(i => i.type === type && !i.returned)
      .filter(i => !q || [i.title, i.location, i.category, i.desc || ""].join(" ").toLowerCase().includes(q))
      .slice(0, 3);

    const ul = document.getElementById(listId);
    ul.replaceChildren();

    if (list.length === 0) {
      const msg = q ? "No " + type.toLowerCase() + " items match “" + query + "”." : "No " + type.toLowerCase() + " items yet.";
      ul.appendChild(el("li", "empty", msg));
      return;
    }
    list.forEach(i => ul.appendChild(buildItemCard(i)));
  }

  function refresh() {
    showRecent("recent-lost", "Lost", searchBox.value);
    showRecent("recent-found", "Found", searchBox.value);
  }

  searchBox.addEventListener("input", refresh);
  document.getElementById("search-form").addEventListener("submit", e => { e.preventDefault(); refresh(); });
  refresh();
}

/* ---------- 5b. Lost and Found list pages ---------- */
function setupList() {
  const type = document.body.dataset.type;      // "Lost" or "Found", set on <body>
  if (!type) return;                            // not a list page, so do nothing

  const searchBox = document.getElementById("list-search");
  const catBox = document.getElementById("list-category");
  const ul = document.getElementById("list");
  const count = document.getElementById("list-count");
  let items = getItems();

  Object.keys(CATEGORY_ICONS).forEach(c => catBox.add(new Option(c, c)));

  /* The details popup, built once and reused */
  const dialog = el("dialog", "details");
  const content = el("div", "details-body");
  const actions = el("div", "details-actions");
  const doneBtn = el("button", "btn pink", "");
  const closeBtn = el("button", "btn ghost", "Close");
  actions.append(doneBtn, closeBtn);
  dialog.append(content, actions);
  document.body.appendChild(dialog);
  closeBtn.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

  function openDetails(item) {
    content.replaceChildren();

    const pic = el("div", "details-pic");
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;
      pic.appendChild(img);
    } else {
      pic.textContent = CATEGORY_ICONS[item.category] || "📦";
    }
    content.appendChild(pic);

    content.appendChild(el("span", "pill-inline " + item.type.toLowerCase(), item.type));
    content.appendChild(el("h2", "", item.title));

    const rows = [
      ["Category", item.category],
      ["Place", item.location],
      [type === "Lost" ? "Lost on" : "Found on", formatDate(item.date)],
      ["Details", item.desc || "No extra details."]
    ];
    rows.forEach(([label, value]) => {
      const p = el("p", "row");
      p.appendChild(el("strong", "", label + ": "));
      p.append(value);
      content.appendChild(p);
    });

    /* Contact: email or phone becomes a tappable link */
    const contactRow = el("p", "row");
    contactRow.appendChild(el("strong", "", "Contact: "));
    if (item.contact) {
      const link = el("a", "contact-link", item.contact);
      link.href = item.contact.includes("@") ? "mailto:" + item.contact : "tel:" + item.contact.replace(/[^0-9+]/g, "");
      contactRow.appendChild(link);
    } else {
      contactRow.append("Not given");
    }
    content.appendChild(contactRow);

    doneBtn.textContent = type === "Lost" ? "Owner got it back" : "Returned to owner";
    doneBtn.onclick = () => {
      item.returned = true;
      saveItems(items);
      dialog.close();
      render();
    };
    dialog.showModal();
  }

  function render() {
    const q = searchBox.value.trim().toLowerCase();
    const cat = catBox.value;
    const list = items
      .filter(i => i.type === type && !i.returned)
      .filter(i => cat === "all" || i.category === cat)
      .filter(i => !q || [i.title, i.location, i.category, i.desc || ""].join(" ").toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

    ul.replaceChildren();
    count.textContent = list.length + (list.length === 1 ? " item" : " items") + " shown";

    if (list.length === 0) {
      ul.appendChild(el("li", "empty", "No " + type.toLowerCase() + " items match your search. Try other words or another category."));
      return;
    }
    list.forEach(i => ul.appendChild(buildItemCard(i, () => openDetails(i))));
  }

  searchBox.addEventListener("input", render);
  catBox.addEventListener("change", render);
  render();
}

/* ---------- 5c. Categories page ---------- */
function setupCategories() {
  const tiles = document.getElementById("cat-tiles");
  if (!tiles) return;   // not the categories page, so do nothing

  const heading = document.getElementById("cat-heading");
  const results = document.getElementById("cat-results");
  const items = getItems().filter(i => !i.returned);
  let selected = "";

  function showResults() {
    results.replaceChildren();
    if (!selected) {
      heading.textContent = "Choose a category to see its items.";
      return;
    }
    const list = items
      .filter(i => i.category === selected)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

    heading.textContent = selected + " (" + list.length + ")";
    if (list.length === 0) {
      results.appendChild(el("li", "empty", "No lost or found " + selected.toLowerCase() + " reported right now."));
      return;
    }
    list.forEach(i => results.appendChild(buildItemCard(i)));
  }

  Object.keys(CATEGORY_ICONS).forEach(name => {
    const n = items.filter(i => i.category === name).length;
    const btn = el("button", "cat-tile");
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.append(
      el("span", "cat-icon", CATEGORY_ICONS[name]),
      el("strong", "", name),
      el("span", "cat-count", n + (n === 1 ? " item" : " items"))
    );
    btn.addEventListener("click", () => {
      selected = selected === name ? "" : name;   // click again to clear
      tiles.querySelectorAll(".cat-tile").forEach(t => t.setAttribute("aria-pressed", "false"));
      if (selected) btn.setAttribute("aria-pressed", "true");
      showResults();
    });
    tiles.appendChild(btn);
  });

  showResults();
}

/* ---------- 6. Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildLayout();
  setupHome();
  setupList();
  setupCategories();
});