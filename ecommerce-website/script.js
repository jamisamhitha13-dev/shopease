const products = [
  {
    id: 1,
    name: "Running Shoes",
    category: "Fashion",
    price: 1499,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2299,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Ceramic Vase",
    category: "Home",
    price: 799,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Classic Watch",
    category: "Accessories",
    price: 1899,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Backpack",
    category: "Accessories",
    price: 1299,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Cotton T-Shirt",
    category: "Fashion",
    price: 599,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Desk Lamp",
    category: "Home",
    price: 999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    name: "Smart Speaker",
    category: "Electronics",
    price: 2799,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=600&q=80"
  }
];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("search");
const cartSection = document.getElementById("cartSection");

let selectedCategory = "All";
let cart = [];

try {
  const savedCart = JSON.parse(
    localStorage.getItem("shopease-cart") || "[]"
  );

  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(item =>
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  }
} catch {
  cart = [];
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

function saveCart() {
  try {
    localStorage.setItem("shopease-cart", JSON.stringify(cart));
  } catch {
    // Cart remains usable until the page is closed.
  }
}

function displayProducts() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    productGrid.innerHTML =
      '<p class="no-products">No products found. Try another search.</p>';
    return;
  }

  productGrid.innerHTML = filteredProducts.map(product => `
    <article class="product">
      <img
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
      >

      <div class="product-info">
        <p class="category">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="rating">★ ${product.rating} / 5</p>

        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>
          <button
            class="add-button"
            data-add="${product.id}"
            aria-label="Add ${product.name} to cart"
          >+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  displayCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  displayCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  displayCart();
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");

  const count = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  const delivery = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  const total = subtotal + delivery;

  document.getElementById("cartCount").textContent = count;
  document.getElementById("subtotal").textContent =
    formatPrice(subtotal);
  document.getElementById("deliveryText").textContent =
    delivery === 0 ? "Delivery: Free" : `Delivery: ${formatPrice(delivery)}`;
  document.getElementById("total").textContent = formatPrice(total);

  document.getElementById("checkout").disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return `
      <div class="cart-item">
        <div>
          <h4>${product.name}</h4>
          <p>${formatPrice(product.price)} each</p>

          <div class="quantity">
            <button
              data-id="${product.id}"
              data-change="-1"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.quantity}</span>

            <button
              data-id="${product.id}"
              data-change="1"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        <div>
          <strong>${formatPrice(product.price * item.quantity)}</strong>
          <br><br>
          <button class="remove" data-remove="${product.id}">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Add products to cart
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (button) {
    addToCart(Number(button.dataset.add));
  }
});

// Search products
searchInput.addEventListener("input", displayProducts);

// Category filters
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    document.querySelectorAll(".filter").forEach(filter => {
      filter.classList.toggle("active", filter === button);
    });

    displayProducts();
  });
});

// Open and close cart
document.getElementById("cartButton").addEventListener("click", () => {
  cartSection.classList.add("open");
});

document.getElementById("closeCart").addEventListener("click", () => {
  cartSection.classList.remove("open");
});

// Change quantity or remove items
document.getElementById("cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    changeQuantity(
      Number(quantityButton.dataset.id),
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

// Demo checkout
document.getElementById("checkout").addEventListener("click", () => {
  if (cart.length === 0) return;

  alert(
    "Thank you for shopping with ShopEase!\n\n" +
    "This is a demo checkout. No real order or payment was processed."
  );
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Initial display
displayProducts();
displayCart();