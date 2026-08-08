/* ==========================================================================
   BRECHÓ DESAPEGO EXPRESS - APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    products: typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : [],
    filteredProducts: [],
    activeCategory: 'Todas',
    activeSize: 'Todos',
    maxPrice: 50,
    searchQuery: '',
    sortBy: 'default',
    displayLimit: 16,
    whatsappPhone: '5521967511269'
  };

  // DOM Elements
  const productGrid = document.getElementById('product-grid');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('search-input');
  const priceSlider = document.getElementById('price-slider');
  const maxPriceDisplay = document.getElementById('max-price-display');
  const categoryBtns = document.querySelectorAll('[data-category]');
  const sizeBtns = document.querySelectorAll('[data-size]');
  const sortSelect = document.getElementById('sort-select');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const activeTagsContainer = document.getElementById('active-tags-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');

  // Modal Elements
  const modalBackdrop = document.getElementById('quick-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalPrice = document.getElementById('modal-price');
  const modalCategory = document.getElementById('modal-category');
  const modalSize = document.getElementById('modal-size');
  const modalCondition = document.getElementById('modal-condition');
  const modalDesc = document.getElementById('modal-desc');
  const modalWaBtn = document.getElementById('modal-wa-btn');

  // Initialize App
  init();

  function init() {
    updateCategoryCounts();
    applyFilters();
    setupEventListeners();
  }

  // Calculate & Display Category Counts
  function updateCategoryCounts() {
    const counts = { 'Todas': state.products.length };
    state.products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    categoryBtns.forEach(btn => {
      const cat = btn.dataset.category;
      const countSpan = btn.querySelector('.chip-count');
      if (countSpan && counts[cat] !== undefined) {
        countSpan.textContent = counts[cat];
      }
    });
  }

  // Filter & Sort Products
  function applyFilters() {
    let result = state.products.filter(item => {
      // Category Filter
      if (state.activeCategory !== 'Todas' && item.category !== state.activeCategory) {
        return false;
      }
      // Size Filter
      if (state.activeSize !== 'Todos' && item.size !== state.activeSize) {
        return false;
      }
      // Price Filter
      if (item.price > state.maxPrice) {
        return false;
      }
      // Search Query Filter
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        if (!matchTitle && !matchCat && !matchDesc) return false;
      }
      return true;
    });

    // Sorting Logic
    if (state.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    state.filteredProducts = result;
    renderCatalog();
    renderActiveTags();
  }

  // Render Catalog Grid
  function renderCatalog() {
    const visibleProducts = state.filteredProducts.slice(0, state.displayLimit);
    
    // Update count display
    if (resultsCount) {
      resultsCount.innerHTML = `Exibindo <strong>${visibleProducts.length}</strong> de <strong>${state.filteredProducts.length}</strong> garimpos disponíveis`;
    }

    if (state.filteredProducts.length === 0) {
      productGrid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🌿</div>
          <h3>Nenhum garimpo encontrado</h3>
          <p>Tente ajustar os filtros ou pesquisar por outro termo.</p>
          <button class="btn-primary" id="btn-clear-empty" style="margin-top: 1rem;">Limpar Filtros</button>
        </div>
      `;
      const btnClearEmpty = document.getElementById('btn-clear-empty');
      if (btnClearEmpty) btnClearEmpty.addEventListener('click', resetAllFilters);
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    productGrid.innerHTML = visibleProducts.map(product => createProductCard(product)).join('');

    // Toggle Load More Button
    if (loadMoreBtn) {
      if (state.displayLimit < state.filteredProducts.length) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent = `Carregar mais garimpos (${state.filteredProducts.length - state.displayLimit} restantes)`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    // Attach card event listeners (Quick view & WA buttons)
    attachCardListeners();
  }

  // HTML Template for Product Card
  function createProductCard(product) {
    const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const waUrl = buildWhatsAppUrl(product);

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-img-wrapper" data-action="quickview" data-id="${product.id}">
          ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
          <img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.src='${product.originalImage}'" />
          <button class="card-quickview-btn" aria-label="Visualizar Garimpo" title="Ver Detalhes">
            <i class="fas fa-eye"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-category">${product.category}</span>
            <span class="card-size">Tam: ${product.size}</span>
          </div>
          <h3 class="card-title" title="${product.title}">${product.title}</h3>
          <p class="card-condition">✨ ${product.condition}</p>
          <div class="card-footer-row">
            <span class="card-price">${formattedPrice}</span>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-buy-wa" title="Tenho Interesse no WhatsApp">
              <i class="fab fa-whatsapp"></i> Tenho Interesse
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // Attach Listeners to Rendered Cards
  function attachCardListeners() {
    document.querySelectorAll('[data-action="quickview"]').forEach(item => {
      item.addEventListener('click', (e) => {
        const id = item.dataset.id;
        const product = state.products.find(p => p.id === id);
        if (product) openQuickModal(product);
      });
    });
  }

  // Generate Pre-filled WhatsApp URL
  function buildWhatsAppUrl(product) {
    const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const message = `Olá! Vi no site do Brechó Desapego Express o item "${product.title}" (Tamanho ${product.size}, por ${formattedPrice}) e gostaria de saber se ainda está disponível para compra!`;
    return `https://wa.me/${state.whatsappPhone}?text=${encodeURIComponent(message)}`;
  }

  // Quick View Modal Logic
  function openQuickModal(product) {
    const formattedPrice = product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    modalImg.src = product.image;
    modalImg.alt = product.title;
    modalTitle.textContent = product.title;
    modalPrice.textContent = formattedPrice;
    modalCategory.textContent = `Categoria: ${product.category}`;
    modalSize.textContent = `Tamanho: ${product.size}`;
    modalCondition.textContent = `Estado: ${product.condition}`;
    modalDesc.textContent = product.description;
    
    modalWaBtn.href = buildWhatsAppUrl(product);
    
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Active Filter Chips Display
  function renderActiveTags() {
    if (!activeTagsContainer) return;
    const tags = [];

    if (state.activeCategory !== 'Todas') {
      tags.push({ label: `Cat: ${state.activeCategory}`, type: 'category' });
    }
    if (state.activeSize !== 'Todos') {
      tags.push({ label: `Tam: ${state.activeSize}`, type: 'size' });
    }
    if (state.maxPrice < 50) {
      tags.push({ label: `Até R$ ${state.maxPrice},00`, type: 'price' });
    }
    if (state.searchQuery.trim() !== '') {
      tags.push({ label: `Busca: "${state.searchQuery}"`, type: 'search' });
    }

    activeTagsContainer.innerHTML = tags.map(t => `
      <span class="active-tag">
        ${t.label}
        <button data-remove-tag="${t.type}">&times;</button>
      </span>
    `).join('');

    // Remove tag listeners
    activeTagsContainer.querySelectorAll('[data-remove-tag]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.removeTag;
        if (type === 'category') setActiveCategory('Todas');
        if (type === 'size') setActiveSize('Todos');
        if (type === 'price') setMaxPrice(50);
        if (type === 'search') {
          state.searchQuery = '';
          if (searchInput) searchInput.value = '';
          applyFilters();
        }
      });
    });
  }

  // Set Active Category
  function setActiveCategory(catName) {
    state.activeCategory = catName;
    state.displayLimit = 16;
    categoryBtns.forEach(btn => {
      if (btn.dataset.category === catName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    applyFilters();
  }

  // Set Active Size
  function setActiveSize(sizeVal) {
    state.activeSize = sizeVal;
    state.displayLimit = 16;
    sizeBtns.forEach(btn => {
      if (btn.dataset.size === sizeVal) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    applyFilters();
  }

  // Set Max Price
  function setMaxPrice(val) {
    state.maxPrice = Number(val);
    state.displayLimit = 16;
    if (priceSlider) priceSlider.value = val;
    if (maxPriceDisplay) maxPriceDisplay.textContent = `R$ ${val},00`;
    applyFilters();
  }

  // Reset All Filters
  function resetAllFilters() {
    state.activeCategory = 'Todas';
    state.activeSize = 'Todos';
    state.maxPrice = 50;
    state.searchQuery = '';
    state.sortBy = 'default';
    state.displayLimit = 16;

    if (searchInput) searchInput.value = '';
    if (priceSlider) priceSlider.value = 50;
    if (maxPriceDisplay) maxPriceDisplay.textContent = 'R$ 50,00';
    if (sortSelect) sortSelect.value = 'default';

    categoryBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.category === 'Todas'));
    sizeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.size === 'Todos'));

    applyFilters();
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Search Bar Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        state.displayLimit = 16;
        applyFilters();
      });
    }

    // Category Buttons
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => setActiveCategory(btn.dataset.category));
    });

    // Size Buttons
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => setActiveSize(btn.dataset.size));
    });

    // Price Slider
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => setMaxPrice(e.target.value));
    }

    // Sort Dropdown
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilters();
      });
    }

    // Reset Filters Button
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', resetAllFilters);
    }

    // Load More Button
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        state.displayLimit += 16;
        renderCatalog();
      });
    }

    // Modal Close
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    // Escape Key Modal Close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });

    // Mobile Navigation Toggle
    if (mobileToggle && mainNav) {
      mobileToggle.addEventListener('click', () => {
        mainNav.classList.toggle('mobile-active');
      });
    }
  }
});
