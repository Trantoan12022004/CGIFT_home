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

// Google Maps API key - thay thế bằng API key thực tế của bạn
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Tính khoảng cách từ HUST (Đại học Bách khoa Hà Nội) bằng Google Maps
async function calculateDistance(address) {
    try {
        // Tọa độ chính xác của số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
        const hustLat = 21.0285;
        const hustLng = 105.8542;
        const hustAddress = "1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội, Việt Nam";

        console.log("Calculating distance from HUST to:", address);

        // Sử dụng Google Geocoding API để lấy tọa độ chính xác
        const geocodeResult = await geocodeAddress(address);

        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ");
        }

        const { lat, lng, formattedAddress } = geocodeResult;

        // Sử dụng Google Distance Matrix API để tính khoảng cách thực tế
        const distanceResult = await calculateDistanceMatrix(hustAddress, address);

        if (distanceResult) {
            return {
                distance: distanceResult.distance,
                duration: distanceResult.duration,
                foundAddress: formattedAddress,
                coordinates: { lat, lng },
                method: "google_distance_matrix",
            };
        } else {
            // Fallback: tính khoảng cách trực tiếp bằng Haversine
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);
            return {
                distance: distance,
                foundAddress: formattedAddress,
                coordinates: { lat, lng },
                method: "haversine_fallback",
            };
        }
    } catch (error) {
        console.error("Error calculating distance:", error);

        // Fallback cuối cùng: sử dụng OpenStreetMap
        return await calculateDistanceFallback(address);
    }
}

// Geocoding sử dụng Google Maps API
async function geocodeAddress(address) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address + ", Hà Nội, Việt Nam")}&` +
                `region=vn&` +
                `language=vi&` +
                `key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const location = result.geometry.location;

            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: result.formatted_address,
            };
        } else {
            console.error("Geocoding failed:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

// Tính khoảng cách sử dụng Google Distance Matrix API
async function calculateDistanceMatrix(origin, destination) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodeURIComponent(origin)}&` +
                `destinations=${encodeURIComponent(destination + ", Hà Nội, Việt Nam")}&` +
                `mode=driving&` +
                `language=vi&` +
                `region=vn&` +
                `key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === "OK" && data.rows.length > 0 && data.rows[0].elements.length > 0 && data.rows[0].elements[0].status === "OK") {
            const element = data.rows[0].elements[0];

            return {
                distance: element.distance.value / 1000, // Convert từ meters sang km
                duration: element.duration.value / 60, // Convert từ seconds sang minutes
                distanceText: element.distance.text,
                durationText: element.duration.text,
            };
        } else {
            console.error("Distance Matrix failed:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Distance Matrix error:", error);
        return null;
    }
}

// Fallback function sử dụng OpenStreetMap
async function calculateDistanceFallback(address) {
    try {
        const hustLat = 21.0285;
        const hustLng = 105.8542;

        console.log("Using OpenStreetMap fallback...");

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(address + ", Hà Nội, Việt Nam")}&` +
                `limit=3&` +
                `addressdetails=1&` +
                `countrycodes=vn&` +
                `accept-language=vi`,
            {
                headers: {
                    "User-Agent": "CTES-SIE-SHOP-Website",
                },
            }
        );

        const data = await response.json();

        if (data && data.length > 0) {
            // Tìm kết quả tốt nhất
            let bestResult = data[0];
            for (let result of data) {
                if (result.display_name.toLowerCase().includes("hà nội") || result.display_name.toLowerCase().includes("hanoi")) {
                    bestResult = result;
                    break;
                }
            }

            const lat = parseFloat(bestResult.lat);
            const lng = parseFloat(bestResult.lon);
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);

            return {
                distance: distance,
                foundAddress: bestResult.display_name,
                coordinates: { lat, lng },
                method: "openstreetmap_fallback",
                isApproximate: true,
            };
        }

        return null;
    } catch (error) {
        console.error("Fallback calculation failed:", error);
        return null;
    }
}

// Cải tiến hàm Haversine
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error("Invalid coordinates for distance calculation");
        return null;
    }

    const R = 6371; // Bán kính trái đất tính bằng km

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
}

// Cập nhật phí giao hàng với Google Maps
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error("Missing required elements for shipping calculation");
        return;
    }

    const address = addressInput.value.trim();

    if (!address) {
        distanceInfo.style.display = "none";
        shippingFee = 0;
        updatePaymentSummary();
        return;
    }

    // Validation địa chỉ cơ bản
    if (address.length < 10) {
        distanceInfo.style.display = "block";
        distanceText.innerHTML = '<span style="color: #f59e0b;">⚠️ Vui lòng nhập địa chỉ chi tiết hơn (tối thiểu 10 ký tự)</span>';
        shippingFeeSpan.textContent = "";
        return;
    }

    // Hiển thị loading với animation
    distanceInfo.style.display = "block";
    distanceText.innerHTML = `
        <span class="loading-text">📍 Đang tính khoảng cách bằng Google Maps...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, duration, foundAddress, method, isApproximate } = result;

            let methodText = "";
            if (method === "google_distance_matrix") {
                methodText = "🗺️ Google Maps";
            } else if (method === "haversine_fallback") {
                methodText = "📏 Khoảng cách thẳng";
            } else if (method === "openstreetmap_fallback") {
                methodText = "🌍 Bản đồ mở (ước tính)";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info">${methodText}</small>
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info">${methodText}</small>
                    </div>
                `;
                shippingFeeSpan.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">🚚 Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ</span>`;
            }

            // Hiển thị địa chỉ được tìm thấy nếu khác nhiều với input
            if (foundAddress && foundAddress.toLowerCase() !== address.toLowerCase()) {
                distanceText.innerHTML += `
                    <div class="found-address">
                        <small style="color: #666; font-style: italic;">
                            📍 Địa chỉ tìm thấy: ${foundAddress}
                        </small>
                    </div>
                `;
            }
        } else {
            throw new Error("Unable to calculate distance");
        }
    } catch (error) {
        console.error("Distance calculation failed:", error);

        distanceText.innerHTML = `
            <div class="distance-error">
                <span style="color: #ef4444;">❌ Không thể tính khoảng cách</span>
                <br><small style="color: #666;">
                    Vui lòng kiểm tra lại địa chỉ hoặc liên hệ với chúng tôi để được hỗ trợ
                </small>
                <br><small style="color: #888;">
                    💡 Gợi ý: Nhập đầy đủ số nhà, tên đường, quận/huyện
                </small>
            </div>
        `;
        shippingFeeSpan.innerHTML = '<span style="color: #666;">Phí ship sẽ được xác nhận khi liên hệ</span>';
        shippingFee = 0;
    }

    updatePaymentSummary();
}

// Load Google Maps API dynamically
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        // Kiểm tra xem đã load chưa
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Google Maps API failed to load"));

        document.head.appendChild(script);
    });
}

// Alternative: Sử dụng Google Maps JavaScript API trực tiếp (nếu có)
async function calculateDistanceWithMapsAPI(origin, destination) {
    try {
        await loadGoogleMapsAPI();

        const service = new google.maps.DistanceMatrixService();

        return new Promise((resolve, reject) => {
            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false,
                },
                (response, status) => {
                    if (status === google.maps.DistanceMatrixStatus.OK) {
                        const element = response.rows[0].elements[0];
                        if (element.status === "OK") {
                            resolve({
                                distance: element.distance.value / 1000,
                                duration: element.duration.value / 60,
                                distanceText: element.distance.text,
                                durationText: element.duration.text,
                            });
                        } else {
                            reject(new Error(`Distance calculation failed: ${element.status}`));
                        }
                    } else {
                        reject(new Error(`Distance Matrix API failed: ${status}`));
                    }
                }
            );
        });
    } catch (error) {
        console.error("Google Maps API error:", error);
        throw error;
    }
}

// Thêm CSS cho loading và styling mới
const enhancedDistanceCSS = `
    <style>
        .loading-text {
            color: #0ea5e9;
            font-weight: 500;
        }
        
        .loading-spinner-small {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #e0f7fa;
            border-top: 2px solid #0ea5e9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .distance-result {
            background: linear-gradient(145deg, #f0f9ff, #e0f7fa);
            padding: 12px 15px;
            border-radius: 10px;
            border-left: 4px solid #0ea5e9;
            margin-top: 5px;
        }
        
        .distance-result.success {
            background: linear-gradient(145deg, #f0fdf4, #dcfce7);
            border-left-color: #10b981;
        }
        
        .distance-error {
            background: linear-gradient(145deg, #fef2f2, #fee2e2);
            padding: 12px 15px;
            border-radius: 10px;
            border-left: 4px solid #ef4444;
            margin-top: 5px;
        }
        
        .method-info {
            color: #6b7280;
            font-size: 0.8rem;
            background: rgba(255, 255, 255, 0.7);
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 4px;
        }
        
        .found-address {
            margin-top: 8px;
            padding: 8px 10px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 6px;
            border: 1px dashed #d1d5db;
        }
    </style>
`;

// Thêm CSS khi trang load
document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector("#enhanced-distance-styles")) {
        const styleElement = document.createElement("div");
        styleElement.id = "enhanced-distance-styles";
        styleElement.innerHTML = enhancedDistanceCSS;
        document.head.appendChild(styleElement);
    }
});

// Tính khoảng cách từ HUST (Đại học Bách khoa Hà Nội)
async function calculateDistance(address) {
    try {
        // Tọa độ HUST: 21.0054, 105.8431
        const hustLat = 21.0054;
        const hustLng = 105.8431;

        // Geocoding API (sử dụng OpenStreetMap Nominatim - miễn phí)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Hà Nội, Việt Nam")}&limit=1`);

        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            // Tính khoảng cách bằng công thức Haversine
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);
            return distance;
        } else {
            throw new Error("Không tìm thấy địa chỉ");
        }
    } catch (error) {
        console.error("Error calculating distance:", error);
        return null;
    }
}

// Công thức Haversine để tính khoảng cách giữa hai điểm
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Cập nhật phí giao hàng dựa trên khoảng cách
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput.value.trim()) {
        distanceInfo.style.display = "none";
        shippingFee = 0;
        updatePaymentSummary();
        return;
    }

    // Hiển thị loading
    distanceInfo.style.display = "block";
    distanceText.textContent = "📍 Đang tính khoảng cách...";
    shippingFeeSpan.textContent = "";

    try {
        const distance = await calculateDistance(addressInput.value);

        if (distance !== null) {
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.textContent = `📍 Khoảng cách: ${distance.toFixed(1)}km`;
                shippingFeeSpan.textContent = "🎉 Miễn phí giao hàng!";
                shippingFeeSpan.style.color = "#10b981";
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.textContent = `📍 Khoảng cách: ${distance.toFixed(1)}km`;
                shippingFeeSpan.textContent = `🚚 Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ`;
                shippingFeeSpan.style.color = "#f59e0b";
            }
        } else {
            distanceText.textContent = "⚠️ Không thể tính khoảng cách";
            shippingFeeSpan.textContent = "Vui lòng nhập địa chỉ chi tiết hơn";
            shippingFee = 0;
        }
    } catch (error) {
        distanceText.textContent = "⚠️ Lỗi tính khoảng cách";
        shippingFeeSpan.textContent = "Phí ship sẽ được tính khi giao hàng";
        shippingFee = 0;
    }

    updatePaymentSummary();
}

// Áp dụng mã giảm giá
function applyDiscountCode() {
    const codeInput = document.getElementById("discountCode");
    const statusDiv = document.getElementById("discountStatus");
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        statusDiv.className = "discount-status error";
        statusDiv.textContent = "⚠️ Vui lòng nhập mã giảm giá";
        statusDiv.style.display = "block";
        return;
    }

    const currentSubtotal = cart.reduce((total, item) => total + item.totalPrice, 0);

    if (discountCodes[code]) {
        const discount = discountCodes[code];

        // Kiểm tra yêu cầu đơn hàng tối thiểu
        if (currentSubtotal < discount.minOrder) {
            statusDiv.className = "discount-status error";
            statusDiv.textContent = `⚠️ Đơn hàng tối thiểu ${discount.minOrder.toLocaleString("vi-VN")}đ để sử dụng mã này`;
            statusDiv.style.display = "block";
            return;
        }

        // Tính toán giảm giá
        let calculatedDiscount = 0;
        if (discount.type === "percentage") {
            calculatedDiscount = Math.min((currentSubtotal * discount.value) / 100, discount.maxDiscount);
        } else if (discount.type === "fixed") {
            calculatedDiscount = discount.value;
        } else if (discount.type === "shipping") {
            calculatedDiscount = Math.min(shippingFee, discount.maxDiscount);
        }

        discountAmount = calculatedDiscount;
        appliedDiscountCode = code;

        statusDiv.className = "discount-status success";
        statusDiv.textContent = `✅ Áp dụng thành công! ${discount.description}`;
        statusDiv.style.display = "block";

        codeInput.disabled = true;
        document.querySelector(".apply-discount-btn").textContent = "Đã áp dụng";
        document.querySelector(".apply-discount-btn").disabled = true;
    } else {
        statusDiv.className = "discount-status error";
        statusDiv.textContent = "❌ Mã giảm giá không hợp lệ";
        statusDiv.style.display = "block";
        discountAmount = 0;
        appliedDiscountCode = "";
    }

    updatePaymentSummary();
}

// Cập nhật tóm tắt thanh toán
function updatePaymentSummary() {
    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);

    // Cập nhật các phần tử hiển thị
    document.getElementById("subtotal").textContent = subtotal.toLocaleString("vi-VN") + " VND";
    document.getElementById("shippingFeeDisplay").textContent = shippingFee.toLocaleString("vi-VN") + " VND";

    // Xử lý hiển thị giảm giá
    const discountRow = document.getElementById("discountRow");
    const discountAmountSpan = document.getElementById("discountAmount");

    if (discountAmount > 0) {
        discountRow.style.display = "flex";
        discountAmountSpan.textContent = "-" + discountAmount.toLocaleString("vi-VN") + " VND";
    } else {
        discountRow.style.display = "none";
    }

    // Tính toán tổng cộng cuối cùng
    const finalTotal = subtotal + shippingFee - discountAmount;
    document.getElementById("finalTotal").textContent = finalTotal.toLocaleString("vi-VN") + " VND";
    document.getElementById("totalAmount").value = finalTotal.toLocaleString("vi-VN") + " VND";

    // Hiển thị thông báo giảm giá cho đơn hàng >= 200k
    const discountAlert = document.getElementById("discountAlert");
    if (subtotal >= 0 && !appliedDiscountCode) {
        discountAlert.style.display = "block";
    } else if (subtotal < ) {
        discountAlert.style.display = "none";
    }

    // Cập nhật QR amount
    updateVietQR(finalTotal);
}

// Xử lý thay đổi phương thức thanh toán
function handlePaymentMethodChange() {
    const paymentMethod = document.getElementById("paymentMethod").value;
    const vietqrSection = document.getElementById("vietqrSection");

    if (paymentMethod === "bank") {
        vietqrSection.style.display = "block";
        const finalTotal = cart.reduce((total, item) => total + item.totalPrice, 0) + shippingFee - discountAmount;
        updateVietQR(finalTotal);
    } else {
        vietqrSection.style.display = "none";
    }
}

// Cập nhật VietQR
function updateVietQR(amount) {
    const qrAmount = document.getElementById("qrAmount");
    const qrContent = document.getElementById("qrContent");
    const qrCode = document.getElementById("qrCode");

    if (amount > 0) {
        qrAmount.textContent = amount.toLocaleString("vi-VN") + " VND";

        // Tạo ID đơn hàng
        const now = new Date();
        const ddMMyy = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString().slice(-2);
        // Kết quả: "170625" nếu là ngày 17/06/2025

        const orderId = "MHX2025" + ddMMyy;
        qrContent.textContent = `${orderId}`;

        // Tạo URL VietQR
        const bankId = "970407"; // Techcombank
        const accountNo = "1120051111"; // Số tài khoản
        const template = "compact2";
        const description = encodeURIComponent(`${orderId}`);

        const vietqrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${description}&accountName=PHAM DUC HAI TRIEU`;

        qrCode.innerHTML = `<img src="${vietqrUrl}" alt="VietQR Code" style="max-width: 100%; height: auto;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjc3NDhGIiBmb250LXNpemU9IjE0Ij5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4='" />`;
    }
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

        // Reset all calculations
        shippingFee = 0;
        discountAmount = 0;
        updatePaymentSummary();
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

    updatePaymentSummary();
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

    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    const finalTotal = subtotal + shippingFee - discountAmount;
    const note = document.getElementById("note").value;

    const orderData = {
        fullName: fullName,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        subtotal: subtotal.toLocaleString("vi-VN") + " VND",
        shippingFee: shippingFee.toLocaleString("vi-VN") + " VND",
        discountCode: appliedDiscountCode,
        discountAmount: discountAmount.toLocaleString("vi-VN") + " VND",
        totalAmount: finalTotal.toLocaleString("vi-VN") + " VND",
        note: note,
        cartItems: cartItemsString,
        orderTime: new Date().toLocaleString("vi-VN"),
    };

    // Gửi dữ liệu
    fetch("https://script.google.com/macros/s/AKfycbzRZQFPxw5kC3GWMbnHdRJnUuFhVZHqaLDgObgMPGk-wq5YFCJgFWppaT8mk2Nbe96R1g/exec", {
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
            shippingFee = 0;
            discountAmount = 0;
            appliedDiscountCode = "";
            document.getElementById("paymentForm").reset();
            document.getElementById("discountCode").disabled = false;
            document.querySelector(".apply-discount-btn").disabled = false;
            document.querySelector(".apply-discount-btn").textContent = "Áp dụng";
            document.getElementById("discountStatus").style.display = "none";
            document.getElementById("distanceInfo").style.display = "none";
            document.getElementById("vietqrSection").style.display = "none";
            document.getElementById("discountAlert").style.display = "none";

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
    const counters = document.querySelectorAll(".stat-number");

    counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-count"));
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
                counter.textContent = Math.floor(current) + "+";
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = "running";

                // Trigger counter animation
                if (entry.target.querySelector(".stat-number")) {
                    animateCounters();
                }
            }
        });
    });

    // Observe elements
    document.querySelectorAll(".feature-item, .stats-section").forEach((el) => {
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

    // Add event listeners for new features
    const addressInput = document.getElementById("address");
    if (addressInput) {
        let addressTimeout;
        addressInput.addEventListener("input", function () {
            clearTimeout(addressTimeout);
            addressTimeout = setTimeout(updateShippingFee, 1000); // Debounce 1 second
        });
    }

    // Enhanced mobile optimizations
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        initMobileOptimizations();
        optimizeImagesForMobile();
        optimizeMobileCheckout();
        optimizeMobilePerformance();
    }

    // Add click ripple effects
    document.querySelectorAll(".cta-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            const ripple = this.querySelector(".btn-ripple");
            if (ripple) {
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);

                ripple.style.width = ripple.style.height = size + "px";
                ripple.style.left = e.clientX - rect.left - size / 2 + "px";
                ripple.style.top = e.clientY - rect.top - size / 2 + "px";

                ripple.style.opacity = "0.6";
                setTimeout(() => {
                    ripple.style.opacity = "0";
                }, 300);
            }
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
