// Mảng chứa thông tin giỏ hàng
let cart = [];
let currentFilter = "all";

// Phân loại sản phẩm theo filter
function categorizeProducts() {
    return {
        all: products,
        bestsale: products.filter((p) => p.isPopular),
        combo: products.filter((p) => p.category === "combo"),
        drink: products.filter((p) => p.category === "drink" || p.category === "dessert"),
        food: products.filter((p) => p.category === "single" || p.category === "food"),
    };
}

// Hàm hiển thị sản phẩm
function displayProducts(filter = "all") {
    const productContainer = document.querySelector(".products-grid");
    if (!productContainer) {
        console.error("Không tìm thấy container sản phẩm");
        return;
    }

    const categorizedProducts = categorizeProducts();
    const productsToShow = categorizedProducts[filter] || categorizedProducts.all;

    productContainer.innerHTML = "";

    if (productsToShow.length === 0) {
        productContainer.innerHTML = `
            <div class="no-products">
                <h3>🌊 Không có sản phẩm nào trong danh mục này</h3>
                <p>Hãy thử chọn danh mục khác!</p>
            </div>
        `;
        return;
    }

    productsToShow.forEach((product) => {
        const productHtml = generateProductHTML(product);
        productContainer.innerHTML += productHtml;
    });
}

// Tạo HTML cho từng sản phẩm
function generateProductHTML(product) {
    const isCombo = product.category === "combo";
    const isBestSale = product.isPopular;
    const cardClass = isBestSale ? "bestsale" : isCombo ? "combo" : "";

    const originalPriceHTML = product.originalPrice ? `<span class="original-price">~${product.originalPrice.toLocaleString("vi-VN")}đ</span>` : "";

    return `
        <div class="product-card ${cardClass}" id="product${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="price-section">
                    ${originalPriceHTML}
                    <span class="current-price">${product.price.toLocaleString("vi-VN")}đ/${product.unit}</span>
                </div>
                <div class="order-section">
                    <input type="number" id="${product.quantityInputId}" class="quantity-input" min="1" max="50" value="1" placeholder="SL">
                    <button class="order-btn" onclick="addToCartSimple(${product.id})">
                        🛒 Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Filter products
function filterProducts(filter) {
    currentFilter = filter;

    // Update active filter button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.querySelector(`[onclick="filterProducts('${filter}')"]`).classList.add("active");

    // Show loading animation
    const productContainer = document.querySelector(".products-grid");
    productContainer.innerHTML = '<div class="loading-spinner">🌊 Đang tải sản phẩm...</div>';

    // Simulate loading time for better UX
    setTimeout(() => {
        displayProducts(filter);
    }, 300);
}

// Thêm sản phẩm vào giỏ hàng
function addToCartSimple(productId) {
    const product = products.find((p) => p.id === productId);
    const quantityInput = document.getElementById(product.quantityInputId);
    const quantity = parseInt(quantityInput.value) || 1;

    if (quantity < 1 || quantity > 50) {
        showNotification("⚠️ Số lượng phải từ 1 đến 50!", "error");
        return;
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
        showNotification(`🔄 Đã cập nhật ${product.name} trong giỏ hàng!`, "success");
    } else {
        cart.push({
            productId: productId,
            productName: product.name,
            price: product.price,
            quantity: quantity,
            totalPrice: product.price * quantity,
        });
        showNotification(`✅ Đã thêm ${product.name} vào giỏ hàng!`, "success");
    }

    // Hiệu ứng thêm vào giỏ hàng
    showAddToCartAnimation(productId);

    // Reset input
    quantityInput.value = "1";

    updatePaymentForm();
    updateCartBadge();

    // Cuộn đến phần thanh toán
    setTimeout(() => {
        document.getElementById("thanhtoan").scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, 800);
}

// Hiệu ứng thêm vào giỏ hàng
function showAddToCartAnimation(productId) {
    const productCard = document.getElementById(`product${productId}`);
    if (productCard) {
        productCard.style.transform = "scale(1.05)";
        productCard.style.boxShadow = "0 20px 40px rgba(6, 105, 148, 0.4)";

        setTimeout(() => {
            productCard.style.transform = "";
            productCard.style.boxShadow = "";
        }, 500);
    }
}

// Hiển thị thông báo
function showNotification(message, type = "success") {
    let notification = document.getElementById("notification");
    if (!notification) {
        notification = document.createElement("div");
        notification.id = "notification";
        notification.className = "notification";
        document.body.appendChild(notification);
    }

    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 4000);
}

// Cập nhật form thanh toán
function updatePaymentForm() {
    let cartItemsList = document.getElementById("cartItems");
    let totalAmount = 0;

    if (!cartItemsList) {
        console.error("Không tìm thấy element cartItems");
        return;
    }

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li class="empty-cart">🌊 Giỏ hàng trống - Hãy thêm sản phẩm yêu thích!</li>';
        const totalAmountInput = document.getElementById("totalAmount");
        if (totalAmountInput) {
            totalAmountInput.value = "0 VND";
        }
        return;
    }

    cartItemsList.innerHTML = "";

    cart.forEach((item, index) => {
        let listItem = document.createElement("li");
        listItem.className = "cart-item";
        listItem.innerHTML = `
            <div class="cart-item-info">
                <div class="item-name">🍽️ ${item.productName}</div>
                <div class="item-details">Số lượng: ${item.quantity} | Đơn giá: ${item.price.toLocaleString("vi-VN")}đ</div>
                <div class="item-total">Thành tiền: ${item.totalPrice.toLocaleString("vi-VN")}đ</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})" title="Xóa sản phẩm">🗑️</button>
        `;
        cartItemsList.appendChild(listItem);
        totalAmount += item.totalPrice;
    });

    const totalAmountInput = document.getElementById("totalAmount");
    if (totalAmountInput) {
        totalAmountInput.value = totalAmount.toLocaleString("vi-VN") + " VND";
    }
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updatePaymentForm();
    updateCartBadge();
    showNotification(`🗑️ Đã xóa ${removedItem.productName} khỏi giỏ hàng!`, "success");
}

// Cập nhật badge giỏ hàng
function updateCartBadge() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    let cartBadge = document.getElementById("cart-badge");
    if (!cartBadge && cartCount > 0) {
        cartBadge = document.createElement("div");
        cartBadge.id = "cart-badge";
        cartBadge.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: var(--ocean-gradient);
            color: white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
            box-shadow: 0 10px 25px rgba(6, 105, 148, 0.4);
            z-index: 1000;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        cartBadge.onclick = () => {
            document.getElementById("thanhtoan").scrollIntoView({ behavior: "smooth" });
        };
        document.body.appendChild(cartBadge);
    }

    if (cartBadge) {
        if (cartCount > 0) {
            cartBadge.textContent = cartCount;
            cartBadge.style.display = "flex";
        } else {
            cartBadge.style.display = "none";
        }
    }
}

// Gửi đơn hàng
function submitOrder() {
    if (cart.length === 0) {
        showNotification("⚠️ Giỏ hàng trống! Vui lòng thêm sản phẩm.", "error");
        return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;

    // Validation
    if (!fullName || !phone || !address || !paymentMethod) {
        showNotification("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
        return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
        showNotification("⚠️ Số điện thoại không hợp lệ!", "error");
        return;
    }

    let submitButton = document.querySelector(".submit-btn");
    if (submitButton.disabled) {
        return;
    }

    submitButton.disabled = true;
    submitButton.classList.add("loading");
    submitButton.innerHTML = "🌊 Đang xử lý đơn hàng...";

    // Tạo dữ liệu đơn hàng
    let cartItemsString = "";
    cart.forEach((item, index) => {
        cartItemsString += `Sản phẩm ${index + 1}: ${item.productName}, SL: ${item.quantity}, Giá: ${item.price.toLocaleString("vi-VN")}đ, Tổng: ${item.totalPrice.toLocaleString(
            "vi-VN"
        )}đ; `;
    });

    const totalAmount = cart.reduce((total, item) => total + item.totalPrice, 0);
    const note = document.getElementById("note").value;

    const orderData = {
        fullName: fullName,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount.toLocaleString("vi-VN") + " VND",
        note: note,
        cartItems: cartItemsString,
        orderTime: new Date().toLocaleString("vi-VN"),
    };

    // Gửi dữ liệu
    fetch("https://script.google.com/macros/s/AKfycbwjDuSDUSxafLTGlOygvJkLAzbX-tyNVSCKaIOGqG6vD7QLpdaX33kTNgG2R7b5nz-pMQ/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(orderData),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(() => {
            showNotification("🎉 Đặt hàng thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.", "success");

            // Reset form và giỏ hàng
            cart = [];
            document.getElementById("paymentForm").reset();
            updatePaymentForm();
            updateCartBadge();

            // Reset button
            submitButton.disabled = false;
            submitButton.classList.remove("loading");
            submitButton.innerHTML = "🌊 XÁC NHẬN ĐẶT HÀNG";

            // Scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch((error) => {
            console.error("Lỗi:", error);
            showNotification("❌ Có lỗi xảy ra! Vui lòng thử lại.", "error");

            submitButton.disabled = false;
            submitButton.classList.remove("loading");
            submitButton.innerHTML = "🌊 XÁC NHẬN ĐẶT HÀNG";
        });
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target >= 1000) {
                counter.textContent = Math.floor(current) + '+';
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                
                // Trigger counter animation
                if (entry.target.querySelector('.stat-number')) {
                    animateCounters();
                }
            }
        });
    });

    // Observe elements
    document.querySelectorAll('.feature-item, .stats-section').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced page load
document.addEventListener("DOMContentLoaded", function () {
    // Start existing functionality
    if (typeof products !== "undefined") {
        console.log("Products loaded:", products);
        displayProducts();
        updatePaymentForm();
    }
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Animate counters after 1 second
    setTimeout(animateCounters, 1000);
    
    // Add click ripple effects
    document.querySelectorAll('.cta-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = this.querySelector('.btn-ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            ripple.style.opacity = '0.6';
            setTimeout(() => {
                ripple.style.opacity = '0';
            }, 300);
        });
    });
});

// Smooth scroll cho các link
document.addEventListener("click", function (e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    }
});
