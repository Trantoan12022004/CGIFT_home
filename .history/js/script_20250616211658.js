// Mảng chứa thông tin giỏ hàng
let cart = [];

// Hàm hiển thị sản phẩm
function displayProducts() {
    const productContainer = document.querySelector(".gifts_section_2 .row");
    if (!productContainer) {
        console.error("Không tìm thấy container sản phẩm");
        return;
    }

    productContainer.innerHTML = "";

    // Hiển thị combo trước (sản phẩm nổi bật)
    const combos = products.filter(p => p.category === 'combo');
    const singleProducts = products.filter(p => p.category !== 'combo');

    // Thêm tiêu đề cho combo
    if (combos.length > 0) {
        productContainer.innerHTML += `
            <div class="col-12">
                <h2 class="section-title">🍹 COMBO MÙA HÈ SIÊU HẤP DẪN 🏖️</h2>
            </div>
        `;
        
        combos.forEach((product) => {
            const productHtml = generateProductHTML(product);
            productContainer.innerHTML += productHtml;
        });
    }

    // Thêm tiêu đề cho sản phẩm đơn lẻ
    if (singleProducts.length > 0) {
        productContainer.innerHTML += `
            <div class="col-12">
                <h2 class="section-title">🥤 ĐỒ UỐNG & BÁNH KẸOSIÊU NGON 🍰</h2>
            </div>
        `;
        
        singleProducts.forEach((product) => {
            const productHtml = generateProductHTML(product);
            productContainer.innerHTML += productHtml;
        });
    }
}

// Tạo HTML cho từng sản phẩm
function generateProductHTML(product) {
    const isCombo = product.category === 'combo';
    const popularBadge = product.isPopular ? '<div class="popular-badge">🔥 PHỔ BIẾN</div>' : '';
    const discountBadge = product.discount ? `<div class="discount-badge">💰 ${product.discount}</div>` : '';
    const originalPriceHTML = product.originalPrice ? 
        `<span class="original-price">~${product.originalPrice.toLocaleString('vi-VN')}đ</span>` : '';

    return `
        <div class="col-md-6 col-lg-4" id="product${product.id}">
            <div class="product-card ${isCombo ? 'combo-card' : 'single-card'}">
                ${popularBadge}
                ${discountBadge}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="price-section">
                        ${originalPriceHTML}
                        <span class="current-price">${product.price.toLocaleString('vi-VN')}đ/${product.unit}</span>
                    </div>
                    <div class="order-section">
                        <div class="quantity-input-wrapper">
                            <input type="number" id="${product.quantityInputId}" class="quantity-input" min="1" max="50" placeholder="SL" value="1">
                        </div>
                        <button class="order-btn ${isCombo ? 'combo-btn' : 'single-btn'}" onclick="addToCartSimple(${product.id})">
                            <span class="btn-text">Thêm vào giỏ</span>
                            <span class="btn-icon">🛒</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Thêm sản phẩm đơn giản vào giỏ hàng
function addToCartSimple(productId) {
    const product = products.find((p) => p.id === productId);
    const quantityInput = document.getElementById(product.quantityInputId);
    const quantity = parseInt(quantityInput.value) || 1;

    if (quantity > 0 && quantity <= 50) {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
            showNotification(`🔄 Đã cập nhật ${product.name} trong giỏ hàng!`);
        } else {
            cart.push({
                productId: productId,
                productName: product.name,
                price: product.price,
                quantity: quantity,
                totalPrice: product.price * quantity,
            });
            showNotification(`✅ Đã thêm ${product.name} vào giỏ hàng!`);
        }

        // Hiệu ứng thêm vào giỏ hàng
        showAddToCartAnimation(productId);
        
        // Reset input
        quantityInput.value = "1";
        
        updatePaymentForm();
        
        // Cuộn đến phần thanh toán sau 1 giây
        setTimeout(() => {
            document.getElementById('thanhtoan').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 800);
    } else {
        showNotification("⚠️ Số lượng không hợp lệ (1-50)!");
    }
}

// Hiệu ứng thêm vào giỏ hàng
function showAddToCartAnimation(productId) {
    const productCard = document.getElementById(`product${productId}`);
    if (productCard) {
        productCard.classList.add('added-to-cart');
        setTimeout(() => {
            productCard.classList.remove('added-to-cart');
        }, 1200);
    }
}

// Hiển thị thông báo
function showNotification(message) {
    // Tạo thông báo nếu chưa có
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
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
        cartItemsList.innerHTML = '<li style="text-align: center; color: #999; font-style: italic;">🛒 Giỏ hàng trống</li>';
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
                <span class="item-name">🍽️ ${item.productName}</span>
                <span class="item-details">Số lượng: ${item.quantity} | Đơn giá: ${item.price.toLocaleString('vi-VN')}đ</span>
                <span class="item-total">Thành tiền: ${item.totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})" title="Xóa sản phẩm">🗑️</button>
        `;
        cartItemsList.appendChild(listItem);
        totalAmount += item.totalPrice;
    });

    const totalAmountInput = document.getElementById("totalAmount");
    if (totalAmountInput) {
        totalAmountInput.value = totalAmount.toLocaleString('vi-VN') + " VND";
    }
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartCount();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updatePaymentForm();
    showNotification(`🗑️ Đã xóa ${removedItem.productName} khỏi giỏ hàng!`);
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Tìm hoặc tạo badge hiển thị số lượng
    let cartBadge = document.getElementById('cart-badge');
    if (!cartBadge && cartCount > 0) {
        cartBadge = document.createElement('span');
        cartBadge.id = 'cart-badge';
        cartBadge.className = 'cart-badge';
        cartBadge.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--summer-gradient);
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
            box-shadow: 0 5px 15px rgba(255,107,53,0.4);
            z-index: 1000;
        `;
        document.body.appendChild(cartBadge);
    }
    
    if (cartBadge) {
        if (cartCount > 0) {
            cartBadge.textContent = cartCount;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }
}

// Gửi đơn hàng
function submitOrder() {
    if (cart.length === 0) {
        showNotification("⚠️ Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.");
        return;
    }

    let cartItemsString = "";

    cart.forEach((item, index) => {
        cartItemsString += `Sản phẩm ${index + 1}: ${item.productName}, Số lượng: ${
            item.quantity
        }, Giá: ${item.price.toLocaleString('vi-VN')} VND, Tổng: ${item.totalPrice.toLocaleString('vi-VN')} VND; `;
    });

    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const totalAmount = document.getElementById("totalAmount").value;
    const note = document.getElementById("note").value;

    // Kiểm tra các trường bắt buộc
    if (!fullName || !phone || !address || !paymentMethod) {
        showNotification("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
    }

    let submitButton = document.querySelector('.submit-btn');
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;
    submitButton.innerHTML = "🌀 Đang xử lý đơn hàng...";

    const orderData = {
        fullName: fullName,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        note: note,
        cartItems: cartItemsString,
    };

    fetch("https://script.google.com/macros/s/AKfycbwjDuSDUSxafLTGlOygvJkLAzbX-tyNVSCKaIOGqG6vD7QLpdaX33kTNgG2R7b5nz-pMQ/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(orderData),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((data) => {
            showNotification("🎉 Đặt hàng thành công! Cảm ơn bạn đã tin tưởng chúng tôi!");
            // Reset form và giỏ hàng
            cart = [];
            document.getElementById("paymentForm").reset();
            updatePaymentForm();
            submitButton.disabled = false;
            submitButton.innerHTML = "🌞 XÁC NHẬN ĐẶT HÀNG MÙA HÈ 🌊";
        })
        .catch((error) => {
            console.error("Lỗi:", error);
            showNotification("❌ Có lỗi xảy ra! Vui lòng thử lại sau.");
            submitButton.disabled = false;
            submitButton.innerHTML = "🌞 XÁC NHẬN ĐẶT HÀNG MÙA HÈ 🌊";
        });
}

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra xem products đã được load chưa
    if (typeof products !== "undefined") {
        console.log("Products loaded:", products);
        displayProducts();
    } else {
        console.error("Products not loaded");
        // Thử load lại sau 100ms
        setTimeout(() => {
            if (typeof products !== "undefined") {
                displayProducts();
            } else {
                console.error("Products still not loaded after retry");
            }
        }, 100);
    }
});
