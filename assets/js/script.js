/* ==========================================================================
   JAVASCRIPT: HOTEL SIDAMBARAM LANDING PAGE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------------------------
  // 1. SELECTORS & DOM ELEMENTS
  // ----------------------------------------------------------------------
  const preloader = document.getElementById('preloader');
  const header = document.getElementById('main-header');
  const offerBar = document.getElementById('openingOfferBar');
  const offerBarCloseBtn = document.getElementById('offerBarClose');
  const dots = document.querySelectorAll('.dot-btn');
  const hamburger = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('navigation-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const parallaxElements = document.querySelectorAll('.floating-element');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.querySelector('.cart-count');
  const orderButtons = document.querySelectorAll('.pulse-btn');
  const dashedCircle = document.querySelector('.dashed-circle');
  const centerImages = document.querySelectorAll('.food-disk .sliding-img');
  const currentYearEl = document.getElementById('current-year');

  // Set Dynamic Year
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // ----------------------------------------------------------------------
  // 1.5. OPENING OFFER ANNOUNCEMENT BAR (STICKY TOP)
  // ----------------------------------------------------------------------
  if (offerBar) {
    const OFFER_BAR_DISMISS_KEY = 'sidambaramOfferBarDismissed';

    function applyOfferBarOffset() {
      const barHeight = offerBar.classList.contains('is-closed') ? 0 : offerBar.offsetHeight;
      document.documentElement.style.setProperty('--offer-bar-height', `${barHeight}px`);
      if (header) header.style.top = `${barHeight}px`;
      document.body.style.paddingTop = `${barHeight}px`;
    }

    if (sessionStorage.getItem(OFFER_BAR_DISMISS_KEY) === '1') {
      offerBar.classList.add('is-closed');
      offerBar.style.display = 'none';
    }

    applyOfferBarOffset();
    window.addEventListener('resize', applyOfferBarOffset);

    if (offerBarCloseBtn) {
      offerBarCloseBtn.addEventListener('click', () => {
        offerBar.classList.add('is-closed');
        sessionStorage.setItem(OFFER_BAR_DISMISS_KEY, '1');
        applyOfferBarOffset();
        setTimeout(() => {
          offerBar.style.display = 'none';
        }, 350);
      });
    }
  }

  // Slider State Variables
  let currentSlide = 0;
  let isTransitioning = false;
  const transitionDelay = 1000; // Cooldown duration matching CSS transitions (1000ms)

  // ----------------------------------------------------------------------
  // 2. WINDOW LOADED / PRELOADER FADE-OUT
  // ----------------------------------------------------------------------
  window.addEventListener('load', () => {
    if (preloader) {
      // Delay slightly for visual comfort
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 600);
    }

    // ----------------------------------------------------------------------
    // 2.1. AOS INITIALIZATION
    // ----------------------------------------------------------------------
    if (typeof AOS !== 'undefined') {
      AOS.init({
        once: true, // Whether animation should happen only once - while scrolling down
        offset: 50, // Offset (in px) from the original trigger point
      });
    }
  });

  // ----------------------------------------------------------------------
  // 2.5. SMOOTH SCROLL INITIALIZATION (LENIS)
  // ----------------------------------------------------------------------
  let locoScroll;
  if (typeof Lenis !== 'undefined') {
    locoScroll = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      prevent: (node) => false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      locoScroll.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  // ----------------------------------------------------------------------
  // 3. SLIDER TRANSITION ENGINE (AUTO-SLIDE)
  // ----------------------------------------------------------------------

  // Set initial active state
  if (centerImages.length > 0) {
    centerImages[0].classList.add('active');
  }

  /**
   * Changes the current slide to the target index
   * @param {number} nextIndex - The index of the slide to display
   */
  function goToSlide(nextIndex) {
    if (isTransitioning || centerImages.length === 0 || nextIndex === currentSlide) return;

    isTransitioning = true;

    // Update active class for center images to fade them in/out
    centerImages.forEach((img, idx) => {
      if (idx === nextIndex) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });

    // Rotate the dashed circle via CSS custom property based on total items
    const rotationAngle = nextIndex * -(360 / centerImages.length);

    if (dashedCircle) {
      dashedCircle.style.setProperty('--rot', `${rotationAngle}deg`);
    }

    // Update state
    currentSlide = nextIndex;

    // Release scroll lock after CSS animations complete
    setTimeout(() => {
      isTransitioning = false;
    }, transitionDelay);
  }

  // Go to Next Slide
  function nextSlide() {
    if (centerImages.length === 0) return;
    let nextIndex = currentSlide + 1;
    if (nextIndex >= centerImages.length) {
      nextIndex = 0;
    }
    goToSlide(nextIndex);
  }

  // Go to Previous Slide
  function prevSlide() {
    if (centerImages.length === 0) return;
    let nextIndex = currentSlide - 1;
    if (nextIndex < 0) {
      nextIndex = centerImages.length - 1;
    }
    goToSlide(nextIndex);
  }

  // Start Automatic Slide
  setInterval(() => {
    if (!isTransitioning && centerImages.length > 0) {
      nextSlide();
    }
  }, 3000); // Change image every 3 seconds

  // ----------------------------------------------------------------------
  // 7. PAGINATION DOTS NAVIGATION
  // ----------------------------------------------------------------------
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.getAttribute('data-index'));
      const direction = targetIndex > currentSlide ? 'next' : 'prev';
      goToSlide(targetIndex, direction);
    });
  });

  // ----------------------------------------------------------------------
  // 8. 3D MOUSE PARALLAX EFFECT
  // ----------------------------------------------------------------------
  window.addEventListener('mousemove', (e) => {
    // Skip computations on mobile screens to save resource usage
    if (window.innerWidth <= 1024) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate normal offsets (-1 to 1)
    const offsetX = (centerX - clientX) / centerX;
    const offsetY = (centerY - clientY) / centerY;

    // 1. Move Background Floating Ingredients
    parallaxElements.forEach((item) => {
      const speed = parseFloat(item.getAttribute('data-speed')) || 2;
      const xMove = offsetX * speed * 25;
      const yMove = offsetY * speed * 25;
      item.style.transform = `translate3d(${xMove}px, ${yMove}px, 0)`;
    });

    // 2. Move Active Plate Container Disk for advanced depth
    const activeDisk = document.querySelector('.slide.active .food-disk-wrapper');
    if (activeDisk) {
      const plateX = offsetX * 20; // Maximum 20px displacement
      const plateY = offsetY * 20;
      activeDisk.style.transform = `translate3d(${plateX}px, ${plateY}px, 0)`;
    }
  });

  // ----------------------------------------------------------------------
  // 9. STICKY NAV BACKGROUND SHADOW ON SCROLL
  // ----------------------------------------------------------------------
  let lastScrollY = 0;

  function handleHeaderScroll(currentY) {
    // Sticky shadow on scroll
    if (currentY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Auto-hide header logic (hide on scroll down, show on scroll up)
    if (currentY > lastScrollY && currentY > 100 && !navMenu.classList.contains('active')) {
      header.classList.add('hidden'); // Scrolling down
    } else {
      header.classList.remove('hidden'); // Scrolling up or at top
    }
    lastScrollY = currentY <= 0 ? 0 : currentY; // Update last scroll, floor at 0 for mobile bounce
  }

  if (locoScroll) {
    locoScroll.on('scroll', (args) => {
      // Lenis returns `scroll` as a number; Locomotive returns an object with `y`. We safely handle both.
      const currentY = typeof args.scroll === 'number' ? args.scroll : args.scroll?.y || 0;
      handleHeaderScroll(currentY);
    });
  } else {
    window.addEventListener('scroll', () => {
      handleHeaderScroll(window.scrollY);
    });
  }

  // ----------------------------------------------------------------------
  // 9.5. SCROLL-DRIVEN MARQUEE ANIMATION
  // ----------------------------------------------------------------------
  const marqueeStrip = document.querySelector('.marquee-strip');
  const marqueeInner = document.querySelector('.marquee-inner');
  const marqueeTracks = document.querySelectorAll('.marquee-track');

  if (marqueeStrip && marqueeInner && marqueeTracks.length) {
    let marqueeTrackWidth = 0;
    let marqueeOffset = 0;
    let marqueeLastY = window.scrollY;

    function measureMarqueeTrack() {
      marqueeTrackWidth = marqueeTracks[0].getBoundingClientRect().width;
    }
    measureMarqueeTrack();
    window.addEventListener('resize', measureMarqueeTrack);

    function updateMarquee(currentY) {
      const delta = currentY - marqueeLastY;
      marqueeLastY = currentY;

      // Position: moves forward on scroll-down, reverses on scroll-up, loops seamlessly
      if (marqueeTrackWidth > 0) {
        marqueeOffset = (marqueeOffset + delta * 0.6) % marqueeTrackWidth;
        if (marqueeOffset > 0) marqueeOffset -= marqueeTrackWidth;
        marqueeInner.style.transform = `translate3d(${marqueeOffset}px, 0, 0)`;
      }

      // Size & spacing: eases up as the strip crosses the viewport, eases down at the edges
      const rect = marqueeStrip.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalTransit = viewportHeight + rect.height;
      let progress = (viewportHeight - rect.top) / totalTransit;
      progress = Math.max(0, Math.min(1, progress));
      const eased = 1 - Math.abs(progress - 0.5) * 2; // 0 at edges, 1 at center

      const responsiveBoost = window.innerWidth <= 768 ? 0.08 : window.innerWidth <= 1024 ? 0.1 : 0.12;
      const scale = 0.88 + eased * responsiveBoost;
      const gapRem = 1.2 + eased * 0.6;
      const padRem = 1.1 + eased * 0.6;

      marqueeStrip.style.setProperty('--marquee-scale', scale.toFixed(3));
      marqueeStrip.style.setProperty('--marquee-gap', `${gapRem.toFixed(2)}rem`);
      marqueeStrip.style.setProperty('--marquee-pad-y', `${padRem.toFixed(2)}rem`);
    }

    if (locoScroll) {
      locoScroll.on('scroll', (args) => {
        const currentY = typeof args.scroll === 'number' ? args.scroll : args.scroll?.y || 0;
        updateMarquee(currentY);
      });
    } else {
      window.addEventListener('scroll', () => updateMarquee(window.scrollY));
    }

    updateMarquee(window.scrollY);
  }

  // ----------------------------------------------------------------------
  // 10. MOBILE HAMBURGER MENU DRAWER
  // ----------------------------------------------------------------------
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    });
  });

  // Close mobile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    }
  });

  // Global Smooth Scroll logic for ALL anchor links (Nav + CTA)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);

        if (targetEl) {
          e.preventDefault(); // Stop standard instant jump

          if (locoScroll) {
            locoScroll.scrollTo(targetEl);
          } else {
            // Native JS smooth scroll with header offset (Fallback)
            const headerOffset = 100;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            // --- CUSTOMIZABLE SMOOTH SCROLL FALLBACK ---
            // You can change the duration (in milliseconds) to make the scroll faster or slower.
            const scrollDuration = 800; // e.g., 1000ms = 1 second
            const startPosition = window.scrollY;
            const distance = offsetPosition - startPosition;
            let startTime = null;

            const easeInOutQuad = (t, b, c, d) => {
              t /= d / 2;
              if (t < 1) return (c / 2) * t * t + b;
              t--;
              return (-c / 2) * (t * (t - 2) - 1) + b;
            };

            const animation = (currentTime) => {
              if (startTime === null) startTime = currentTime;
              const timeElapsed = currentTime - startTime;
              window.scrollTo(0, easeInOutQuad(timeElapsed, startPosition, distance, scrollDuration));
              if (timeElapsed < scrollDuration) requestAnimationFrame(animation);
            };

            requestAnimationFrame(animation);
          }
        }
      }
    });
  });

  // ----------------------------------------------------------------------
  // 11. DYNAMIC CART ACTIONS & PREMIUM TOAST NOTIFIER
  // ----------------------------------------------------------------------

  /**
   * Dynamic indicator toast notification
   */
  function showToast(message, color = '#10b981') {
    // Check if toast container exists, if not create one
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';

      // Inline stylesheet for basic toast layout to preserve modular files
      const style = document.createElement('style');
      style.textContent = `
                .toast-container {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    z-index: 9999;
                    pointer-events: none;
                }
                .toast {
                    background: var(--color-bg-primary, #ffffff);
                    color: var(--color-text-primary, #0f172a);
                    padding: 1.5rem 2.5rem;
                    border-radius: 8px;
                    font-size: 1.4rem;
                    font-weight: 500;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                    border: 1px solid rgba(15, 23, 42, 0.05);
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                    transform: translateY(50px);
                    opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
                    border-left: 4px solid var(--toast-color, #10b981);
                    pointer-events: auto;
                }
                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
      document.head.appendChild(style);
      document.body.appendChild(toastContainer);
    }

    // Create individual toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.setProperty('--toast-color', color);
    toast.innerHTML = `<i class="bi bi-check-circle-fill" style="color: ${color}"></i> ${message}`;

    toastContainer.appendChild(toast);

    // Trigger reflow & slide-in animation
    setTimeout(() => toast.classList.add('show'), 50);

    // Remove toast after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // Add cart pulse style rule directly
  const cartStyle = document.createElement('style');
  cartStyle.textContent = `
        @keyframes pulseCart {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .action-btn.cart-btn.pulse {
            animation: pulseCart 0.5s ease;
            background-color: var(--color-accent);
            color: var(--color-white);
        }
    `;
  document.head.appendChild(cartStyle);

  // ----------------------------------------------------------------------
  // 11B. SHOPPING CART STATE (persisted across index.html <-> food-order-details.html)
  // ----------------------------------------------------------------------
  const CART_STORAGE_KEY = 'sidambaramCartState';
  const COUPONS = { SIDA10: 10 };

  function loadCartState() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
      return {
        cart: Array.isArray(saved.cart) ? saved.cart : [],
        discountPercent: typeof saved.discountPercent === 'number' ? saved.discountPercent : 0,
      };
    } catch (err) {
      return { cart: [], discountPercent: 0 };
    }
  }

  function saveCartState() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ cart, discountPercent }));
  }

  const savedCartState = loadCartState();
  let cart = savedCartState.cart; // { id, title, price, image, qty }
  let discountPercent = savedCartState.discountPercent;

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.textContent = totalQty;
  }

  function addItemToCart(item, qty = 1) {
    const id = item.title;
    const existing = cart.find((c) => c.id === id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id, title: item.title, price: Number(item.price) || 0, image: item.image || '', qty });
    }

    updateCartBadge();
    saveCartState();

    if (cartBtn) {
      cartBtn.classList.add('pulse');
      setTimeout(() => cartBtn.classList.remove('pulse'), 500);
    }

    showToast(`Added ${item.title} to cart!`, '#ffbe0e');
  }

  updateCartBadge();

  // Menu card "Add to Cart" click -> add directly to the cart
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pulse-btn') || e.target.closest('.add-to-cart-btn');
    if (!btn) return;

    const href = btn.getAttribute('href');
    if (href && href.startsWith('#')) {
      if (href === '#order') {
        return; // Allow standard scroll navigation
      }
    }

    e.preventDefault();
    e.stopPropagation();

    const title = btn.getAttribute('data-title');
    const price = btn.getAttribute('data-price');
    const image = btn.getAttribute('data-image');

    if (title && price) {
      addItemToCart({ title, price, image });
    }
  });

  // Bind Cart button click -> go to the checkout/order summary page
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'food-order-details.html';
    });
  }

  // Search buttons are handled by the Advanced Dish Search modal (section 15).

  // ----------------------------------------------------------------------
  // 12. POPULAR MENU FILTER & SCROLL ANIMATIONS
  // ----------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('menu-header') || entry.target.classList.contains('menu-filters') || entry.target.classList.contains('menu-action') || entry.target.classList.contains('menu-card')) {
          entry.target.classList.add('animate-in');
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.menu-action');
  animateElements.forEach((el) => observer.observe(el));

  const menuCardsContainer = document.querySelector('.menu-cards');
  if (menuCardsContainer) {
    fetch('filter-food.json')
      .then((response) => response.json())
      .then((data) => {
        menuCardsContainer.innerHTML = '';
        data.forEach((item) => {
          const cardHTML = `
            <div class="menu-card" data-category="${item.category}">
              <div class="card-img-container">
                <div class="card-glow"></div>
                <img src="${item.image}" alt="${item.alt}" class="card-img" width="500" height="500" loading="lazy" />
              </div>
              <h3 class="card-title">${item.title}</h3>
              <p class="card-desc">${item.description}</p>
              <div class="card-footer">
                <button class="add-to-cart-btn" data-title="${item.title}" data-price="${item.price}" data-image="${item.image}" aria-label="Add to cart">
                  <i class="bi bi-cart-plus-fill"></i>
                </button>
              </div>
            </div>
          `;
          menuCardsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        const menuCardsList = document.querySelectorAll('.menu-card');

        // Apply initial filter based on the active button
        const initialActiveBtn = document.querySelector('.filter-btn.active');
        if (initialActiveBtn) {
          const initialFilterValue = initialActiveBtn.getAttribute('data-filter');
          menuCardsList.forEach((card) => {
            if (initialFilterValue === 'all' || card.getAttribute('data-category') === initialFilterValue) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }

        filterBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) activeBtn.classList.remove('active');
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            menuCardsList.forEach((card) => {
              if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
              } else {
                card.style.display = 'none';
              }
            });
          });
        });

        menuCardsList.forEach((el) => observer.observe(el));
      })
      .catch((error) => console.error('Error fetching menu cards:', error));
  }

  // ----------------------------------------------------------------------
  // 14. SCROLLSPY ACTIVE LINK UPDATER
  // ----------------------------------------------------------------------
  const scrollSpySections = document.querySelectorAll('main[id], section[id]');
  const scrollSpyOptions = {
    root: null,
    rootMargin: '-40% 0px -60% 0px', // Detects the section when it enters the upper middle of the viewport
    threshold: 0,
  };

  const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, scrollSpyOptions);

  scrollSpySections.forEach((section) => scrollSpyObserver.observe(section));

  // ----------------------------------------------------------------------
  // 15. LOCATIONS MAP (LEAFLET / OPENSTREETMAP)
  // ----------------------------------------------------------------------
  const locationsMapEl = document.getElementById('locations-map');

  if (locationsMapEl) {
    const initLocationsMap = () => {
    const branches = [
      { lat: 11.9215459, lng: 79.8268495, name: 'Hotel Sidambaram — Uppalam', mapsUrl: 'https://maps.app.goo.gl/czDDMJssp7rnr7Lx5' },
      { lat: 11.9296506, lng: 79.8282011, name: 'Hotel Sidambaram — M.G. Road', mapsUrl: 'https://maps.app.goo.gl/Yhc3BzVS1DQyLz5y8' },
      { lat: 11.9351495, lng: 79.800506, name: 'Hotel Sidambaram — Reddiyarpalayam', mapsUrl: 'https://maps.app.goo.gl/Ghy1k5iLyyyU5yWw6' },
    ];

    const locationsMap = L.map(locationsMapEl, { scrollWheelZoom: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(locationsMap);

    const sidambaramIcon = L.icon({
      iconUrl: 'assets/img/location.webp',
      iconSize: [12, 16],
      iconAnchor: [10, 18],
      popupAnchor: [0, -28],
    });

    const markerBounds = [];

    branches.forEach((branch, idx) => {
      const marker = L.marker([branch.lat, branch.lng], { icon: sidambaramIcon }).addTo(locationsMap);
      marker.bindPopup(`<strong>${branch.name}</strong><br/><a href="${branch.mapsUrl}" target="_blank" rel="noopener">Get Directions</a>`);
      markerBounds.push([branch.lat, branch.lng]);
    });

    locationsMap.fitBounds(markerBounds, { padding: [40, 40] });
    };

    // Leaflet is not loaded up-front: fetch its CSS + JS only when the map
    // container approaches the viewport, then initialise the map.
    const loadLeaflet = () => {
      if (typeof L !== 'undefined' && typeof L.map === 'function') {
        initLocationsMap();
        return;
      }
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCss.crossOrigin = '';
      document.head.appendChild(leafletCss);

      const leafletJs = document.createElement('script');
      leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJs.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletJs.crossOrigin = '';
      leafletJs.onload = initLocationsMap;
      document.head.appendChild(leafletJs);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        (entries, obs) => {
          if (entries[0].isIntersecting) {
            loadLeaflet();
            obs.disconnect();
          }
        },
        { rootMargin: '600px' }
      ).observe(locationsMapEl);
    } else {
      loadLeaflet();
    }
  }

  // ----------------------------------------------------------------------
  // 16. CHECKOUT / ORDER SUMMARY PAGE (food-order-details.html)
  // ----------------------------------------------------------------------
  const orderItemsList = document.getElementById('orderItemsList');

  if (orderItemsList) {
    const orderEmptyState = document.getElementById('orderEmptyState');
    const orderSubtotalEl = document.getElementById('orderSubtotal');
    const orderDiscountRow = document.getElementById('orderDiscountRow');
    const orderDiscountEl = document.getElementById('orderDiscount');
    const orderTotalEl = document.getElementById('orderTotal');
    const orderCouponInput = document.getElementById('orderCouponInput');
    const orderApplyCouponBtn = document.getElementById('orderApplyCouponBtn');
    const orderCouponMsg = document.getElementById('orderCouponMsg');
    const orderCustomerName = document.getElementById('orderCustomerName');
    const orderCustomerAddress = document.getElementById('orderCustomerAddress');
    const orderWhatsappBtn = document.getElementById('orderWhatsappBtn');

    function renderOrderPage() {
      updateCartBadge();

      if (cart.length === 0) {
        orderItemsList.innerHTML = '';
        if (orderEmptyState) orderEmptyState.style.display = 'block';
      } else {
        if (orderEmptyState) orderEmptyState.style.display = 'none';
        orderItemsList.innerHTML = cart
          .map(
            (item) => `
            <div class="order-item-row" data-id="${item.id}">
              <img src="${item.image}" alt="${item.title}" class="order-item-img" />
              <div class="order-item-info">
                <h4 class="order-item-title">${item.title}</h4>
              </div>
              <div class="order-item-qty">
                <button class="qty-btn qty-decrease" aria-label="Decrease quantity"><i class="bi bi-dash"></i></button>
                <input type="number" class="qty-input qty-value" value="${item.qty}" min="1" aria-label="Quantity" />
                <button class="qty-btn qty-increase" aria-label="Increase quantity"><i class="bi bi-plus"></i></button>
              </div>
              <button class="order-item-remove" aria-label="Remove item"><i class="bi bi-trash3"></i></button>
            </div>
          `
          )
          .join('');
      }

      const subtotal = getSubtotal();
      let appliedPct = 0;
      if (discountPercent > 0) {
        if (subtotal >= 100 && subtotal <= 500) {
          appliedPct = 10;
        } else if (subtotal >= 501 && subtotal <= 1000) {
          appliedPct = 8;
        } else if (subtotal >= 1001 && subtotal <= 1500) {
          appliedPct = 6;
        } else if (subtotal >= 1501 && subtotal <= 10000) {
          appliedPct = 5;
        } else if (subtotal >= 10001) {
          appliedPct = 3;
        }
      }
      const discountAmount = Math.round((subtotal * appliedPct) / 100);
      const total = subtotal - discountAmount;

      if (orderSubtotalEl) orderSubtotalEl.textContent = `₹${subtotal}`;
      if (orderDiscountRow && orderDiscountEl) {
        if (discountAmount > 0) {
          orderDiscountRow.style.display = 'flex';
          orderDiscountEl.textContent = `-₹${discountAmount}`;
        } else {
          orderDiscountRow.style.display = 'none';
        }
      }
      if (orderTotalEl) orderTotalEl.textContent = `₹${total}`;

      if (orderCouponInput && !orderCouponInput.value && discountPercent > 0) {
        orderCouponInput.value = 'SIDA10';
      }

      if (orderCouponMsg && discountPercent > 0) {
        if (cart.length === 0) {
          orderCouponMsg.textContent = '';
          orderCouponMsg.className = 'order-coupon-msg';
        } else {
          const code = (orderCouponInput && orderCouponInput.value.trim().toUpperCase()) || 'SIDA10';
          orderCouponMsg.textContent = `Coupon "${code}" applied! Opening offer discount (5%–10%) will be applied to your order.`;
          orderCouponMsg.className = 'order-coupon-msg success';
        }
      }

      const promoBtn = document.getElementById('promoApplyCouponBtn');
      if (promoBtn) {
        if (discountPercent > 0) {
          promoBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Already Applied';
          promoBtn.classList.add('applied');
          promoBtn.disabled = true;
        } else {
          promoBtn.innerHTML = 'Apply Coupon <i class="bi bi-arrow-right"></i>';
          promoBtn.classList.remove('applied');
          promoBtn.disabled = false;
        }
      }

      saveCartState();
    }

    orderItemsList.addEventListener('click', (e) => {
      const row = e.target.closest('.order-item-row');
      if (!row) return;
      const id = row.getAttribute('data-id');
      const entry = cart.find((c) => c.id === id);
      if (!entry) return;

      if (e.target.closest('.qty-increase')) {
        entry.qty++;
        renderOrderPage();
      } else if (e.target.closest('.qty-decrease')) {
        entry.qty--;
        if (entry.qty <= 0) cart = cart.filter((c) => c.id !== id);
        renderOrderPage();
      } else if (e.target.closest('.order-item-remove')) {
        cart = cart.filter((c) => c.id !== id);
        renderOrderPage();
      }
    });

    orderItemsList.addEventListener('change', (e) => {
      if (e.target.classList.contains('qty-input')) {
        const row = e.target.closest('.order-item-row');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const entry = cart.find((c) => c.id === id);
        if (!entry) return;

        let newQty = parseInt(e.target.value, 10);
        if (isNaN(newQty) || newQty < 1) {
          newQty = 1;
        }
        entry.qty = newQty;
        renderOrderPage();
      }
    });

    function applyCouponCode(code) {
      if (COUPONS[code]) {
        discountPercent = COUPONS[code];
      } else {
        discountPercent = 0;
        if (orderCouponMsg) {
          orderCouponMsg.textContent = 'Invalid coupon code.';
          orderCouponMsg.className = 'order-coupon-msg error';
        }
      }
      renderOrderPage();
    }

    if (orderApplyCouponBtn) {
      orderApplyCouponBtn.addEventListener('click', () => {
        const code = orderCouponInput.value.trim().toUpperCase();

        if (!code) {
          orderCouponMsg.textContent = 'Please enter a coupon code.';
          orderCouponMsg.className = 'order-coupon-msg error';
          return;
        }

        applyCouponCode(code);
      });
    }

    // Promo ticket "Apply" button (Opening Discount banner)
    const promoApplyCouponBtn = document.getElementById('promoApplyCouponBtn');
    if (promoApplyCouponBtn) {
      promoApplyCouponBtn.addEventListener('click', () => {
        if (discountPercent > 0) return;
        const promoCode = 'SIDA10';
        if (orderCouponInput) orderCouponInput.value = promoCode;
        applyCouponCode(promoCode);
      });
    }

    if (orderWhatsappBtn) {
      orderWhatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          showToast('Your cart is empty. Add some dishes first!', '#ffbe0e');
          return;
        }

        const name = orderCustomerName.value.trim();
        const address = orderCustomerAddress.value.trim();

        if (!name || !address) {
          showToast('Please enter your name and delivery address.', '#ffbe0e');
          return;
        }

        let message = `Hello, I want to place an order.\n\nCustomer Name: ${name}\nAddress: ${address}\n\nOrder Details:\n\n`;

        cart.forEach((item) => {
          message += `${item.title} x ${item.qty}\n`;
        });

        if (discountPercent > 0) {
          message += `\nOpening Offer: Coupon SIDA10 applied — please apply the launch discount (5%–10% off).`;
        }

        window.open(`https://wa.me/917418790909?text=${encodeURIComponent(message)}`, '_blank');
      });
    }

    // ----------------------------------------------------------------------
    // 16B. ADDRESS LOCATION PICKER (LEAFLET / OPENSTREETMAP)
    // ----------------------------------------------------------------------
    const addressPickerMapEl = document.getElementById('addressPickerMap');

    if (addressPickerMapEl && typeof L !== 'undefined' && typeof L.map === 'function') {
      const addressSearchInput = document.getElementById('addressSearchInput');
      const addressSearchResults = document.getElementById('addressSearchResults');
      const addressLocateBtn = document.getElementById('addressLocateBtn');

      const PUDUCHERRY_COORDS = [11.9416, 79.8083];

      // Determine initial coordinates based on stored location selection
      const savedStateName = localStorage.getItem('sidambaramSelectedState') || 'Puducherry';
      let initialCoords = PUDUCHERRY_COORDS;

      const locationOpts = document.querySelectorAll('.location-option');
      locationOpts.forEach(opt => {
        if (opt.getAttribute('data-state') === savedStateName) {
          const lat = parseFloat(opt.getAttribute('data-lat'));
          const lon = parseFloat(opt.getAttribute('data-lon'));
          if (!isNaN(lat) && !isNaN(lon)) {
            initialCoords = [lat, lon];
          }
        }
      });

      const addressMap = L.map(addressPickerMapEl, { scrollWheelZoom: false }).setView(initialCoords, 13);

      // Google Maps style roadmap tiles
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
        maxZoom: 20,
      }).addTo(addressMap);

      // Custom Google Maps style red pin icon
      const googleMapsIcon = L.divIcon({
        html: `<svg viewBox="0 0 24 24" width="36" height="36" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.35)); display: block;">
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ea4335"/>
               </svg>`,
        className: 'custom-google-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const addressMarker = L.marker(initialCoords, {
        draggable: true,
        icon: googleMapsIcon,
      }).addTo(addressMap);

      // Listen for custom state selection event in the header
      document.addEventListener('stateChanged', (e) => {
        const { lat, lon } = e.detail;
        moveMarkerTo(lat, lon);
        setAddressFromCoords(lat, lon);
      });

      // Set initial address from coordinates if empty
      if (orderCustomerAddress && !orderCustomerAddress.value) {
        setAddressFromCoords(initialCoords[0], initialCoords[1]);
      }

      function setAddressFromCoords(lat, lon) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.display_name && orderCustomerAddress) {
              orderCustomerAddress.value = data.display_name;
            }
          })
          .catch((error) => console.error('Error reverse geocoding address:', error));
      }

      function moveMarkerTo(lat, lon) {
        addressMarker.setLatLng([lat, lon]);
        addressMap.setView([lat, lon], 16);
      }

      addressMarker.on('dragend', () => {
        const pos = addressMarker.getLatLng();
        setAddressFromCoords(pos.lat, pos.lng);
      });

      // Search-as-you-type (debounced) via Nominatim
      let addressSearchTimeout;
      if (addressSearchInput) {
        addressSearchInput.addEventListener('input', () => {
          clearTimeout(addressSearchTimeout);
          const query = addressSearchInput.value.trim();

          if (query.length < 3) {
            addressSearchResults.classList.remove('show');
            addressSearchResults.innerHTML = '';
            return;
          }

          addressSearchTimeout = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`)
              .then((response) => response.json())
              .then((results) => {
                if (!results || results.length === 0) {
                  addressSearchResults.innerHTML = '<li>No matches found</li>';
                  addressSearchResults.classList.add('show');
                  return;
                }

                addressSearchResults.innerHTML = results.map((place) => `<li data-lat="${place.lat}" data-lon="${place.lon}" data-name="${place.display_name.replace(/"/g, '&quot;')}">${place.display_name}</li>`).join('');
                addressSearchResults.classList.add('show');
              })
              .catch((error) => console.error('Error searching address:', error));
          }, 500);
        });
      }

      if (addressSearchResults) {
        addressSearchResults.addEventListener('click', (e) => {
          const li = e.target.closest('li[data-lat]');
          if (!li) return;

          const lat = parseFloat(li.getAttribute('data-lat'));
          const lon = parseFloat(li.getAttribute('data-lon'));

          moveMarkerTo(lat, lon);
          if (orderCustomerAddress) orderCustomerAddress.value = li.getAttribute('data-name');
          if (addressSearchInput) addressSearchInput.value = li.getAttribute('data-name');
          addressSearchResults.classList.remove('show');
          addressSearchResults.innerHTML = '';
        });
      }

      // Hide search results when clicking elsewhere
      document.addEventListener('click', (e) => {
        if (addressSearchResults && !e.target.closest('.address-picker')) {
          addressSearchResults.classList.remove('show');
        }
      });

      // "Use my current location" button
      if (addressLocateBtn) {
        addressLocateBtn.addEventListener('click', () => {
          if (!navigator.geolocation) {
            showToast('Location access is not supported on this browser.', '#ffbe0e');
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              moveMarkerTo(latitude, longitude);
              setAddressFromCoords(latitude, longitude);
            },
            () => {
              showToast('Could not access your location. Please search or drag the pin instead.', '#ffbe0e');
            }
          );
        });
      }
    }

    renderOrderPage();
  }

  // ----------------------------------------------------------------------
  // 17. LOCATION SETUP DROPDOWN LISTS
  // ----------------------------------------------------------------------
  const dropdownWrappers = document.querySelectorAll('.location-dropdown');

  dropdownWrappers.forEach(wrapper => {
    const btn = wrapper.querySelector('.location-btn');
    const menu = wrapper.querySelector('.location-menu');
    const stateText = wrapper.querySelector('.selected-state');
    const options = wrapper.querySelectorAll('.location-option');

    if (!btn || !menu) return;

    // Load from localStorage on initialization
    const savedState = localStorage.getItem('sidambaramSelectedState') || 'Puducherry';
    if (stateText) {
      stateText.textContent = savedState;
    }

    // Mark active option
    options.forEach(opt => {
      if (opt.getAttribute('data-state') === savedState) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    // Toggle menu
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns first
      dropdownWrappers.forEach(other => {
        if (other !== wrapper) {
          const otherMenu = other.querySelector('.location-menu');
          const otherBtn = other.querySelector('.location-btn');
          if (otherMenu) otherMenu.classList.remove('show');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('show');
    });

    // Handle option click
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const stateName = opt.getAttribute('data-state');
        const lat = parseFloat(opt.getAttribute('data-lat'));
        const lon = parseFloat(opt.getAttribute('data-lon'));

        // Save state
        localStorage.setItem('sidambaramSelectedState', stateName);

        // Update ALL selected-state texts and active options across both dropdowns
        dropdownWrappers.forEach(w => {
          const t = w.querySelector('.selected-state');
          if (t) t.textContent = stateName;
          const opts = w.querySelectorAll('.location-option');
          opts.forEach(o => {
            if (o.getAttribute('data-state') === stateName) {
              o.classList.add('active');
            } else {
              o.classList.remove('active');
            }
          });

          // Close menus
          const m = w.querySelector('.location-menu');
          const b = w.querySelector('.location-btn');
          if (m) m.classList.remove('show');
          if (b) b.setAttribute('aria-expanded', 'false');
        });

        // Show toast
        showToast(`Location set to ${stateName}`, '#ffbe0e');

        // Fire custom stateChanged event
        const event = new CustomEvent('stateChanged', { detail: { stateName, lat, lon } });
        document.dispatchEvent(event);
      });
    });
  });

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    dropdownWrappers.forEach(wrapper => {
      const menu = wrapper.querySelector('.location-menu');
      const btn = wrapper.querySelector('.location-btn');
      if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ----------------------------------------------------------------------
  // 14. BROWSE MENU PAGE (menu.html)
  // ----------------------------------------------------------------------
  const browseGrid = document.getElementById('browseProductGrid');
  if (browseGrid) {
    const categoryPillsEl = document.getElementById('browseCategoryPills');
    const categoryListEl = document.getElementById('browseCategoryList');
    const sortSelect = document.getElementById('browseSortSelect');
    const priceSelect = document.getElementById('browsePriceSelect');
    const clearBtn = document.getElementById('browseClearFiltersBtn');
    const emptyState = document.getElementById('browseEmptyState');
    const emptyClearBtn = document.getElementById('browseEmptyClearBtn');
    const resultsTitle = document.getElementById('browseResultsTitle');
    const resultsCount = document.getElementById('browseResultsCount');

    const CATEGORY_META = {
      all: { label: 'All Categories', icon: 'bi-grid-fill' },
      breakfast: { label: 'Breakfast', icon: 'bi-sunrise-fill' },
      lunch: { label: 'Lunch', icon: 'bi-egg-fried' },
      snacks: { label: 'Snacks', icon: 'bi-basket-fill' },
      dinner: { label: 'Dinner', icon: 'bi-moon-stars-fill' },
    };

    let allDishes = [];
    let activeCategory = 'all';

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function syncActiveCategory() {
      document.querySelectorAll('.browse-pill, .browse-cat-item').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === activeCategory);
      });
    }

    function buildCategoryList() {
      const counts = { all: allDishes.length };
      allDishes.forEach((d) => {
        counts[d.category] = (counts[d.category] || 0) + 1;
      });

      const cats = ['all', ...Object.keys(counts).filter((c) => c !== 'all')];

      const pillsHTML = cats
        .map((cat) => {
          const meta = CATEGORY_META[cat] || { label: cat, icon: 'bi-circle-fill' };
          const label = cat === 'all' ? 'All' : meta.label;
          return `<button type="button" class="browse-pill${cat === activeCategory ? ' active' : ''}" data-category="${cat}"><i class="bi ${meta.icon}"></i> ${label}</button>`;
        })
        .join('');

      const listHTML = cats
        .map((cat) => {
          const meta = CATEGORY_META[cat] || { label: cat, icon: 'bi-circle-fill' };
          return `
            <li>
              <button type="button" class="browse-cat-item${cat === activeCategory ? ' active' : ''}" data-category="${cat}">
                <span class="browse-cat-icon"><i class="bi ${meta.icon}"></i></span>
                <span class="browse-cat-label">${meta.label}</span>
                <span class="browse-cat-count">${counts[cat]}</span>
              </button>
            </li>`;
        })
        .join('');

      if (categoryPillsEl) categoryPillsEl.innerHTML = pillsHTML;
      if (categoryListEl) categoryListEl.innerHTML = listHTML;

      document.querySelectorAll('.browse-pill, .browse-cat-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeCategory = btn.getAttribute('data-category');
          syncActiveCategory();
          renderGrid();
        });
      });
    }

    function getFilteredSortedDishes() {
      let list = allDishes.slice();

      if (activeCategory !== 'all') {
        list = list.filter((d) => d.category === activeCategory);
      }

      const maxPrice = priceSelect ? priceSelect.value : 'all';
      if (maxPrice !== 'all') {
        list = list.filter((d) => Number(d.price) <= Number(maxPrice));
      }

      const sortValue = sortSelect ? sortSelect.value : 'recommended';
      if (sortValue === 'price-asc') {
        list.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sortValue === 'price-desc') {
        list.sort((a, b) => Number(b.price) - Number(a.price));
      } else if (sortValue === 'name-asc') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      }

      return list;
    }

    function renderGrid() {
      const list = getFilteredSortedDishes();
      const meta = CATEGORY_META[activeCategory] || { label: activeCategory };

      if (resultsTitle) resultsTitle.textContent = activeCategory === 'all' ? 'All Dishes' : meta.label;
      if (resultsCount) resultsCount.textContent = `${list.length} ${list.length === 1 ? 'dish' : 'dishes'}`;

      if (list.length === 0) {
        browseGrid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('d-none');
        return;
      }
      if (emptyState) emptyState.classList.add('d-none');

      browseGrid.innerHTML = list
        .map((item) => {
          const catMeta = CATEGORY_META[item.category] || { label: item.category };
          return `
            <article class="browse-product-card" data-category="${item.category}">
              <span class="browse-product-tag">${catMeta.label}</span>
              <button type="button" class="browse-wishlist-btn" aria-label="Save ${escapeHtml(item.title)}"><i class="bi bi-heart"></i></button>
              <div class="browse-product-img-wrap">
                <img src="${item.image}" alt="${escapeHtml(item.alt)}" width="500" height="500" loading="lazy" />
              </div>
              <div class="browse-product-body">
                <span class="browse-veg-dot" aria-hidden="true"></span>
                <h3 class="browse-product-title">${escapeHtml(item.title)}</h3>
                <p class="browse-product-desc">${escapeHtml(item.description)}</p>
                <div class="browse-product-footer">
                  <button type="button" class="add-to-cart-btn browse-add-btn" data-title="${escapeHtml(item.title)}" data-price="${item.price}" data-image="${item.image}" aria-label="Add ${escapeHtml(item.title)} to cart">
                    <i class="bi bi-plus-lg"></i> <span>Add</span>
                  </button>
                </div>
              </div>
            </article>`;
        })
        .join('');
    }

    // Wishlist toggle (visual only)
    browseGrid.addEventListener('click', (e) => {
      const wishBtn = e.target.closest('.browse-wishlist-btn');
      if (wishBtn) wishBtn.classList.toggle('active');
    });

    if (sortSelect) sortSelect.addEventListener('change', renderGrid);
    if (priceSelect) priceSelect.addEventListener('change', renderGrid);

    function clearFilters() {
      activeCategory = 'all';
      if (sortSelect) sortSelect.value = 'recommended';
      if (priceSelect) priceSelect.value = 'all';
      syncActiveCategory();
      renderGrid();
    }

    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (emptyClearBtn) emptyClearBtn.addEventListener('click', clearFilters);

    // Jump to a dish card in the grid (used by the advanced search modal)
    function jumpToDish(title) {
      activeCategory = 'all';
      if (priceSelect) priceSelect.value = 'all';
      syncActiveCategory();
      renderGrid();

      const card = Array.from(browseGrid.querySelectorAll('.browse-product-card')).find((c) => {
        const t = c.querySelector('.browse-product-title');
        return t && t.textContent.trim().toLowerCase() === String(title).trim().toLowerCase();
      });
      if (!card) return;

      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.remove('search-flash');
      void card.offsetWidth; // restart the flash animation
      card.classList.add('search-flash');
      setTimeout(() => card.classList.remove('search-flash'), 2000);
    }

    document.addEventListener('dishSearch:select', (e) => jumpToDish(e.detail.title));

    fetch('filter-food.json')
      .then((res) => res.json())
      .then((data) => {
        allDishes = data;
        buildCategoryList();
        renderGrid();

        // Deep link from another page: menu.html?dish=<title>
        const dishParam = new URLSearchParams(window.location.search).get('dish');
        if (dishParam) setTimeout(() => jumpToDish(dishParam), 250);
      })
      .catch(() => {
        browseGrid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('d-none');
      });

    // Promo carousel: auto-rotate + dot navigation
    const promoTrack = document.getElementById('browsePromoTrack');
    const promoDotsEl = document.getElementById('browsePromoDots');
    if (promoTrack && promoDotsEl) {
      const slides = promoTrack.querySelectorAll('.browse-promo-slide');
      let promoIndex = 0;
      let promoTimer;

      function goToPromoSlide(index) {
        promoIndex = (index + slides.length) % slides.length;
        promoTrack.style.transform = `translateX(-${promoIndex * 100}%)`;
        promoDotsEl.querySelectorAll('.browse-promo-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === promoIndex);
        });
      }

      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `browse-promo-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Show promo ${i + 1}`);
        dot.addEventListener('click', () => goToPromoSlide(i));
        promoDotsEl.appendChild(dot);
      });

      function startPromoAutoplay() {
        promoTimer = setInterval(() => goToPromoSlide(promoIndex + 1), 5000);
      }

      const promoCarousel = document.getElementById('browsePromoCarousel');
      if (promoCarousel) {
        promoCarousel.addEventListener('mouseenter', () => clearInterval(promoTimer));
        promoCarousel.addEventListener('mouseleave', startPromoAutoplay);
      }

      startPromoAutoplay();
    }
  }

  // ----------------------------------------------------------------------
  // 15. ADVANCED DISH SEARCH MODAL (Bootstrap + Algolia style)
  // ----------------------------------------------------------------------
  const dishSearchModalEl = document.getElementById('dishSearchModal');
  if (dishSearchModalEl && window.bootstrap) {
    const searchInput = document.getElementById('dishSearchInput');
    const resultsEl = document.getElementById('dishSearchResults');
    const clearQueryBtn = document.getElementById('dishSearchClearBtn');
    const dishModal = new bootstrap.Modal(dishSearchModalEl);
    const onMenuPage = !!document.getElementById('browseProductGrid');

    const RECENT_KEY = 'sidambaramRecentSearches';
    const SEARCH_CATEGORY_META = {
      breakfast: { label: 'Breakfast', icon: 'bi-sunrise-fill' },
      lunch: { label: 'Lunch', icon: 'bi-egg-fried' },
      snacks: { label: 'Snacks', icon: 'bi-basket-fill' },
      dinner: { label: 'Dinner', icon: 'bi-moon-stars-fill' },
    };

    let searchDishes = [];
    let dishesLoaded = false;
    let searchFetchStarted = false;
    let selectableItems = []; // flat list matching the DOM order of .dish-search-item
    let selectedIndex = -1;

    function escapeSearchHtml(str) {
      return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightMatch(text, query) {
      const safe = escapeSearchHtml(text);
      if (!query) return safe;
      const pattern = escapeRegex(escapeSearchHtml(query));
      return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
    }

    function getRecentSearches() {
      try {
        const list = JSON.parse(localStorage.getItem(RECENT_KEY));
        return Array.isArray(list) ? list : [];
      } catch (err) {
        return [];
      }
    }

    function saveRecentSearch(term) {
      const t = String(term).trim();
      if (!t) return;
      const list = getRecentSearches().filter((x) => x.toLowerCase() !== t.toLowerCase());
      list.unshift(t);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
    }

    function scoreDish(dish, q) {
      const title = dish.title.toLowerCase();
      if (title.startsWith(q)) return 4;
      if (title.includes(q)) return 3;
      if (dish.category.toLowerCase().includes(q)) return 2;
      if (dish.description.toLowerCase().includes(q)) return 1;
      return 0;
    }

    function dishItemHTML(dish, query) {
      const idx = selectableItems.length;
      selectableItems.push({ type: 'dish', dish });
      return `
        <div class="dish-search-item" role="option" data-idx="${idx}" aria-selected="false">
          <img class="dish-search-thumb" src="${dish.image}" alt="" loading="lazy" />
          <div class="dish-search-item-body">
            <div class="dish-search-item-title">${highlightMatch(dish.title, query)}</div>
            <div class="dish-search-item-desc">${highlightMatch(dish.description, query)}</div>
          </div>
          <div class="dish-search-item-meta">
            <button type="button" class="add-to-cart-btn dish-search-item-add" data-title="${escapeSearchHtml(dish.title)}" data-price="${escapeSearchHtml(dish.price)}" data-image="${dish.image}" aria-label="Add ${escapeSearchHtml(dish.title)} to cart"><i class="bi bi-plus-lg"></i></button>
            <i class="bi bi-arrow-return-left dish-search-item-enter" aria-hidden="true"></i>
          </div>
        </div>`;
    }

    function renderInitialState() {
      let html = '';
      const recents = getRecentSearches();

      if (recents.length) {
        html += `<div class="dish-search-section-title"><span><i class="bi bi-clock-history"></i> Recent searches</span><button type="button" class="dish-search-forget">Clear</button></div>`;
        recents.forEach((term) => {
          const idx = selectableItems.length;
          selectableItems.push({ type: 'recent', term });
          html += `
            <div class="dish-search-item" role="option" data-idx="${idx}" aria-selected="false">
              <span class="dish-search-thumb icon"><i class="bi bi-clock-history"></i></span>
              <div class="dish-search-item-body"><div class="dish-search-item-title">${escapeSearchHtml(term)}</div></div>
              <div class="dish-search-item-meta"><i class="bi bi-arrow-return-left dish-search-item-enter" aria-hidden="true"></i></div>
            </div>`;
        });
      }

      html += `<div class="dish-search-section-title"><span><i class="bi bi-stars"></i> Browse categories</span></div><div class="dish-search-chips">`;
      Object.keys(SEARCH_CATEGORY_META).forEach((cat) => {
        const meta = SEARCH_CATEGORY_META[cat];
        html += `<button type="button" class="dish-search-chip" data-chip="${meta.label}"><i class="bi ${meta.icon}"></i> ${meta.label}</button>`;
      });
      html += '</div>';

      html += `<div class="dish-search-section-title"><span><i class="bi bi-fire"></i> Popular dishes</span></div>`;
      searchDishes.slice(0, 4).forEach((dish) => {
        html += dishItemHTML(dish, '');
      });

      resultsEl.innerHTML = html;
    }

    function renderResults() {
      const query = searchInput.value.trim();
      selectableItems = [];
      selectedIndex = -1;

      if (!dishesLoaded) {
        resultsEl.innerHTML = '<div class="dish-search-empty"><i class="bi bi-arrow-repeat"></i><p>Loading our menu…</p></div>';
        return;
      }

      if (!query) {
        renderInitialState();
        return;
      }

      const q = query.toLowerCase();
      const matches = searchDishes
        .map((dish) => ({ dish, score: scoreDish(dish, q) }))
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score || a.dish.title.localeCompare(b.dish.title));

      if (matches.length === 0) {
        resultsEl.innerHTML = `
          <div class="dish-search-empty">
            <i class="bi bi-emoji-frown"></i>
            <p>No results for “${escapeSearchHtml(query)}”</p>
            <span>Try searching for “dosa”, “idli”, “paneer” or “meals”.</span>
          </div>`;
        return;
      }

      // Group results by category (Algolia-style sections)
      const groups = new Map();
      matches.forEach((m) => {
        if (!groups.has(m.dish.category)) groups.set(m.dish.category, []);
        groups.get(m.dish.category).push(m.dish);
      });

      let html = '';
      groups.forEach((dishes, cat) => {
        const meta = SEARCH_CATEGORY_META[cat] || { label: cat, icon: 'bi-circle-fill' };
        html += `<div class="dish-search-section-title"><span><i class="bi ${meta.icon}"></i> ${escapeSearchHtml(meta.label)}</span></div>`;
        dishes.forEach((dish) => {
          html += dishItemHTML(dish, query);
        });
      });

      resultsEl.innerHTML = html;
      setSelected(0);
    }

    function setSelected(idx) {
      const items = resultsEl.querySelectorAll('.dish-search-item');
      if (!items.length) {
        selectedIndex = -1;
        return;
      }
      selectedIndex = ((idx % items.length) + items.length) % items.length;
      items.forEach((el, i) => {
        el.classList.toggle('selected', i === selectedIndex);
        el.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
      });
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }

    function activateItem(idx) {
      const entry = selectableItems[idx];
      if (!entry) return;

      if (entry.type === 'recent') {
        searchInput.value = entry.term;
        clearQueryBtn.classList.remove('d-none');
        searchInput.focus();
        renderResults();
        return;
      }

      saveRecentSearch(searchInput.value.trim() || entry.dish.title);
      dishModal.hide();

      if (onMenuPage) {
        document.dispatchEvent(new CustomEvent('dishSearch:select', { detail: { title: entry.dish.title } }));
      } else {
        window.location.href = `menu.html?dish=${encodeURIComponent(entry.dish.title)}`;
      }
    }

    function openSearchModal() {
      dishModal.show();
      if (!searchFetchStarted) {
        searchFetchStarted = true;
        fetch('filter-food.json')
          .then((res) => res.json())
          .then((data) => {
            searchDishes = data;
            dishesLoaded = true;
            renderResults();
          })
          .catch(() => {
            searchFetchStarted = false;
            resultsEl.innerHTML = '<div class="dish-search-empty"><i class="bi bi-wifi-off"></i><p>Could not load the menu.</p><span>Please close and try again.</span></div>';
          });
      }
    }

    // Result interactions (click + hover)
    resultsEl.addEventListener('click', (e) => {
      const chip = e.target.closest('.dish-search-chip');
      if (chip) {
        searchInput.value = chip.getAttribute('data-chip');
        clearQueryBtn.classList.remove('d-none');
        searchInput.focus();
        renderResults();
        return;
      }
      if (e.target.closest('.dish-search-forget')) {
        localStorage.removeItem(RECENT_KEY);
        renderResults();
        return;
      }
      if (e.target.closest('.add-to-cart-btn')) return; // handled by the global cart listener
      const item = e.target.closest('.dish-search-item');
      if (item) activateItem(Number(item.getAttribute('data-idx')));
    });

    resultsEl.addEventListener('mousemove', (e) => {
      const item = e.target.closest('.dish-search-item');
      if (!item) return;
      const items = Array.from(resultsEl.querySelectorAll('.dish-search-item'));
      const i = items.indexOf(item);
      if (i !== -1 && i !== selectedIndex) setSelected(i);
    });

    // Live search + clear button
    searchInput.addEventListener('input', () => {
      clearQueryBtn.classList.toggle('d-none', !searchInput.value);
      renderResults();
    });

    clearQueryBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearQueryBtn.classList.add('d-none');
      searchInput.focus();
      renderResults();
    });

    // Keyboard navigation inside the modal
    dishSearchModalEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(selectedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(selectedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0) activateItem(selectedIndex);
      }
    });

    // Openers: header search icons + Ctrl/Cmd+K shortcut
    ['search-btn', 'browseSearchBtn'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          openSearchModal();
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      }
    });

    dishSearchModalEl.addEventListener('show.bs.modal', renderResults);
    dishSearchModalEl.addEventListener('shown.bs.modal', () => searchInput.focus());
  }
});
