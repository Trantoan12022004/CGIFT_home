// Mảng chứa thông tin giỏ hàng
let cart = [];
let currentFilter = "all";

// Global variables for new features
let shippingFee = 0;
let discountAmount = 0;
let appliedDiscountCode = "";

// Discount codes database
const discountCodes = {
    SUMMER2025: {
        type: "percentage",
        value: 10,
        maxDiscount: 50000,
        minOrder: 200000,
        description: "Giảm 10% tối đa 50k cho đơn từ 200k",
    },
    NEWCUSTOMER: {
        type: "fixed",
        value: 20000,
        maxDiscount: 20000,
        minOrder: 100000,
        description: "Giảm 20k cho khách hàng mới",
    },
    FREESHIP: {
        type: "shipping",
        value: 100,
        maxDiscount: 50000,
        minOrder: 150000,
        description: "Miễn phí ship cho đơn từ 150k",
    },
};

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

// Tính khoảng cách từ HUST (Đại học Bách khoa Hà Nội)
async function calculateDistance(address) {
    try {
        // Tọa độ HUST chính xác: 21.0054, 105.8431
        const hustLat = 21.0054;
        const hustLng = 105.8431;
        
        console.log('Calculating distance for address:', address);
        
        // Thêm "Hà Nội, Việt Nam" để tăng độ chính xác
        const searchQuery = `${address}, Hà Nội, Việt Nam`;
        const encodedQuery = encodeURIComponent(searchQuery);
        
        // Sử dụng Nominatim API với các tham số cải tiến
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&` +
            `q=${encodedQuery}&` +
            `limit=3&` +
            `addressdetails=1&` +
            `countrycodes=vn&` +
            `accept-language=vi`,
            {
                headers: {
                    'User-Agent': 'CTES-SIE-SHOP-Website'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Geocoding results:', data);
        
        if (data && data.length > 0) {
            // Tìm kết quả tốt nhất (ưu tiên Hà Nội)
            let bestResult = data[0];
            
            for (let result of data) {
                if (result.display_name.toLowerCase().includes('hà nội') || 
                    result.display_name.toLowerCase().includes('hanoi')) {
                    bestResult = result;
                    break;
                }
            }
            
            const lat = parseFloat(bestResult.lat);
            const lng = parseFloat(bestResult.lon);
            
            console.log('Selected coordinates:', { lat, lng });
            console.log('Address found:', bestResult.display_name);
            
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Invalid coordinates from geocoding');
            }
            
            // Tính khoảng cách bằng công thức Haversine
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);
            console.log('Calculated distance:', distance, 'km');
            
            return {
                distance: distance,
                foundAddress: bestResult.display_name,
                coordinates: { lat, lng }
            };
        } else {
            throw new Error("Không tìm thấy địa chỉ phù hợp");
        }
    } catch (error) {
        console.error("Error calculating distance:", error);
        
        // Fallback: Thử tìm kiếm đơn giản hơn
        if (!address.toLowerCase().includes('backup-tried')) {
            console.log('Trying simplified search...');
            return await calculateDistanceSimple(address);
        }
        
        return null;
    }
}

// Hàm backup với tìm kiếm đơn giản hơn
async function calculateDistanceSimple(address) {
    try {
        const hustLat = 21.0054;
        const hustLng = 105.8431;
        
        // Chỉ tìm kiếm địa chỉ cơ bản
        const simpleQuery = address.split(',')[0].trim() + ', Hà Nội';
        console.log('Simple search for:', simpleQuery);
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simpleQuery)}&limit=1&countrycodes=vn`,
            {
                headers: {
                    'User-Agent': 'CTES-SIE-SHOP-Website'
                }
            }
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);
            
            return {
                distance: distance,
                foundAddress: data[0].display_name,
                coordinates: { lat, lng },
                isApproximate: true
            };
        }
        
        throw new Error('Không tìm thấy địa chỉ');
    } catch (error) {
        console.error('Simple search also failed:', error);
        return null;
    }
}

// Công thức Haversine được cải tiến
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    // Kiểm tra tham số đầu vào
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error('Invalid coordinates for distance calculation');
        return null;
    }
    
    const R = 6371; // Bán kính trái đất tính bằng km
    
    // Chuyển độ sang radian
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLatRad = (lat2 - lat1) * Math.PI / 180;
    const deltaLonRad = (lon2 - lon1) * Math.PI / 180;
    
    // Công thức Haversine
    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Làm tròn đến 2 chữ số thập phân
    return Math.round(distance * 100) / 100;
}

// Cập nhật phí giao hàng với UX cải tiến
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error('Missing required elements for shipping calculation');
        return;
    }

    const address = addressInput.value.trim();
    
    if (!address) {
        distanceInfo.style.display = "none";
        shippingFee = 0;
        updatePaymentSummary();
        return;
    }

    // Hiển thị loading với animation
    distanceInfo.style.display = "block";
    distanceText.innerHTML = '📍 <span class="loading-dots">Đang tính khoảng cách</span>';
    shippingFeeSpan.textContent = "";
    
    // Thêm animation cho loading dots
    const loadingDots = distanceText.querySelector('.loading-dots');
    if (loadingDots) {
        let dots = 0;
        const loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            loadingDots.textContent = 'Đang tính khoảng cách' + '.'.repeat(dots);
        }, 500);
        
        // Dọn dẹp interval sau 10 giây
        setTimeout(() => clearInterval(loadingInterval), 10000);
    }

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, foundAddress, isApproximate } = result;
            
            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `📍 Khoảng cách: <strong>${distance}km</strong> ${isApproximate ? '(ước tính)' : ''}`;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `📍 Khoảng cách: <strong>${distance}km</strong> ${isApproximate ? '(ước tính)' : ''}`;
                shippingFeeSpan.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">🚚 Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ</span>`;
            }
            
            // Hiển thị địa chỉ được tìm thấy nếu khác với input
            if (foundAddress && !foundAddress.toLowerCase().includes(address.toLowerCase())) {
                distanceText.innerHTML += `<br><small style="color: #666; font-style: italic;">Tìm thấy: ${foundAddress}</small>`;
            }
            
        } else {
            throw new Error('Unable to calculate distance');
        }
    } catch (error) {
        console.error('Distance calculation failed:', error);
        
        // Hiển thị lỗi thân thiện với người dùng
        distanceText.innerHTML = `
            <span style="color: #f59e0b;">⚠️ Không thể tính chính xác khoảng cách</span>
            <br><small style="color: #666;">Vui lòng nhập địa chỉ chi tiết hơn (VD: số nhà, tên đường, quận)</small>
        `;
        shippingFeeSpan.innerHTML = '<span style="color: #666;">Phí ship sẽ được xác nhận khi giao hàng</span>';
        shippingFee = 0;
    }

    updatePaymentSummary();
}

// Thêm validation địa chỉ
function validateAddress(address) {
    if (!address || address.length < 10) {
        return {
            isValid: false,
            message: 'Địa chỉ quá ngắn. Vui lòng nhập địa chỉ chi tiết hơn.'
        };
    }
    
    // Kiểm tra có số nhà không
    const hasNumber = /\d/.test(address);
    if (!hasNumber) {
        return {
            isValid: false,
            message: 'Vui lòng bao gồm số nhà trong địa chỉ.'
        };
    }
    
    return { isValid: true };
}

// Thêm CSS cho loading animation
const loadingCSS = `
    <style>
        .loading-dots {
            display: inline-block;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
        
        .distance-info {
            transition: all 0.3s ease;
        }
        
        .distance-info small {
            line-height: 1.4;
            margin-top: 5px;
            display: block;
        }
    </style>
`;

// Thêm CSS khi trang load
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('#distance-loading-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'distance-loading-styles';
        styleElement.innerHTML = loadingCSS;
        document.head.appendChild(styleElement);
    }
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
