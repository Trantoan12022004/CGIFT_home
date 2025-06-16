// Mảng chứa thông tin giỏ hàng
let cart = [];

// Hàm hiển thị sản phẩm
function displayProducts() {
    const productContainer = document.querySelector('.gifts_section_2 .row');
    if (!productContainer) return;

    productContainer.innerHTML = '';

    products.forEach(product => {
        const productHtml = generateProductHTML(product);
        productContainer.innerHTML += productHtml;
    });
}

// Tạo HTML cho từng sản phẩm
function generateProductHTML(product) {
    if (product.hasVariants) {
        return generateVariantProductHTML(product);
    } else {
        return generateSimpleProductHTML(product);
    }
}

// Tạo HTML cho sản phẩm đơn giản (không có variants)
function generateSimpleProductHTML(product) {
    return `
        <div class="col-md-6" id="product${product.id}">
            <div class="img_${product.id}"><img src="${product.image}"></div>
            <div class="volis_main">
                <div class="volis_2">
                    <h1 class="volis_text">${product.name}: <span style="color: #1cb2d2;">${(product.price/1000)}k/${product.unit}</span></h1>
                    <div class="soluong_dathang">
                        <input type="number" id="${product.quantityInputId}" class="custom" min="0" placeholder="Số lượng" style="margin-bottom: 10px;">
                        <div class="red_bt"><a href="#thanhtoan" onclick="addToCartSimple(${product.id})">Đặt Hàng</a></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Tạo HTML cho sản phẩm có variants
function generateVariantProductHTML(product) {
    const priceRange = getPriceRange(product.variants);
    const optionsHTML = product.variants.map(variant => 
        `<option value="${variant.id}">${variant.name}</option>`
    ).join('');

    return `
        <div class="col-md-6" id="product${product.id}">
            <div class="img_${product.id}"><img src="${product.image}"></div>
            <div class="volis_main">
                <div class="volis_2">
                    <h1 class="volis_text">${product.name}: <span style="color: #1cb2d2;">${priceRange}</span></h1>
                    <div class="soluong_dathang1">
                        <input type="number" id="${product.quantityInputId}" class="custom" min="0" placeholder="Số lượng" style="margin-bottom: 10px;">
                        <select id="${product.selectId}" class="custom-select" style="margin-bottom: 10px;">
                            <option value="">Chọn loại</option>
                            ${optionsHTML}
                        </select>
                        <div class="red_bt"><a href="#thanhtoan" onclick="addToCartVariant(${product.id})">Đặt Hàng</a></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Lấy khoảng giá cho sản phẩm có variants
function getPriceRange(variants) {
    const prices = variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
        return `${minPrice/1000}k`;
    }
    return `${minPrice/1000}/${maxPrice/1000}k`;
}

// Thêm sản phẩm đơn giản vào giỏ hàng
function addToCartSimple(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(product.quantityInputId).value);

    if (quantity > 0) {
        cart.push({
            productName: product.name,
            price: product.price,
            quantity: quantity,
            totalPrice: product.price * quantity
        });

        updatePaymentForm();
        window.location.href = "#thanhtoan";
    } else {
        alert("Vui lòng nhập số lượng hợp lệ!");
    }
}

// Thêm sản phẩm có variants vào giỏ hàng
function addToCartVariant(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(product.quantityInputId).value);
    const selectedVariant = document.getElementById(product.selectId).value;

    if (!selectedVariant) {
        alert('Vui lòng chọn loại sản phẩm!');
        return;
    }

    const variant = product.variants.find(v => v.id === selectedVariant);
    
    if (quantity > 0 && variant) {
        cart.push({
            productName: variant.name,
            price: variant.price,
            quantity: quantity,
            totalPrice: variant.price * quantity
        });

        updatePaymentForm();
        window.location.href = "#thanhtoan";
    } else {
        alert("Vui lòng nhập số lượng hợp lệ!");
    }
}

// Cập nhật form thanh toán
function updatePaymentForm() {
    let cartItemsList = document.getElementById('cartItems');
    let totalAmount = 0;

    cartItemsList.innerHTML = "";

    cart.forEach(item => {
        let listItem = document.createElement('li');
        listItem.textContent = `${item.productName} - Số lượng: ${item.quantity} - Giá 1 sản phẩm: ${(item.price.toLocaleString())} - Giá: ${(item.totalPrice).toLocaleString()} VND`;
        cartItemsList.appendChild(listItem);
        totalAmount += item.totalPrice;
    });

    document.getElementById('totalAmount').value = totalAmount.toLocaleString() + ' VND';
}

// Gửi đơn hàng
function submitOrder() {
    let cartItemsString = '';
    
    cart.forEach((item, index) => {
        cartItemsString += `Sản phẩm ${index + 1}: ${item.productName}, - Số lượng: ${item.quantity}, Giá: ${item.price.toLocaleString()} VND, Tổng: ${item.totalPrice.toLocaleString()} VND`;
    });

    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const totalAmount = document.getElementById('totalAmount').value;
    const note = document.getElementById('note').value;

    let submitButton = document.querySelector('button[onclick="submitOrder()"]');
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;

    const orderData = {
        fullName: fullName,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        note: note,
        cartItems: cartItemsString
    };

    fetch('https://script.google.com/macros/s/AKfycbwjDuSDUSxafLTGlOygvJkLAzbX-tyNVSCKaIOGqG6vD7QLpdaX33kTNgG2R7b5nz-pMQ/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(orderData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => {
        alert('Thanh toán thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
    });
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
});
