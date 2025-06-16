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
        // Tọa độ chính xác của HUST (Đại học Bách khoa Hà Nội)
        const hustLat = 21.0070;
        const hustLng = 105.8430;
        const hustAddress = "Đại học Bách khoa Hà Nội, Hai Bà Trưng, Hà Nội, Việt Nam";

        console.log("Tính khoảng cách từ HUST đến:", address);

        // Chuẩn hóa địa chỉ
        const normalizedAddress = normalizeAddress(address);

        // Sử dụng Google Geocoding API để lấy tọa độ chính xác
        const geocodeResult = await geocodeAddress(normalizedAddress);

        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ");
        }

        const { lat, lng, formattedAddress } = geocodeResult;

        // Sử dụng Google Distance Matrix API để tính khoảng cách thực tế
        const distanceResult = await calculateDistanceMatrix(hustAddress, formattedAddress);

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
        console.error("Lỗi khi tính khoảng cách:", error);

        // Fallback cuối cùng: sử dụng OpenStreetMap
        return await calculateDistanceFallback(address);
    }
}

// Chuẩn hóa địa chỉ để tăng khả năng tìm kiếm
function normalizeAddress(address) {
    // Đảm bảo địa chỉ có "Hà Nội"
    if (!address.toLowerCase().includes("hà nội") && !address.toLowerCase().includes("hanoi")) {
        address = address + ", Hà Nội";
    }
    
    // Thêm "Việt Nam" nếu chưa có
    if (!address.toLowerCase().includes("việt nam") && !address.toLowerCase().includes("vietnam")) {
        address = address + ", Việt Nam";
    }
    
    return address;
}

// Geocoding sử dụng Google Maps API
async function geocodeAddress(address) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address)}&` +
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
            console.error("Geocoding thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi geocoding:", error);
        return null;
    }
}

// Tính khoảng cách sử dụng Google Distance Matrix API
async function calculateDistanceMatrix(origin, destination) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodeURIComponent(origin)}&` +
                `destinations=${encodeURIComponent(destination)}&` +
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
            console.error("Distance Matrix thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi Distance Matrix:", error);
        return null;
    }
}

// Fallback function sử dụng OpenStreetMap
async function calculateDistanceFallback(address) {
    try {
        const hustLat = 21.0070;
        const hustLng = 105.8430;

        console.log("Sử dụng OpenStreetMap fallback...");
        
        // Chuẩn hóa địa chỉ để tăng khả năng tìm thấy
        const normalizedAddress = normalizeAddress(address);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(normalizedAddress)}&` +
                `limit=5&` +
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
            // Tìm kết quả tốt nhất dựa trên độ chính xác
            let bestResult = data[0];
            let bestScore = 0;
            
            for (let result of data) {
                let score = 0;
                // Ưu tiên kết quả có "Hà Nội"
                if (result.display_name.toLowerCase().includes("hà nội") || result.display_name.toLowerCase().includes("hanoi")) {
                    score += 5;
                }
                
                // Kiểm tra xem tất cả các từ quan trọng có trong kết quả không
                const importantWords = address.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                for (let word of importantWords) {
                    if (result.display_name.toLowerCase().includes(word)) {
                        score += 1;
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestResult = result;
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
        console.error("Tính khoảng cách fallback thất bại:", error);
        return null;
    }
}

// Cải tiến hàm Haversine cho tính toán chính xác hơn
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error("Tọa độ không hợp lệ cho tính toán khoảng cách");
        return null;
    }

    const R = 6371; // Bán kính trái đất tính bằng km

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) + 
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Thêm hệ số điều chỉnh đường đi thực tế (đường không đi thẳng)
    const roadFactor = 1.3;
    return Math.round((distance * roadFactor) * 10) / 10; // Làm tròn 1 chữ số thập phân
}

// Cập nhật phí giao hàng với Google Maps
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error("Thiếu các phần tử cần thiết để tính phí ship");
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
        <span class="loading-text">📍 Đang tính khoảng cách và phí giao hàng...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, duration, foundAddress, method, isApproximate } = result;

            let methodText = "";
            let methodClass = "";
            
            if (method === "google_distance_matrix") {
                methodText = "🗺️ Google Maps";
                methodClass = "method-google";
            } else if (method === "haversine_fallback") {
                methodText = "📏 Khoảng cách thẳng";
                methodClass = "method-haversine";
            } else if (method === "openstreetmap_fallback") {
                methodText = "🌍 Bản đồ mở (ước tính)";
                methodClass = "method-osm";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
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
            throw new Error("Không thể tính khoảng cách");
        }
    } catch (error) {
        console.error("Tính khoảng cách thất bại:", error);

        distanceText.innerHTML = `
            <div class="distance-error">
                <span style="color: #ef4444;">❌ Không thể tìm thấy địa chỉ chính xác</span>
                <br><small style="color: #666;">
                    Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi để được hỗ trợ
                </small>
                <br><small style="color: #888;">
                    💡 Gợi ý: Nhập đầy đủ số nhà, tên đường, phường/xã, quận/huyện, Hà Nội
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
        // Tọa độ chính xác của HUST (Đại học Bách khoa Hà Nội)
        const hustLat = 21.0070;
        const hustLng = 105.8430;
        const hustAddress = "Đại học Bách khoa Hà Nội, Hai Bà Trưng, Hà Nội, Việt Nam";

        console.log("Tính khoảng cách từ HUST đến:", address);

        // Chuẩn hóa địa chỉ
        const normalizedAddress = normalizeAddress(address);

        // Sử dụng Google Geocoding API để lấy tọa độ chính xác
        const geocodeResult = await geocodeAddress(normalizedAddress);

        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ");
        }

        const { lat, lng, formattedAddress } = geocodeResult;

        // Sử dụng Google Distance Matrix API để tính khoảng cách thực tế
        const distanceResult = await calculateDistanceMatrix(hustAddress, formattedAddress);

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
        console.error("Lỗi khi tính khoảng cách:", error);

        // Fallback cuối cùng: sử dụng OpenStreetMap
        return await calculateDistanceFallback(address);
    }
}

// Chuẩn hóa địa chỉ để tăng khả năng tìm kiếm
function normalizeAddress(address) {
    // Đảm bảo địa chỉ có "Hà Nội"
    if (!address.toLowerCase().includes("hà nội") && !address.toLowerCase().includes("hanoi")) {
        address = address + ", Hà Nội";
    }
    
    // Thêm "Việt Nam" nếu chưa có
    if (!address.toLowerCase().includes("việt nam") && !address.toLowerCase().includes("vietnam")) {
        address = address + ", Việt Nam";
    }
    
    return address;
}

// Geocoding sử dụng Google Maps API
async function geocodeAddress(address) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address)}&` +
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
            console.error("Geocoding thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi geocoding:", error);
        return null;
    }
}

// Tính khoảng cách sử dụng Google Distance Matrix API
async function calculateDistanceMatrix(origin, destination) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodeURIComponent(origin)}&` +
                `destinations=${encodeURIComponent(destination)}&` +
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
            console.error("Distance Matrix thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi Distance Matrix:", error);
        return null;
    }
}

// Fallback function sử dụng OpenStreetMap
async function calculateDistanceFallback(address) {
    try {
        const hustLat = 21.0070;
        const hustLng = 105.8430;

        console.log("Sử dụng OpenStreetMap fallback...");
        
        // Chuẩn hóa địa chỉ để tăng khả năng tìm thấy
        const normalizedAddress = normalizeAddress(address);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(normalizedAddress)}&` +
                `limit=5&` +
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
            // Tìm kết quả tốt nhất dựa trên độ chính xác
            let bestResult = data[0];
            let bestScore = 0;
            
            for (let result of data) {
                let score = 0;
                // Ưu tiên kết quả có "Hà Nội"
                if (result.display_name.toLowerCase().includes("hà nội") || result.display_name.toLowerCase().includes("hanoi")) {
                    score += 5;
                }
                
                // Kiểm tra xem tất cả các từ quan trọng có trong kết quả không
                const importantWords = address.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                for (let word of importantWords) {
                    if (result.display_name.toLowerCase().includes(word)) {
                        score += 1;
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestResult = result;
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
        console.error("Tính khoảng cách fallback thất bại:", error);
        return null;
    }
}

// Cải tiến hàm Haversine cho tính toán chính xác hơn
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error("Tọa độ không hợp lệ cho tính toán khoảng cách");
        return null;
    }

    const R = 6371; // Bán kính trái đất tính bằng km

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) + 
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Thêm hệ số điều chỉnh đường đi thực tế (đường không đi thẳng)
    const roadFactor = 1.3;
    return Math.round((distance * roadFactor) * 10) / 10; // Làm tròn 1 chữ số thập phân
}

// Cập nhật phí giao hàng với Google Maps
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error("Thiếu các phần tử cần thiết để tính phí ship");
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
        <span class="loading-text">📍 Đang tính khoảng cách và phí giao hàng...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, duration, foundAddress, method, isApproximate } = result;

            let methodText = "";
            let methodClass = "";
            
            if (method === "google_distance_matrix") {
                methodText = "🗺️ Google Maps";
                methodClass = "method-google";
            } else if (method === "haversine_fallback") {
                methodText = "📏 Khoảng cách thẳng";
                methodClass = "method-haversine";
            } else if (method === "openstreetmap_fallback") {
                methodText = "🌍 Bản đồ mở (ước tính)";
                methodClass = "method-osm";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
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
            throw new Error("Không thể tính khoảng cách");
        }
    } catch (error) {
        console.error("Tính khoảng cách thất bại:", error);

        distanceText.innerHTML = `
            <div class="distance-error">
                <span style="color: #ef4444;">❌ Không thể tìm thấy địa chỉ chính xác</span>
                <br><small style="color: #666;">
                    Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi để được hỗ trợ
                </small>
                <br><small style="color: #888;">
                    💡 Gợi ý: Nhập đầy đủ số nhà, tên đường, phường/xã, quận/huyện, Hà Nội
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
        // Tọa độ chính xác của HUST (Đại học Bách khoa Hà Nội)
        const hustLat = 21.0070;
        const hustLng = 105.8430;
        const hustAddress = "Đại học Bách khoa Hà Nội, Hai Bà Trưng, Hà Nội, Việt Nam";

        console.log("Tính khoảng cách từ HUST đến:", address);

        // Chuẩn hóa địa chỉ
        const normalizedAddress = normalizeAddress(address);

        // Sử dụng Google Geocoding API để lấy tọa độ chính xác
        const geocodeResult = await geocodeAddress(normalizedAddress);

        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ");
        }

        const { lat, lng, formattedAddress } = geocodeResult;

        // Sử dụng Google Distance Matrix API để tính khoảng cách thực tế
        const distanceResult = await calculateDistanceMatrix(hustAddress, formattedAddress);

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
        console.error("Lỗi khi tính khoảng cách:", error);

        // Fallback cuối cùng: sử dụng OpenStreetMap
        return await calculateDistanceFallback(address);
    }
}

// Chuẩn hóa địa chỉ để tăng khả năng tìm kiếm
function normalizeAddress(address) {
    // Đảm bảo địa chỉ có "Hà Nội"
    if (!address.toLowerCase().includes("hà nội") && !address.toLowerCase().includes("hanoi")) {
        address = address + ", Hà Nội";
    }
    
    // Thêm "Việt Nam" nếu chưa có
    if (!address.toLowerCase().includes("việt nam") && !address.toLowerCase().includes("vietnam")) {
        address = address + ", Việt Nam";
    }
    
    return address;
}

// Geocoding sử dụng Google Maps API
async function geocodeAddress(address) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address)}&` +
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
            console.error("Geocoding thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi geocoding:", error);
        return null;
    }
}

// Tính khoảng cách sử dụng Google Distance Matrix API
async function calculateDistanceMatrix(origin, destination) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodeURIComponent(origin)}&` +
                `destinations=${encodeURIComponent(destination)}&` +
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
            console.error("Distance Matrix thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi Distance Matrix:", error);
        return null;
    }
}

// Fallback function sử dụng OpenStreetMap
async function calculateDistanceFallback(address) {
    try {
        const hustLat = 21.0070;
        const hustLng = 105.8430;

        console.log("Sử dụng OpenStreetMap fallback...");
        
        // Chuẩn hóa địa chỉ để tăng khả năng tìm thấy
        const normalizedAddress = normalizeAddress(address);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(normalizedAddress)}&` +
                `limit=5&` +
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
            // Tìm kết quả tốt nhất dựa trên độ chính xác
            let bestResult = data[0];
            let bestScore = 0;
            
            for (let result of data) {
                let score = 0;
                // Ưu tiên kết quả có "Hà Nội"
                if (result.display_name.toLowerCase().includes("hà nội") || result.display_name.toLowerCase().includes("hanoi")) {
                    score += 5;
                }
                
                // Kiểm tra xem tất cả các từ quan trọng có trong kết quả không
                const importantWords = address.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                for (let word of importantWords) {
                    if (result.display_name.toLowerCase().includes(word)) {
                        score += 1;
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestResult = result;
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
        console.error("Tính khoảng cách fallback thất bại:", error);
        return null;
    }
}

// Cải tiến hàm Haversine cho tính toán chính xác hơn
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error("Tọa độ không hợp lệ cho tính toán khoảng cách");
        return null;
    }

    const R = 6371; // Bán kính trái đất tính bằng km

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) + 
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Thêm hệ số điều chỉnh đường đi thực tế (đường không đi thẳng)
    const roadFactor = 1.3;
    return Math.round((distance * roadFactor) * 10) / 10; // Làm tròn 1 chữ số thập phân
}

// Cập nhật phí giao hàng với Google Maps
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error("Thiếu các phần tử cần thiết để tính phí ship");
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
        <span class="loading-text">📍 Đang tính khoảng cách và phí giao hàng...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, duration, foundAddress, method, isApproximate } = result;

            let methodText = "";
            let methodClass = "";
            
            if (method === "google_distance_matrix") {
                methodText = "🗺️ Google Maps";
                methodClass = "method-google";
            } else if (method === "haversine_fallback") {
                methodText = "📏 Khoảng cách thẳng";
                methodClass = "method-haversine";
            } else if (method === "openstreetmap_fallback") {
                methodText = "🌍 Bản đồ mở (ước tính)";
                methodClass = "method-osm";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
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
            throw new Error("Không thể tính khoảng cách");
        }
    } catch (error) {
        console.error("Tính khoảng cách thất bại:", error);

        distanceText.innerHTML = `
            <div class="distance-error">
                <span style="color: #ef4444;">❌ Không thể tìm thấy địa chỉ chính xác</span>
                <br><small style="color: #666;">
                    Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi để được hỗ trợ
                </small>
                <br><small style="color: #888;">
                    💡 Gợi ý: Nhập đầy đủ số nhà, tên đường, phường/xã, quận/huyện, Hà Nội
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
        // Tọa độ chính xác của HUST (Đại học Bách khoa Hà Nội)
        const hustLat = 21.0070;
        const hustLng = 105.8430;
        const hustAddress = "Đại học Bách khoa Hà Nội, Hai Bà Trưng, Hà Nội, Việt Nam";

        console.log("Tính khoảng cách từ HUST đến:", address);

        // Chuẩn hóa địa chỉ
        const normalizedAddress = normalizeAddress(address);

        // Sử dụng Google Geocoding API để lấy tọa độ chính xác
        const geocodeResult = await geocodeAddress(normalizedAddress);

        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ");
        }

        const { lat, lng, formattedAddress } = geocodeResult;

        // Sử dụng Google Distance Matrix API để tính khoảng cách thực tế
        const distanceResult = await calculateDistanceMatrix(hustAddress, formattedAddress);

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
        console.error("Lỗi khi tính khoảng cách:", error);

        // Fallback cuối cùng: sử dụng OpenStreetMap
        return await calculateDistanceFallback(address);
    }
}

// Chuẩn hóa địa chỉ để tăng khả năng tìm kiếm
function normalizeAddress(address) {
    // Đảm bảo địa chỉ có "Hà Nội"
    if (!address.toLowerCase().includes("hà nội") && !address.toLowerCase().includes("hanoi")) {
        address = address + ", Hà Nội";
    }
    
    // Thêm "Việt Nam" nếu chưa có
    if (!address.toLowerCase().includes("việt nam") && !address.toLowerCase().includes("vietnam")) {
        address = address + ", Việt Nam";
    }
    
    return address;
}

// Geocoding sử dụng Google Maps API
async function geocodeAddress(address) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address)}&` +
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
            console.error("Geocoding thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi geocoding:", error);
        return null;
    }
}

// Tính khoảng cách sử dụng Google Distance Matrix API
async function calculateDistanceMatrix(origin, destination) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodeURIComponent(origin)}&` +
                `destinations=${encodeURIComponent(destination)}&` +
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
            console.error("Distance Matrix thất bại:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Lỗi Distance Matrix:", error);
        return null;
    }
}

// Fallback function sử dụng OpenStreetMap
async function calculateDistanceFallback(address) {
    try {
        const hustLat = 21.0070;
        const hustLng = 105.8430;

        console.log("Sử dụng OpenStreetMap fallback...");
        
        // Chuẩn hóa địa chỉ để tăng khả năng tìm thấy
        const normalizedAddress = normalizeAddress(address);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(normalizedAddress)}&` +
                `limit=5&` +
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
            // Tìm kết quả tốt nhất dựa trên độ chính xác
            let bestResult = data[0];
            let bestScore = 0;
            
            for (let result of data) {
                let score = 0;
                // Ưu tiên kết quả có "Hà Nội"
                if (result.display_name.toLowerCase().includes("hà nội") || result.display_name.toLowerCase().includes("hanoi")) {
                    score += 5;
                }
                
                // Kiểm tra xem tất cả các từ quan trọng có trong kết quả không
                const importantWords = address.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                for (let word of importantWords) {
                    if (result.display_name.toLowerCase().includes(word)) {
                        score += 1;
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestResult = result;
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
        console.error("Tính khoảng cách fallback thất bại:", error);
        return null;
    }
}

// Cải tiến hàm Haversine cho tính toán chính xác hơn
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error("Tọa độ không hợp lệ cho tính toán khoảng cách");
        return null;
    }

    const R = 6371; // Bán kính trái đất tính bằng km

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) + 
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Thêm hệ số điều chỉnh đường đi thực tế (đường không đi thẳng)
    const roadFactor = 1.3;
    return Math.round((distance * roadFactor) * 10) / 10; // Làm tròn 1 chữ số thập phân
}

// Cập nhật phí giao hàng với Google Maps
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error("Thiếu các phần tử cần thiết để tính phí ship");
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
        <span class="loading-text">📍 Đang tính khoảng cách và phí giao hàng...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, duration, foundAddress, method, isApproximate } = result;

            let methodText = "";
            let methodClass = "";
            
            if (method === "google_distance_matrix") {
                methodText = "🗺️ Google Maps";
                methodClass = "method-google";
            } else if (method === "haversine_fallback") {
                methodText = "📏 Khoảng cách thẳng";
                methodClass = "method-haversine";
            } else if (method === "openstreetmap_fallback") {
                methodText = "🌍 Bản đồ mở (ước tính)";
                methodClass = "method-osm";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${duration ? `<br><small>⏱️ Thời gian: ~${Math.round(duration)} phút</small>` : ""}
                        <br><small class="method-info ${methodClass}">${methodText}</small>
                        ${isApproximate ? '<br><small class="approximate-info">⚠️ Khoảng cách ước tính</small>' : ''}
                    </div>
                `;
                shippingFeeSpan.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">🚚 Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ</span>`;
            }

            // Hiển thị địa chỉ được tìm thấy nếu khác nhiều với input
            if (foundAddress && foundAddress.toLowerCase() !== address.toLowerCase()) {
                distanceText.innerHTML += `
                    <div class="found-address">
                        <small style="color: #666; font-style: italic;">
                            📍 Địa chỉ tìm thấy