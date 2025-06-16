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
    const combos = products.filter((p) => p.category === "combo");
    const singleProducts = products.filter((p) => p.category !== "combo");

    // Thêm tiêu đề cho combo
    if (combos.length > 0) {
        productContainer.innerHTML += `
            <div class="col-12">
                <h2 class="section-title">🎁 COMBO ƯU ĐÃI ĐẶC BIỆT 🎁</h2>
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
                <h2 class="section-title">🍰 SẢN PHẨM ĐỘC LẺ 🍰</h2>
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
    const isCombo = product.category === "combo";
    const popularBadge = product.isPopular ? '<div class="popular-badge">🔥 PHỔ BIẾN</div>' : "";
    const discountBadge = product.discount ? `<div class="discount-badge">${product.discount}</div>` : "";
    const originalPriceHTML = product.originalPrice ? `<span class="original-price">${product.originalPrice.toLocaleString("vi-VN")}đ</span>` : "";

    return `
        <div class="col-md-6 col-lg-4" id="product${product.id}">
            <div class="product-card ${isCombo ? "combo-card" : "single-card"}">
                ${popularBadge}
                ${discountBadge}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="price-section">
                        ${originalPriceHTML}
                        <span class="current-price">${product.price.toLocaleString("vi-VN")}đ/${product.unit}</span>
                    </div>
                    <div class="order-section">
                        <div class="quantity-input-wrapper">
                            <input type="number" id="${product.quantityInputId}" class="quantity-input" min="1" placeholder="Số lượng" value="1">
                        </div>
                        <button class="order-btn ${isCombo ? "combo-btn" : "single-btn"}" onclick="addToCartSimple(${product.id})">
                            <span class="btn-text">Đặt Hàng</span>
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

    if (quantity > 0) {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.find((item) => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
        } else {
            cart.push({
                productId: productId,
                productName: product.name,
                price: product.price,
                quantity: quantity,
                totalPrice: product.price * quantity,
            });
        }

        // Hiệu ứng thêm vào giỏ hàng
        showAddToCartAnimation(productId);

        // Reset input
        quantityInput.value = "1";

        updatePaymentForm();

        // Hiển thị thông báo
        showNotification(`Đã thêm ${product.name} vào giỏ hàng!`);

        // Cuộn đến phần thanh toán
        setTimeout(() => {
            document.getElementById("thanhtoan").scrollIntoView({ behavior: "smooth" });
        }, 500);
    } else {
        alert("Vui lòng nhập số lượng hợp lệ!");
    }
}

// Hiệu ứng thêm vào giỏ hàng
function showAddToCartAnimation(productId) {
    const productCard = document.getElementById(`product${productId}`);
    if (productCard) {
        productCard.classList.add("added-to-cart");
        setTimeout(() => {
            productCard.classList.remove("added-to-cart");
        }, 1000);
    }
}

// Hiển thị thông báo
function showNotification(message) {
    // Tạo thông báo nếu chưa có
    let notification = document.getElementById("notification");
    if (!notification) {
        notification = document.createElement("div");
        notification.id = "notification";
        notification.className = "notification";
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// Cập nhật form thanh toán
function updatePaymentForm() {
    let cartItemsList = document.getElementById("cartItems");
    let totalAmount = 0;

    if (!cartItemsList) {
        console.error("Không tìm thấy element cartItems");
        return;
    }

    cartItemsList.innerHTML = "";

    cart.forEach((item, index) => {
        let listItem = document.createElement("li");
        listItem.className = "cart-item";
        listItem.innerHTML = `
            <div class="cart-item-info">
                <span class="item-name">${item.productName}</span>
                <span class="item-details">SL: ${item.quantity} | Đơn giá: ${item.price.toLocaleString("vi-VN")}đ</span>
                <span class="item-total">Thành tiền: ${item.totalPrice.toLocaleString("vi-VN")}đ</span>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">❌</button>
        `;
        cartItemsList.appendChild(listItem);
        totalAmount += item.totalPrice;
    });

    const totalAmountInput = document.getElementById("totalAmount");
    if (totalAmountInput) {
        totalAmountInput.value = totalAmount.toLocaleString("vi-VN") + " VND";
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartCount();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(index) {
    cart.splice(index, 1);
    updatePaymentForm();
    showNotification("Đã xóa sản phẩm khỏi giỏ hàng!");
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Tìm hoặc tạo badge hiển thị số lượng
    let cartBadge = document.getElementById("cart-badge");
    if (!cartBadge && cartCount > 0) {
        cartBadge = document.createElement("span");
        cartBadge.id = "cart-badge";
        cartBadge.className = "cart-badge";

        // Thêm vào thanh menu
        const cartLink = document.querySelector('a[href="#thanhtoan"]');
        if (cartLink) {
            cartLink.style.position = "relative";
            cartLink.appendChild(cartBadge);
        }
    }

    if (cartBadge) {
        if (cartCount > 0) {
            cartBadge.textContent = cartCount;
            cartBadge.style.display = "block";
        } else {
            cartBadge.style.display = "none";
        }
    }
}

// Gửi đơn hàng
function submitOrder() {
    if (cart.length === 0) {
        alert("Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.");
        return;
    }

    let cartItemsString = "";

    cart.forEach((item, index) => {
        cartItemsString += `Sản phẩm ${index + 1}: ${item.productName}, Số lượng: ${item.quantity}, Giá: ${item.price.toLocaleString(
            "vi-VN"
        )} VND, Tổng: ${item.totalPrice.toLocaleString("vi-VN")} VND; `;
    });

    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const totalAmount = document.getElementById("totalAmount").value;
    const note = document.getElementById("note").value;

    // Kiểm tra các trường bắt buộc
    if (!fullName || !phone || !address || !paymentMethod) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
    }

    let submitButton = document.querySelector('button[onclick="submitOrder()"]');
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "Đang xử lý...";

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
            alert("Thanh toán thành công! Cảm ơn bạn đã đặt hàng.");
            // Reset form và giỏ hàng
            cart = [];
            document.getElementById("paymentForm").reset();
            updatePaymentForm();
            submitButton.disabled = false;
            submitButton.textContent = "Thanh Toán";
        })
        .catch((error) => {
            console.error("Lỗi:", error);
            alert("Có lỗi xảy ra! Vui lòng thử lại.");
            submitButton.disabled = false;
            submitButton.textContent = "Thanh Toán";
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
