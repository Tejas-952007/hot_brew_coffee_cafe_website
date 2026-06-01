// ===================================
// BREW HAVEN CAFÉ - INTERACTIVITY
// MySQL-Backed API Integration
// ===================================

// API base URL
const API_BASE = '/api';

// Helper: Make API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }
    return result;
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // RESTORE AUTH STATE FROM SESSION
    // ===================================
    apiRequest('/auth/me').then(result => {
        if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) loginBtn.textContent = result.user.name || 'Account';
            // Signal to the login handler that user is logged in
            window.__isLoggedIn = true;
            const dropdownName = document.getElementById('dropdown-user-name');
            if (dropdownName) dropdownName.querySelector('span').textContent = result.user.name || 'Account';
        }
    }).catch(() => {
        // Not logged in - that's fine
    });

    // ===================================
    // LOADING SCREEN
    // ===================================
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 1500);
    });

    // ===================================
    // SCROLL PROGRESS BAR
    // ===================================
    const scrollProgress = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    });

    // ===================================
    // NAVBAR FUNCTIONALITY
    // ===================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // Sticky navbar on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when link clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ===================================
    // DARK/LIGHT MODE TOGGLE
    // ===================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });

    // ===================================
    // TYPING TEXT EFFECT
    // ===================================
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const phrases = [
            'Fresh Coffee, Warm Moments',
            'Crafted with Passion',
            'Where Every Sip Tells a Story',
            'Your Perfect Cup Awaits'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function typeEffect() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                typingSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 500; // Pause before new phrase
            }

            setTimeout(typeEffect, typingSpeed);
        }

        typeEffect();
    }

    // ===================================
    // ANIMATED COUNTERS
    // ===================================
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    const animateCounters = function() {
        if (countersAnimated) return;
        
        const aboutSection = document.getElementById('about');
        const sectionPos = aboutSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight;

        if (sectionPos < screenPos) {
            countersAnimated = true;
            
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = counter.getAttribute('data-decimal') === 'true';
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const updateCounter = function() {
                    current += increment;
                    if (current < target) {
                        if (isDecimal) {
                            counter.textContent = current.toFixed(1);
                        } else {
                            counter.textContent = Math.floor(current).toLocaleString();
                        }
                        requestAnimationFrame(updateCounter);
                    } else {
                        if (isDecimal) {
                            counter.textContent = target.toFixed(1);
                        } else {
                            counter.textContent = target.toLocaleString();
                        }
                    }
                };

                updateCounter();
            });
        }
    };

    window.addEventListener('scroll', animateCounters);

    // ===================================
    // MENU FILTER & SEARCH
    // ===================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    const menuSearch = document.getElementById('menu-search');

    // Filter by category
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            menuCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Search menu items
    menuSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();

        menuCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.description').textContent.toLowerCase();

            if (name.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                }, 100);
            } else {
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });

    // ===================================
    // SHOPPING CART SYSTEM
    // ===================================
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.getElementById('close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.closest('.menu-card').querySelector('img').src;

            addToCart(name, price, image);
            showToast(`${name} added to cart!`);
        });
    });

    function addToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }

        updateCart();
        saveCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
        saveCart();
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            updateCart();
            saveCart();
        }
    }

    function updateCart() {
        // Update cart count badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update item count text
        const itemCountEl = document.getElementById('cart-item-count');
        if (itemCountEl) {
            itemCountEl.textContent = totalItems + (totalItems === 1 ? ' item' : ' items');
        }

        // Toggle empty state
        const emptyState = document.getElementById('cart-empty');
        const cartFooter = document.getElementById('cart-footer');
        
        // Update cart items display
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty-state">
                    <div class="cart-empty-icon"><i class="fas fa-shopping-bag"></i></div>
                    <h4>Your bag is empty</h4>
                    <p>Discover our handcrafted coffees and treats</p>
                </div>`;
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            if (cartFooter) cartFooter.style.display = 'block';
            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                cartItems.appendChild(cartItem);
            });
        }

        // Update totals
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = '$' + total.toFixed(2);
        
        const cartSubtotal = document.getElementById('cart-subtotal');
        if (cartSubtotal) cartSubtotal.textContent = '$' + total.toFixed(2);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Cart sidebar toggle
    cartBtn.addEventListener('click', function() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });

    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    cartOverlay.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    // ===================================
    // CHECKOUT SYSTEM
    // ===================================
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutForm = document.getElementById('checkout-form');

    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showToast('Your bag is empty!');
            return;
        }

        // Populate checkout summary
        checkoutItems.innerHTML = '';
        let total = 0;
        let totalQty = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            totalQty += item.quantity;

            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
                <span>${item.name} × ${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            checkoutItems.appendChild(checkoutItem);
        });

        checkoutTotal.textContent = '$' + total.toFixed(2);
        
        // Update new checkout elements
        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        const checkoutItemCount = document.getElementById('checkout-item-count');
        const placeOrderPrice = document.getElementById('place-order-price');
        
        if (checkoutSubtotal) checkoutSubtotal.textContent = '$' + total.toFixed(2);
        if (checkoutItemCount) checkoutItemCount.textContent = totalQty + (totalQty === 1 ? ' item' : ' items');
        if (placeOrderPrice) placeOrderPrice.textContent = '$' + total.toFixed(2);

        // Close cart sidebar
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');

        // Open checkout modal
        checkoutModal.classList.add('active');
    });

    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        const name = document.getElementById('checkout-name').value;
        const email = document.getElementById('checkout-email').value;
        const phone = document.getElementById('checkout-phone').value;
        const address = document.getElementById('checkout-address').value;

        if (!name || !email || !phone || !address) {
            showToast('Please fill in all fields');
            return;
        }

        // Prepare order items from cart
        const orderItems = cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            instructions: item.instructions || null
        }));

        try {
            // Submit order to MySQL via API
            const result = await apiRequest('/orders', 'POST', {
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                delivery_address: address,
                items: orderItems
            });

            showToast(`Order #${result.order.id} placed! Total: $${result.order.total.toFixed(2)}`);
            
            // Clear cart
            cart = [];
            updateCart();
            saveCart();

            // Close modal
            checkoutModal.classList.remove('active');
            checkoutForm.reset();

            // Launch Live brew tracker modal
            setTimeout(() => {
                startLiveOrderTracker();
            }, 800);
        } catch (err) {
            showToast('Order failed: ' + err.message);
        }
    });

    // ===================================
    // LOGIN/SIGNUP MODAL
    // ===================================
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Open auth modal or user dropdown
    const userDropdown = document.getElementById('user-dropdown');
    let isLoggedIn = false;

    loginBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isLoggedIn || window.__isLoggedIn) {
            userDropdown.classList.toggle('active');
        } else {
            authModal.classList.add('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu-wrapper')) {
            userDropdown.classList.remove('active');
        }
    });

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(tabName + '-form').classList.add('active');
        });
    });

    // Switch links
    document.querySelectorAll('.auth-switch a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const switchTo = this.getAttribute('data-switch');
            
            authTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-tab') === switchTo) {
                    tab.classList.add('active');
                }
            });

            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(switchTo + '-form').classList.add('active');
        });
    });

    // Login form submit — MySQL backed
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showToast('Please fill in all fields');
            return;
        }

        try {
            const result = await apiRequest('/auth/login', 'POST', { email, password });
            localStorage.setItem('user', JSON.stringify(result.user));
            showToast(result.message);
            authModal.classList.remove('active');
            loginForm.reset();
            loginBtn.textContent = result.user.name || 'Account';
            isLoggedIn = true;
            document.getElementById('dropdown-user-name').querySelector('span').textContent = result.user.name || 'Account';
        } catch (err) {
            showToast(err.message);
        }
    });

    // Signup form submit — MySQL backed
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (!name || !email || !password || !confirm) {
            showToast('Please fill in all fields');
            return;
        }

        if (password !== confirm) {
            showToast('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters');
            return;
        }

        try {
            const result = await apiRequest('/auth/signup', 'POST', { name, email, password });
            localStorage.setItem('user', JSON.stringify(result.user));
            showToast(result.message);
            authModal.classList.remove('active');
            signupForm.reset();
            loginBtn.textContent = result.user.name || 'Account';
            isLoggedIn = true;
            document.getElementById('dropdown-user-name').querySelector('span').textContent = result.user.name || 'Account';
        } catch (err) {
            showToast(err.message);
        }
    });

    // ===================================
    // RESERVATION FORM
    // ===================================
    const reservationForm = document.getElementById('reservation-form');

    // Set minimum date to today
    const dateInput = document.getElementById('res-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('res-name').value.trim();
        const date = document.getElementById('res-date').value;
        const time = document.getElementById('res-time').value;
        const guests = document.getElementById('res-guests').value;
        const phone = document.getElementById('res-phone').value.trim();

        // Clear errors
        clearErrors();

        // Validation
        let isValid = true;

        if (name.length < 2) {
            showError('name-error', 'Please enter a valid name');
            isValid = false;
        }

        if (!date) {
            showError('date-error', 'Please select a date');
            isValid = false;
        }

        if (!time) {
            showError('time-error', 'Please select a time');
            isValid = false;
        }

        if (!guests) {
            showError('guests-error', 'Please select number of guests');
            isValid = false;
        }

        if (!phone || phone.length < 10) {
            showError('phone-error', 'Please enter a valid phone number');
            isValid = false;
        }

        if (isValid) {
            // Submit reservation to MySQL via API
            const specialRequests = document.getElementById('res-requests') ? document.getElementById('res-requests').value.trim() : '';
            apiRequest('/reservations', 'POST', {
                customer_name: name,
                customer_phone: phone,
                reservation_date: date,
                reservation_time: time,
                guests: parseInt(guests),
                special_requests: specialRequests || null
            }).then(result => {
                showToast(`${result.message} Reservation #${result.reservation.id}`);
                reservationForm.reset();
            }).catch(err => {
                showToast('Reservation failed: ' + err.message);
            });
        }
    });

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }

    // ===================================
    // REVIEWS AUTO-SLIDER
    // ===================================
    const reviewsSlider = document.querySelector('.reviews-slider');
    const dots = document.querySelectorAll('.dot');
    let currentReview = 0;
    let reviewInterval;

    function slideToReview(index) {
        const reviewCards = document.querySelectorAll('.review-card');
        if (index >= reviewCards.length) {
            currentReview = 0;
        } else if (index < 0) {
            currentReview = reviewCards.length - 1;
        } else {
            currentReview = index;
        }

        const cardWidth = reviewCards[0].offsetWidth + 32; // card width + gap
        reviewsSlider.scrollTo({
            left: currentReview * cardWidth,
            behavior: 'smooth'
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentReview);
        });
    }

    // Auto slide
    function startAutoSlide() {
        reviewInterval = setInterval(() => {
            slideToReview(currentReview + 1);
        }, 4000);
    }

    function stopAutoSlide() {
        clearInterval(reviewInterval);
    }

    startAutoSlide();

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            stopAutoSlide();
            slideToReview(index);
            startAutoSlide();
        });
    });

    // Pause on hover
    reviewsSlider.addEventListener('mouseenter', stopAutoSlide);
    reviewsSlider.addEventListener('mouseleave', startAutoSlide);

    // ===================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ===================================
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // ===================================
    // BACKGROUND MUSIC TOGGLE (Legacy - guarded)
    // ===================================
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', function() {
            if (isPlaying) {
                bgMusic.pause();
                this.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                bgMusic.play().catch(e => {
                    console.log('Audio playback requires user interaction');
                });
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            isPlaying = !isPlaying;
        });
    }

    // ===================================
    // NEWSLETTER FORM
    // ===================================
    const newsletterForm = document.getElementById('newsletter-form');

    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        if (email) {
            try {
                const result = await apiRequest('/newsletter/subscribe', 'POST', { email });
                showToast(result.message);
                this.reset();
            } catch (err) {
                showToast('Subscription failed: ' + err.message);
            }
        }
    });

    // ===================================
    // TOAST NOTIFICATION
    // ===================================
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ===================================
    // MODAL CLOSE FUNCTIONALITY
    // ===================================
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // ===================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ===================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 70; // navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===================================
    // REACTIVE CART SYNCHRONIZER (ZERO-RELOAD)
    // ===================================
    window.addEventListener('cartUpdated', function() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCart();
    });

    // ===================================
    // BREW LAB (COFFEE CUSTOMIZER)
    // ===================================
    const customNameInput = document.getElementById('custom-name');
    const customNameDisplay = document.getElementById('custom-drink-name-display');
    const customRecipeDisplay = document.getElementById('custom-drink-recipe');
    const customPriceDisplay = document.getElementById('custom-price');
    const btnAddCustom = document.getElementById('btn-add-custom');

    // Option cards selection
    const optionGroups = document.querySelectorAll('.option-group');
    optionGroups.forEach(group => {
        const cards = group.querySelectorAll('.option-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                cards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                calculateCustomPrice();
            });
        });
    });

    if (customNameInput) {
        customNameInput.addEventListener('input', function() {
            customNameDisplay.textContent = this.value || 'My Dream Brew';
        });
    }

    function calculateCustomPrice() {
        if (!customPriceDisplay) return;

        let totalPrice = 0;
        let recipeDetails = [];
        
        // Base
        const activeBase = document.querySelector('[data-group="base"] .option-card.active');
        const basePrice = parseFloat(activeBase.getAttribute('data-price'));
        const baseColor = activeBase.getAttribute('data-color');
        const baseName = activeBase.getAttribute('data-name');
        totalPrice += basePrice;
        recipeDetails.push(baseName);
        
        // Milk
        const activeMilk = document.querySelector('[data-group="milk"] .option-card.active');
        const milkPrice = parseFloat(activeMilk.getAttribute('data-price'));
        const milkColor = activeMilk.getAttribute('data-color');
        const milkName = activeMilk.getAttribute('data-name');
        totalPrice += milkPrice;
        recipeDetails.push(milkName);
        
        // Syrup
        const activeSyrup = document.querySelector('[data-group="syrup"] .option-card.active');
        const syrupPrice = parseFloat(activeSyrup.getAttribute('data-price'));
        const syrupColor = activeSyrup.getAttribute('data-color');
        const syrupName = activeSyrup.getAttribute('data-name');
        totalPrice += syrupPrice;
        if (activeSyrup.getAttribute('data-value') !== 'none') {
            recipeDetails.push(syrupName);
        }
        
        // Topping
        const activeTopping = document.querySelector('[data-group="topping"] .option-card.active');
        const toppingPrice = parseFloat(activeTopping.getAttribute('data-price'));
        const toppingColor = activeTopping.getAttribute('data-color');
        const toppingName = activeTopping.getAttribute('data-name');
        totalPrice += toppingPrice;
        if (activeTopping.getAttribute('data-value') !== 'none') {
            recipeDetails.push(toppingName);
        }

        // Update price display
        customPriceDisplay.textContent = totalPrice.toFixed(2);
        customRecipeDisplay.textContent = recipeDetails.join(' + ');

        // Update liquid visual layers inside the cup
        const syrupLayer = document.getElementById('syrup-layer');
        const baseLayer = document.getElementById('base-layer');
        const milkLayer = document.getElementById('milk-layer');
        const toppingLayer = document.getElementById('topping-layer');
        const drizzleLayer = document.getElementById('drizzle-layer');

        if (syrupLayer && baseLayer && milkLayer && toppingLayer && drizzleLayer) {
            // Reset
            syrupLayer.style.height = '0%';
            baseLayer.style.height = '0%';
            milkLayer.style.height = '0%';
            toppingLayer.style.height = '0%';
            drizzleLayer.style.background = 'transparent';

            // 1. Syrup Layer
            if (activeSyrup.getAttribute('data-value') !== 'none') {
                syrupLayer.style.height = '15%';
                syrupLayer.style.backgroundColor = syrupColor;
            }

            // 2. Base Layer
            baseLayer.style.height = '50%';
            baseLayer.style.backgroundColor = baseColor;

            // 3. Milk Layer
            if (activeMilk.getAttribute('data-value') !== 'none') {
                milkLayer.style.height = '35%';
                milkLayer.style.backgroundColor = milkColor;
            }

            // 4. Topping Layer
            if (activeTopping.getAttribute('data-value') !== 'none') {
                const toppingVal = activeTopping.getAttribute('data-value');
                if (toppingVal === 'drizzle') {
                    // Apply diagonal lines via gradient for drizzle
                    drizzleLayer.style.background = `repeating-linear-gradient(45deg, transparent, transparent 10px, ${toppingColor} 10px, ${toppingColor} 20px)`;
                } else {
                    toppingLayer.style.height = '20%';
                    toppingLayer.style.backgroundColor = toppingColor;
                    if (toppingVal === 'whip') {
                        toppingLayer.style.borderRadius = '50% 50% 0 0';
                    } else {
                        toppingLayer.style.borderRadius = '0';
                    }
                }
            }
        }
    }

    // Initialize customizer
    if (customPriceDisplay) {
        calculateCustomPrice();
    }

    // Add custom drink to cart
    if (btnAddCustom) {
        btnAddCustom.addEventListener('click', function() {
            const name = customNameInput.value.trim() || 'My Dream Brew';
            const price = parseFloat(customPriceDisplay.textContent);
            const recipe = customRecipeDisplay.textContent;
            const image = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400';

            addToCart(`${name} (${recipe})`, price, image);
            showToast(`Custom brew "${name}" added to cart!`);
            
            // Open cart sidebar
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }

    // ===================================
    // VIRTUAL BARISTA QUIZ SYSTEM
    // ===================================
    let currentQuizStep = 1;
    const quizAnswers = {};
    const quizSteps = document.querySelectorAll('.quiz-step');
    const quizProgress = document.getElementById('quiz-progress');
    const quizCards = document.querySelectorAll('.quiz-card');

    quizCards.forEach(card => {
        card.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            const value = this.getAttribute('data-value');
            
            // Mark sibling cards inactive
            const siblings = this.parentElement.querySelectorAll('.quiz-card');
            siblings.forEach(s => s.classList.remove('active'));
            this.classList.add('active');

            quizAnswers[key] = value;

            // Go to next step after short delay
            setTimeout(() => {
                goToQuizStep(currentQuizStep + 1);
            }, 350);
        });
    });

    function goToQuizStep(step) {
        if (step > 4) {
            showQuizResult();
            return;
        }

        currentQuizStep = step;
        
        // Update active step UI
        quizSteps.forEach(s => s.classList.remove('active'));
        const nextStepEl = document.querySelector(`.quiz-step[data-step="${step}"]`);
        if (nextStepEl) {
            nextStepEl.classList.add('active');
        }

        // Progress bar
        if (quizProgress) {
            const percent = (step / 4) * 100;
            quizProgress.style.width = percent + '%';
        }
    }

    // Recommendation mapping
    const recommendationMap = {
        'cold-strong-pure-work': {
            title: 'Nitro Cold Brew',
            price: 4.99,
            desc: 'Ultra-smooth, velvety cold brew charged with nitrogen for an intense energy boost.',
            image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400'
        },
        'cold-mild-sweet-relax': {
            title: 'Caramel Iced Macchiato',
            price: 5.49,
            desc: 'Chilled milk marked with espresso and sweet buttery caramel drizzle. Perfect for relaxing.',
            image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'
        },
        'hot-strong-pure-work': {
            title: 'Double Espresso Ristretto',
            price: 3.49,
            desc: 'Pure, robust, full-bodied extraction of our signature dark roast beans to power your productivity.',
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400'
        },
        'hot-mild-chocolate-relax': {
            title: 'Signature Swiss Mocha',
            price: 4.99,
            desc: 'Steamed milk infused with premium Swiss cocoa and espresso, topped with light foam.',
            image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'
        }
    };

    function showQuizResult() {
        // Compute recommendation key
        const temp = quizAnswers['temp'] || 'hot';
        const bold = quizAnswers['bold'] || 'mild';
        const flavor = quizAnswers['flavor'] || 'sweet';
        const mood = quizAnswers['mood'] || 'relax';
        
        const answerKey = `${temp}-${bold}-${flavor}-${mood}`;
        
        // Find best match or default
        let match = recommendationMap[answerKey];
        if (!match) {
            if (temp === 'cold') {
                match = {
                    title: 'Iced Vanilla Latte',
                    price: 5.25,
                    desc: 'Cool espresso and milk sweetened with premium Madagascar vanilla syrup over ice.',
                    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400'
                };
            } else {
                match = {
                    title: 'Classic Cappuccino Flambé',
                    price: 4.75,
                    desc: 'Rich, bold espresso with equal parts steamed milk and deep, luxurious foam.',
                    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400'
                };
            }
        }

        // Populate result UI
        document.getElementById('match-title').textContent = match.title;
        document.getElementById('match-desc').textContent = match.desc;
        document.getElementById('match-price').textContent = `$${match.price.toFixed(2)}`;
        document.getElementById('match-img').src = match.image;

        // Display results page
        quizSteps.forEach(s => s.classList.remove('active'));
        document.getElementById('quiz-result').classList.add('active');
        if (quizProgress) {
            quizProgress.style.width = '100%';
        }

        // Setup add-to-cart for the quiz match
        const btnAddMatch = document.getElementById('btn-add-match');
        if (btnAddMatch) {
            const newBtnAddMatch = btnAddMatch.cloneNode(true);
            btnAddMatch.replaceWith(newBtnAddMatch);
            
            newBtnAddMatch.addEventListener('click', function() {
                addToCart(match.title, match.price, match.image);
                showToast(`Virtual Barista's match "${match.title}" added to cart!`);
                
                // Open cart
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
            });
        }
    }

    // Restart Quiz
    const btnRestartQuiz = document.getElementById('btn-restart-quiz');
    if (btnRestartQuiz) {
        btnRestartQuiz.addEventListener('click', function() {
            currentQuizStep = 1;
            quizCards.forEach(c => c.classList.remove('active'));
            goToQuizStep(1);
        });
    }

    // ===================================
    // LIVE BREW TRACKER SYSTEM
    // ===================================
    const trackerModal = document.getElementById('tracker-modal');
    const closeTracker = document.getElementById('close-tracker');
    const btnTrackerDone = document.getElementById('btn-close-tracker-done');
    const trackerProgressBar = document.getElementById('tracker-progress-bar');
    
    let trackerTimers = [];

    function startLiveOrderTracker() {
        if (!trackerModal) return;

        // Clear any old timers
        trackerTimers.forEach(t => clearTimeout(t));
        trackerTimers = [];

        // Reset Tracker UI
        trackerModal.classList.add('active');
        if (btnTrackerDone) btnTrackerDone.style.display = 'none';
        if (trackerProgressBar) trackerProgressBar.style.width = '0%';
        
        const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'];
        steps.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.remove('active', 'completed');
        });

        const liquid = document.getElementById('tracker-liquid');
        const cream = document.getElementById('tracker-cream');
        const art = document.getElementById('tracker-art');
        const grinder = document.getElementById('tracker-grinder');
        const steam = document.getElementById('tracker-steam');

        if (liquid) liquid.style.height = '0%';
        if (cream) cream.style.height = '0%';
        if (art) art.style.transform = 'translateX(-50%) scale(0)';
        if (grinder) grinder.style.display = 'none';
        if (steam) steam.style.display = 'none';

        // Stage 1: Received
        setTrackerStatus('Order Received', 'We have received your coffee order and our master baristas are preparing to brew.', 'step-1', 0);

        // Stage 2: Grinding (at 3 seconds)
        trackerTimers.push(setTimeout(() => {
            if (grinder) grinder.style.display = 'block';
            setTrackerStatus('Grinding Premium Beans', 'Grinding our house-roasted single origin espresso beans to the perfect consistency.', 'step-2', 25);
        }, 3000));

        // Stage 3: Brewing (at 7 seconds)
        trackerTimers.push(setTimeout(() => {
            if (grinder) grinder.style.display = 'none';
            if (steam) steam.style.display = 'block';
            if (liquid) liquid.style.height = '70%';
            setTrackerStatus('Brewing Golden Crema', 'Extracting espresso under 9 bars of pressure with fresh, pure water.', 'step-3', 50);
        }, 7000));

        // Stage 4: Latte Art (at 11 seconds)
        trackerTimers.push(setTimeout(() => {
            if (steam) steam.style.display = 'none';
            if (cream) cream.style.height = '30%';
            if (art) art.style.transform = 'translateX(-50%) scale(1.2)';
            setTrackerStatus('Pouring Latte Art', 'Steaming velvety microfoam milk and pouring a signature tulip design.', 'step-4', 75);
        }, 11000));

        // Stage 5: Ready (at 15 seconds)
        trackerTimers.push(setTimeout(() => {
            if (art) art.style.transform = 'translateX(-50%) scale(1)';
            setTrackerStatus('Ready for Pickup!', 'Your handcrafted premium brew is complete! Grab it fresh from the counter.', 'step-5', 100);
            
            // Play notification bell if audio mix is running
            if (audioContext && audioContext.state === 'running') {
                playBaristaBell();
            }

            if (btnTrackerDone) btnTrackerDone.style.display = 'block';
        }, 15000));
    }

    function setTrackerStatus(title, desc, activeStepId, progressPercent) {
        const titleEl = document.getElementById('tracker-status-title');
        const descEl = document.getElementById('tracker-status-desc');
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = desc;
        
        // Progress bar width
        if (trackerProgressBar) {
            trackerProgressBar.style.width = progressPercent + '%';
        }

        // Update step classes
        const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'];
        let activeReached = false;

        steps.forEach(s => {
            const el = document.getElementById(s);
            if (el) {
                if (s === activeStepId) {
                    el.classList.add('active');
                    el.classList.remove('completed');
                    activeReached = true;
                } else if (!activeReached) {
                    el.classList.add('completed');
                    el.classList.remove('active');
                } else {
                    el.classList.remove('active', 'completed');
                }
            }
        });
    }

    // Modal buttons click close
    if (closeTracker) closeTracker.addEventListener('click', closeTrackerModal);
    if (btnTrackerDone) btnTrackerDone.addEventListener('click', closeTrackerModal);
    
    function closeTrackerModal() {
        if (trackerModal) trackerModal.classList.remove('active');
        trackerTimers.forEach(t => clearTimeout(t));
    }

    // ===================================
    // COZY AMBIENT WEB AUDIO SYNTH MIXER
    // ===================================
    let audioContext = null;
    let masterGain = null;
    let tracks = {
        jazz: { gainNode: null, active: false, volume: 0.5, playFunc: playJazzLounge, timer: null },
        rain: { gainNode: null, active: false, volume: 0.3, playFunc: playRainSound, source: null },
        fire: { gainNode: null, active: false, volume: 0.3, playFunc: playFireSound, source: null, crackleTimer: null },
        chatter: { gainNode: null, active: false, volume: 0.4, playFunc: playCafeChatter, source: null }
    };

    const ambientTrigger = document.getElementById('ambient-trigger');
    const ambientConsole = document.getElementById('ambient-console');
    const closeAmbient = document.getElementById('close-ambient');
    const masterBtn = document.getElementById('ambient-master-btn');

    // Toggle panel
    if (ambientTrigger) {
        ambientTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            ambientConsole.classList.toggle('open');
            this.classList.toggle('active');
        });
    }

    if (closeAmbient) {
        closeAmbient.addEventListener('click', function(e) {
            e.stopPropagation();
            ambientConsole.classList.remove('open');
            if (ambientTrigger) ambientTrigger.classList.remove('active');
        });
    }

    // Close panel on body click
    document.addEventListener('click', function(e) {
        if (ambientConsole && !ambientConsole.contains(e.target) && e.target !== ambientTrigger) {
            ambientConsole.classList.remove('open');
            if (ambientTrigger) ambientTrigger.classList.remove('active');
        }
    });

    // Prevent propagation inside panel
    const ambientPanelEl = document.querySelector('.ambient-panel');
    if (ambientPanelEl) {
        ambientPanelEl.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Init Audio Context on first click of Master Power
    if (masterBtn) {
        masterBtn.addEventListener('click', function() {
            if (!audioContext) {
                initAudioEngine();
            }

            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const isRunning = masterBtn.textContent.includes('Stop');
            if (isRunning) {
                // Stop soundscape
                masterGain.gain.setValueAtTime(masterGain.gain.value, audioContext.currentTime);
                masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                masterBtn.innerHTML = '<i class="fas fa-play"></i> Start Soundscape';
                masterBtn.classList.remove('playing');
                if (ambientTrigger) {
                    ambientTrigger.classList.remove('playing');
                }
                
                // Stop active track loops
                stopAllSynthesizers();
            } else {
                // Start soundscape
                masterGain.gain.setValueAtTime(0.001, audioContext.currentTime);
                masterGain.gain.exponentialRampToValueAtTime(1.0, audioContext.currentTime + 0.5);
                masterBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Soundscape';
                masterBtn.classList.add('playing');
                if (ambientTrigger) {
                    ambientTrigger.classList.add('playing');
                }
                
                // Start all synthesizers
                startAllSynthesizers();
            }
        });
    }

    function initAudioEngine() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);

        // Setup individual track gains
        for (let key in tracks) {
            tracks[key].gainNode = audioContext.createGain();
            tracks[key].gainNode.gain.setValueAtTime(tracks[key].volume, audioContext.currentTime);
            tracks[key].gainNode.connect(masterGain);
        }

        // Hook sliders
        setupSlider('jazz');
        setupSlider('rain');
        setupSlider('fire');
        setupSlider('chatter');

        // Hook toggles
        setupToggle('jazz');
        setupToggle('rain');
        setupToggle('fire');
        setupToggle('chatter');
    }

    function setupSlider(key) {
        const slider = document.getElementById(`slider-${key}`);
        const display = document.getElementById(`val-${key}`);
        if (!slider) return;
        
        slider.addEventListener('input', function() {
            const val = parseFloat(this.value);
            if (display) display.textContent = Math.round(val * 100) + '%';
            tracks[key].volume = val;
            
            const toggleEl = document.getElementById(`toggle-${key}`);
            if (audioContext && tracks[key].gainNode && toggleEl && !toggleEl.classList.contains('muted')) {
                tracks[key].gainNode.gain.setValueAtTime(val, audioContext.currentTime);
            }
        });
    }

    function setupToggle(key) {
        const toggle = document.getElementById(`toggle-${key}`);
        if (!toggle) return;

        toggle.addEventListener('click', function() {
            this.classList.toggle('muted');
            const isMuted = this.classList.contains('muted');
            
            if (isMuted) {
                this.innerHTML = '<i class="fas fa-volume-mute"></i>';
                if (audioContext && tracks[key].gainNode) {
                    tracks[key].gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
                }
            } else {
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
                if (audioContext && tracks[key].gainNode) {
                    tracks[key].gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
                    tracks[key].gainNode.gain.exponentialRampToValueAtTime(tracks[key].volume, audioContext.currentTime + 0.2);
                }
            }
        });
    }

    function startAllSynthesizers() {
        for (let key in tracks) {
            if (!tracks[key].active) {
                tracks[key].active = true;
                tracks[key].playFunc();
            }
        }
    }

    function stopAllSynthesizers() {
        // Stop rain
        if (tracks.rain.source) {
            try { tracks.rain.source.stop(); } catch(e) {}
            tracks.rain.source = null;
        }
        // Stop fire
        if (tracks.fire.source) {
            try { tracks.fire.source.stop(); } catch(e) {}
            tracks.fire.source = null;
        }
        if (tracks.fire.crackleTimer) {
            clearInterval(tracks.fire.crackleTimer);
            tracks.fire.crackleTimer = null;
        }
        // Stop chatter
        if (tracks.chatter.source) {
            try { tracks.chatter.source.stop(); } catch(e) {}
            tracks.chatter.source = null;
        }
        // Stop jazz
        if (tracks.jazz.timer) {
            clearTimeout(tracks.jazz.timer);
            tracks.jazz.timer = null;
        }
        
        for (let key in tracks) {
            tracks[key].active = false;
        }
    }

    // --- Brown Noise Generator (Rain) ---
    function playRainSound() {
        if (!audioContext || !tracks.rain.active) return;
        
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const source = audioContext.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioContext.currentTime);

        source.connect(filter);
        filter.connect(tracks.rain.gainNode);
        source.start(0);
        tracks.rain.source = source;
    }

    // --- Cozy Fire Soundscape ---
    function playFireSound() {
        if (!audioContext || !tracks.fire.active) return;

        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 2.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, audioContext.currentTime);

        source.connect(filter);
        filter.connect(tracks.fire.gainNode);
        source.start(0);
        tracks.fire.source = source;

        // Wood Crackling Pops
        tracks.fire.crackleTimer = setInterval(() => {
            if (Math.random() > 0.45) {
                playFirePop();
            }
        }, 180);
    }

    function playFirePop() {
        if (!audioContext || !tracks.fire.active) return;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 1500, audioContext.currentTime);
        
        gain.gain.setValueAtTime(0.08 * Math.random(), audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
        
        osc.connect(gain);
        gain.connect(tracks.fire.gainNode);
        
        osc.start();
        osc.stop(audioContext.currentTime + 0.05);
    }

    // --- Cafe Crowd Hum Chatter ---
    function playCafeChatter() {
        if (!audioContext || !tracks.chatter.active) return;

        const bufferSize = 4 * audioContext.sampleRate;
        const murmurBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = murmurBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const white = (Math.random() * 2 - 1) * 0.03;
            const s1 = Math.sin(2 * Math.PI * 110 * (i / audioContext.sampleRate));
            const s2 = Math.sin(2 * Math.PI * 165 * (i / audioContext.sampleRate));
            const s3 = Math.sin(2 * Math.PI * 220 * (i / audioContext.sampleRate));
            output[i] = (white + (s1 * 0.4) + (s2 * 0.3) + (s3 * 0.2)) * 0.3;
        }

        const source = audioContext.createBufferSource();
        source.buffer = murmurBuffer;
        source.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, audioContext.currentTime);

        source.connect(filter);
        filter.connect(tracks.chatter.gainNode);
        source.start(0);
        tracks.chatter.source = source;
    }

    // --- Synthesized Jazz Lounge Progression ---
    const jazzChords = [
        [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
        [110.00, 138.59, 164.81, 220.00, 277.18], // Amaj9
        [146.83, 174.61, 220.00, 261.63, 311.13], // Dm9
        [98.00, 146.83, 185.00, 246.94, 293.66]   // G13
    ];
    let currentChordIndex = 0;

    function playJazzLounge() {
        if (!tracks.jazz.active || !audioContext) return;

        const chord = jazzChords[currentChordIndex];
        const now = audioContext.currentTime;

        chord.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.06 / chord.length, now + 1.2 + (index * 0.1));
            gain.gain.setValueAtTime(0.06 / chord.length, now + 4.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 7.8);
            
            osc.connect(gain);
            gain.connect(tracks.jazz.gainNode);
            
            osc.start(now);
            osc.stop(now + 8);
        });

        currentChordIndex = (currentChordIndex + 1) % jazzChords.length;
        tracks.jazz.timer = setTimeout(playJazzLounge, 6000);
    }

    // --- Barista Order Complete Bell ---
    function playBaristaBell() {
        if (!audioContext) return;
        
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, audioContext.currentTime);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1500, audioContext.currentTime);
        
        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(audioContext.currentTime + 1.5);
        osc2.stop(audioContext.currentTime + 1.5);
    }

    // ===================================
    // INITIALIZE CART ON LOAD
    // ===================================
    updateCart();

    // ===================================
    // CHECK SAVED USER
    // ===================================
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        loginBtn.textContent = user.name || 'Account';
    }

});

// ===================================
// GLOBAL FUNCTIONS (for inline onclick)
// ===================================
function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
}

// Listen for cart updates - reactive DOM rendering
window.addEventListener('cartUpdated', function() {
    // Local updates handle rendering reactively without reloads
});

// ===================================
// USER DROPDOWN HANDLERS
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async function() {
            try {
                await apiRequest('/auth/logout', 'POST');
            } catch(e) { /* ignore */ }
            localStorage.removeItem('user');
            const loginBtn = document.getElementById('login-btn');
            loginBtn.textContent = 'Login';
            document.getElementById('user-dropdown').classList.remove('active');
            showToast('Logged out successfully');
            // Reload to reset state
            setTimeout(() => location.reload(), 800);
        });
    }

    // My Orders
    const btnMyOrders = document.getElementById('btn-my-orders');
    if (btnMyOrders) {
        btnMyOrders.addEventListener('click', async function() {
            document.getElementById('user-dropdown').classList.remove('active');
            const ordersModal = document.getElementById('orders-modal');
            const ordersList = document.getElementById('orders-list');
            ordersModal.classList.add('active');
            ordersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading orders...</div>';

            try {
                const result = await apiRequest('/orders');
                const orders = result.orders || [];
                
                if (orders.length === 0) {
                    ordersList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-shopping-bag"></i>
                            <p>No orders yet. Start ordering!</p>
                        </div>
                    `;
                    return;
                }

                ordersList.innerHTML = orders.map(order => {
                    const items = order.items || [];
                    const itemsHtml = items.map(item => 
                        `<li><span>${item.item_name} x${item.quantity}</span><span>$${parseFloat(item.item_price).toFixed(2)}</span></li>`
                    ).join('');
                    const date = new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    });
                    return `
                        <div class="order-card">
                            <div class="order-card-header">
                                <span class="order-id">Order #${order.id}</span>
                                <span class="order-status ${order.status}">${order.status}</span>
                            </div>
                            <ul class="order-items-list">${itemsHtml}</ul>
                            <div class="order-card-footer">
                                <span class="order-total">$${parseFloat(order.total_amount).toFixed(2)}</span>
                                <span class="order-date">${date}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch(err) {
                ordersList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${err.message}</p></div>`;
            }
        });
    }

    // My Reservations
    const btnMyReservations = document.getElementById('btn-my-reservations');
    if (btnMyReservations) {
        btnMyReservations.addEventListener('click', async function() {
            document.getElementById('user-dropdown').classList.remove('active');
            const resModal = document.getElementById('reservations-modal');
            const resList = document.getElementById('reservations-list');
            resModal.classList.add('active');
            resList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading reservations...</div>';

            try {
                const result = await apiRequest('/reservations');
                const reservations = result.reservations || [];

                if (reservations.length === 0) {
                    resList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>No reservations yet. Book a table!</p>
                        </div>
                    `;
                    return;
                }

                resList.innerHTML = reservations.map(res => {
                    const date = new Date(res.reservation_date).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    });
                    const specialHtml = res.special_requests ? 
                        `<div class="res-special"><i class="fas fa-comment-dots"></i> ${res.special_requests}</div>` : '';
                    return `
                        <div class="order-card">
                            <div class="order-card-header">
                                <span class="order-id">Reservation #${res.id}</span>
                                <span class="order-status ${res.status}">${res.status}</span>
                            </div>
                            <div class="res-detail"><i class="fas fa-calendar"></i> ${date}</div>
                            <div class="res-detail"><i class="fas fa-clock"></i> ${res.reservation_time}</div>
                            <div class="res-detail"><i class="fas fa-users"></i> ${res.guests} guests</div>
                            <div class="res-detail"><i class="fas fa-phone"></i> ${res.customer_phone}</div>
                            ${specialHtml}
                        </div>
                    `;
                }).join('');
            } catch(err) {
                resList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${err.message}</p></div>`;
            }
        });
    }

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all required fields');
                return;
            }

            try {
                const result = await apiRequest('/contact', 'POST', { name, email, subject, message });
                showToast(result.message || 'Message sent successfully!');
                contactForm.reset();
            } catch(err) {
                showToast('Failed to send: ' + err.message);
            }
        });
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }
});
