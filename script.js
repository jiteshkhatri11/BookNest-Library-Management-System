// ── DATA STORE ──
let books = [
  { id: 1,  title: "The Name of the Rose",          author: "Umberto Eco",           isbn: "978-0-15-144647-6" },
  { id: 2,  title: "One Hundred Years of Solitude",  author: "Gabriel García Márquez", isbn: "978-0-06-088328-7" },
  { id: 3,  title: "Middlemarch",                    author: "George Eliot",           isbn: "978-0-14-043451-3" },
  { id: 4,  title: "Beloved",                        author: "Toni Morrison",          isbn: "978-1-4000-3341-6" },
  { id: 5,  title: "The Brothers Karamazov",         author: "Fyodor Dostoevsky",      isbn: "978-0-374-52837-4" },
  { id: 6,  title: "Invisible Cities",               author: "Italo Calvino",          isbn: "978-0-15-645380-2" },
  { id: 7,  title: "Gilead",                         author: "Marilynne Robinson",     isbn: "978-0-312-42440-0" },
];

let nextId = books.length + 1;

// ── UTILITY ──
function showToast(msg, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── NAV ACTIVE STATE ──
function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

// ── NAV TOGGLE (mobile) ──
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links  = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
    const [a, b, c] = toggle.querySelectorAll("span");
    if (links.classList.contains("open")) {
      a.style.transform = "rotate(45deg) translate(5px, 5px)";
      b.style.opacity = "0";
      c.style.transform = "rotate(-45deg) translate(5px, -5px)";
    } else {
      a.style.transform = b.style.opacity = c.style.transform = "";
    }
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("nav")) links.classList.remove("open");
  });
}

// ── LOGIN ──
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    const btn = form.querySelector("button[type=submit]");
    btn.textContent = "Signing in…";
    btn.disabled = true;

    setTimeout(() => {
      if (user === "admin" && pass === "library123") {
        localStorage.setItem("lms_user", user);
        showToast("Welcome back, " + user + "! Redirecting…", "success");
        setTimeout(() => (window.location.href = "viewBooks.html"), 1200);
      } else if (!user || !pass) {
        showToast("Please fill in all fields.", "error");
        btn.textContent = "Sign In";
        btn.disabled = false;
      } else {
        showToast("Invalid credentials. Try admin / library123", "error");
        document.getElementById("password").value = "";
        btn.textContent = "Sign In";
        btn.disabled = false;
      }
    }, 700);
  });
}

// ── ADD BOOK ──
function initAddBookForm() {
  const form = document.getElementById("addBookForm");
  if (!form) return;

  // Live ISBN format hint
  const isbnInput = document.getElementById("isbn");
  isbnInput && isbnInput.addEventListener("input", () => {
    const hint = document.getElementById("isbnHint");
    if (!hint) return;
    const v = isbnInput.value.replace(/[^0-9Xx-]/g, "");
    hint.style.color = v.length >= 10 ? "var(--sage)" : "rgba(26,22,18,0.35)";
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const title  = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const isbn   = document.getElementById("isbn").value.trim();

    if (!title || !author || !isbn) {
      showToast("All fields are required.", "error"); return;
    }
    if (isbn.length < 10) {
      showToast("ISBN must be at least 10 characters.", "error"); return;
    }
    if (books.some(b => b.isbn === isbn)) {
      showToast("A book with this ISBN already exists.", "error"); return;
    }

    const newBook = { id: nextId++, title, author, isbn };
    books.push(newBook);

    const btn = form.querySelector("button[type=submit]");
    btn.textContent = "Adding…";
    btn.disabled = true;

    setTimeout(() => {
      showToast(`"${title}" added to the library!`, "success");
      form.reset();
      btn.textContent = "Add to Library";
      btn.disabled = false;

      // Show preview
      const preview = document.getElementById("addedPreview");
      if (preview) {
        preview.innerHTML = `
          <div style="padding:1rem;background:rgba(107,124,94,0.08);border:1px solid rgba(107,124,94,0.25);border-radius:6px;font-size:0.875rem;">
            <span style="color:var(--sage);font-weight:600;">✓ Book #${newBook.id} added</span>
            <div style="margin-top:0.375rem;color:rgba(26,22,18,0.65);">${title} · ${author}</div>
          </div>`;
        preview.style.marginTop = "1rem";
      }
    }, 600);
  });
}

// ── VIEW BOOKS ──
function renderTable(data) {
  const tbody = document.getElementById("booksTableBody");
  const count = document.getElementById("bookCount");
  const empty = document.getElementById("emptyState");
  if (!tbody) return;

  if (count) count.textContent = data.length;

  if (data.length === 0) {
    tbody.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  tbody.innerHTML = data.map(b => `
    <tr data-id="${b.id}">
      <td class="td-id">#${String(b.id).padStart(2, "0")}</td>
      <td class="td-title">${escHtml(b.title)}</td>
      <td class="td-author">${escHtml(b.author)}</td>
      <td><span class="td-isbn">${escHtml(b.isbn)}</span></td>
      <td class="td-actions">
        <button class="btn-icon" title="View" onclick="viewBook(${b.id})">👁</button>
        <button class="btn-icon delete" title="Delete" onclick="deleteBook(${b.id})">✕</button>
      </td>
    </tr>`).join("");
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function viewBook(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;
  showToast(`📖 "${b.title}" by ${b.author}`, "info");
}

function deleteBook(id) {
  const idx = books.findIndex(x => x.id === id);
  if (idx === -1) return;
  const title = books[idx].title;
  books.splice(idx, 1);
  renderTable(currentFilter());
  showToast(`"${title}" removed from library.`, "error");
}

function currentFilter() {
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase();
  return q ? books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.isbn.toLowerCase().includes(q)
  ) : [...books];
}

function initViewBooks() {
  if (!document.getElementById("booksTableBody")) return;

  renderTable(books);

  const search = document.getElementById("searchInput");
  if (search) {
    search.addEventListener("input", () => renderTable(currentFilter()));
  }

  const lastUpdated = document.getElementById("lastUpdated");
  if (lastUpdated) lastUpdated.textContent = "Last updated: " + formatDate();
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  initNavToggle();
  initLoginForm();
  initAddBookForm();
  initViewBooks();
});