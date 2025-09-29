let allProducts = []; // Load from products.json
let cart = [];
const SHIPPING_FEE = 15.00;
let currentPage = 1;
const itemsPerPage = 5;

// Load products from JSON
async function loadProducts() {
    try {
        const res = await fetch('products.json');
        if (!res.ok) throw new Error("Failed to load products.json");
        allProducts = await res.json();
        loadCart();
        renderProducts();
    } catch (err) {
        console.error(err);
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) cart = JSON.parse(savedCart);
}

// Save cart
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Debounce helper
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Render products
function renderProducts() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const sortValue = document.getElementById('sort').value;

    let filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchValue) ||
        p.description.toLowerCase().includes(searchValue)
    );

    if (sortValue === 'low-high') filtered.sort((a, b) => a.price - b.price);
    if (sortValue === 'high-low') filtered.sort((a, b) => b.price - a.price);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);

    const container = document.getElementById('products');
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();
    pageItems.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const imgSrc = p.image || 'product-imgs/blank.png';
        card.innerHTML = `
            <img src="${imgSrc}" alt="${p.name}" loading="lazy">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p><strong>$${p.price.toFixed(2)}</strong></p>
            <div class="product-actions">
                <input type="number" min="1" value="1" data-id="${p.id}">
                <button data-id="${p.id}">Add to Cart</button>
            </div>
        `;
        fragment.appendChild(card);
    });
    container.appendChild(fragment);

    // Attach event listeners for buttons
    container.querySelectorAll('.product-actions button').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const input = container.querySelector(`input[data-id="${id}"]`);
            const quantity = parseInt(input.value) || 1;
            addToCart(id, quantity);
        });
    });

    renderPagination(totalPages);
    updateCartDisplay();
}

// Add to cart
function addToCart(productId, quantity = 1) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    updateCartDisplay();
}

// Update cart
function updateCartDisplay() {
    const cartContainer = document.getElementById('cart');
    const countHeader = document.getElementById('cart-count-header');
    const countSidebar = document.getElementById('cart-count-sidebar');
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('shipping-fee');
    const totalEl = document.getElementById('cart-total');

    cartContainer.innerHTML = '';
    let subtotal = 0, totalCount = 0;

    const fragment = document.createDocumentFragment();
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        totalCount += item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <div>
                <button data-id="${item.id}" data-delta="-1">−</button>
                <button data-id="${item.id}" data-delta="1">+</button>
                <button data-id="${item.id}">Remove</button>
            </div>
        `;
        fragment.appendChild(div);
    });
    cartContainer.appendChild(fragment);

    // Attach cart buttons
    cartContainer.querySelectorAll('.cart-item button').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        if (btn.textContent === 'Remove') btn.addEventListener('click', () => removeFromCart(id));
        else btn.addEventListener('click', () => changeQuantity(id, parseInt(btn.dataset.delta)));
    });

    countHeader.textContent = totalCount;
    countSidebar.textContent = totalCount;
    subtotalEl.textContent = subtotal.toFixed(2);
    shippingEl.textContent = subtotal > 0 ? SHIPPING_FEE.toFixed(2) : "0.00";
    totalEl.textContent = (subtotal > 0 ? subtotal + SHIPPING_FEE : 0).toFixed(2);

    saveCart();
}

// Change quantity
function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    updateCartDisplay();
}

// Remove item
function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartDisplay();
}

// Clear cart
document.getElementById('clear-cart').addEventListener('click', () => {
    cart = [];
    updateCartDisplay();
});

// Pagination
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';

    const prev = document.createElement('button');
    prev.textContent = '←';
    prev.disabled = currentPage === 1;
    prev.classList.add('arrow');
    prev.onclick = () => { if (currentPage > 1) { currentPage--; renderProducts(); } };
    container.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('current-page');
        btn.onclick = () => { currentPage = i; renderProducts(); };
        container.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = '→';
    next.disabled = currentPage === totalPages;
    next.classList.add('arrow');
    next.onclick = () => { if (currentPage < totalPages) { currentPage++; renderProducts(); } };
    container.appendChild(next);
}

// Toggle cart
document.getElementById('toggle-cart-btn').addEventListener('click', () => {
    document.getElementById('cart-section').classList.add('active');
    document.getElementById('cart-overlay').style.opacity = 1;
    document.getElementById('cart-overlay').style.pointerEvents = "auto";
});
document.getElementById('close-cart-btn').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);
function closeCart() {
    document.getElementById('cart-section').classList.remove('active');
    document.getElementById('cart-overlay').style.opacity = 0;
    document.getElementById('cart-overlay').style.pointerEvents = "none";
}

// Search & sort with debounce
document.getElementById('search').addEventListener('input', debounce(() => {
    currentPage = 1; renderProducts();
}, 200));
document.getElementById('sort').addEventListener('change', () => {
    currentPage = 1; renderProducts();
});

// Mobile navigation toggle
document.getElementById('nav-toggle').addEventListener('click', () => {
    document.querySelector('.nav-bar').classList.toggle('active');
});

// Init
loadProducts();