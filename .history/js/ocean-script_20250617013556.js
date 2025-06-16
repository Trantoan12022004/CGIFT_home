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

// Cấu hình cho tính khoảng cách - sử dụng multiple APIs
const DISTANCE_CONFIG = {
    // Tọa độ chính xác của HUST (kiểm tra bằng Google Maps)
    HUST_COORDINATES: {
        lat: 21.005054,
        lng: 105.843262,
        name: "Đại học Bách khoa Hà Nội, 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
    },
    
    // Danh sách địa điểm tham chiếu cho Hà Nội (để cải thiện độ chính xác)
    REFERENCE_POINTS: {
        "hoàn kiếm": { lat: 21.028511, lng: 105.854004 },
        "đống đa": { lat: 21.023659, lng: 105.834114 },
        "hai bà trưng": { lat: 21.003000, lng: 105.854530 },
        "hoàng mai": { lat: 20.981000, lng: 105.868000 },
        "thanh xuân": { lat: 20.988889, lng: 105.804444 },
        "cầu giấy": { lat: 21.034722, lng: 105.795278 },
        "ba đình": { lat: 21.035000, lng: 105.835000 },
        "tây hồ": { lat: 21.075000, lng: 105.820000 }
    }
};

// Chuẩn hóa địa chỉ Việt Nam
function normalizeVietnameseAddress(address) {
    if (!address) return "";
    
    let normalized = address.trim()
        // Chuẩn hóa các từ viết tắt
        .replace(/\b(st|str|no\.?|số)\s*/gi, "")
        .replace(/\b(p|ph|phường)\s*/gi, "phường ")
        .replace(/\b(q|quan|quận)\s*/gi, "quận ")
        .replace(/\b(h|huyen|huyện)\s*/gi, "huyện ")
        .replace(/\b(tp|thành phố)\s*/gi, "thành phố ")
        .replace(/\b(hn|hà nội|hanoi)\b/gi, "Hà Nội")
        // Xử lý các tên đường phổ biến
        .replace(/\b(đ|đường)\s*/gi, "đường ")
        .replace(/\b(ng|ngõ)\s*/gi, "ngõ ")
        .replace(/\b(tt|thị trấn)\s*/gi, "thị trấn ")
        // Loại bỏ khoảng trắng thừa
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .trim();
    
    // Đảm bảo có "Hà Nội"
    if (!normalized.toLowerCase().includes("hà nội")) {
        normalized += ", Hà Nội";
    }
    
    return normalized;
}

// Geocoding sử dụng MapBox API (miễn phí 100,000 requests/tháng)
async function geocodeWithMapBox(address) {
    try {
        const mapboxToken = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"; // Public token
        
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
            `country=vn&` +
            `proximity=105.8431,21.0054&` +
            `bbox=105.3,20.5,106.0,21.5&` +
            `access_token=${mapboxToken}`
        );
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            return {
                lat: feature.center[1],
                lng: feature.center[0],
                formattedAddress: feature.place_name,
                confidence: feature.relevance > 0.8 ? "high" : "medium",
                source: "mapbox"
            };
        }
    } catch (error) {
        console.log("MapBox geocoding failed:", error.message);
    }
    return null;
}

// Geocoding sử dụng LocationIQ (miễn phí 5000 requests/ngày)
async function geocodeWithLocationIQ(address) {
    try {
        const response = await fetch(
            `https://eu1.locationiq.com/v1/search.php?` +
            `key=pk.0f147952a41c209c5101b5bf654e938e&` + // Demo key
            `q=${encodeURIComponent(address)}&` +
            `format=json&` +
            `countrycodes=vn&` +
            `addressdetails=1&` +
            `limit=3&` +
            `viewbox=105.3,20.5,106.0,21.5&` +
            `bounded=1`
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            // Tìm kết quả tốt nhất cho Hà Nội
            let bestResult = data[0];
            for (const result of data) {
                if (result.display_name.toLowerCase().includes("hà nội") || 
                    result.display_name.toLowerCase().includes("hanoi")) {
                    bestResult = result;
                    break;
                }
            }
            
            return {
                lat: parseFloat(bestResult.lat),
                lng: parseFloat(bestResult.lon),
                formattedAddress: bestResult.display_name,
                confidence: bestResult.importance > 0.6 ? "medium" : "low",
                source: "locationiq"
            };
        }
    } catch (error) {
        console.log("LocationIQ geocoding failed:", error.message);
    }
    return null;
}

// Geocoding sử dụng Photon (OSM-based, hoàn toàn miễn phí)
async function geocodeWithPhoton(address) {
    try {
        const response = await fetch(
            `https://photon.komoot.io/api/?` +
            `q=${encodeURIComponent(address)}&` +
            `lat=21.0054&lon=105.8431&` +
            `limit=5&` +
            `bbox=105.3,20.5,106.0,21.5`
        );
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            // Tìm kết quả tốt nhất
            let bestFeature = data.features[0];
            let bestScore = 0;
            
            for (const feature of data.features) {
                let score = 0;
                const props = feature.properties;
                
                // Ưu tiên kết quả có country = Vietnam
                if (props.country === "Vietnam" || props.country === "Việt Nam") {
                    score += 10;
                }
                
                // Ưu tiên kết quả có state/city = Hanoi
                if (props.state === "Hanoi" || props.city === "Hanoi" || 
                    props.state === "Hà Nội" || props.city === "Hà Nội") {
                    score += 15;
                }
                
                // Ưu tiên địa chỉ cụ thể hơn
                if (props.housenumber) score += 5;
                if (props.street) score += 3;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestFeature = feature;
                }
            }
            
            return {
                lat: bestFeature.geometry.coordinates[1],
                lng: bestFeature.geometry.coordinates[0],
                formattedAddress: bestFeature.properties.name || 
                                 `${bestFeature.properties.street || ""}, ${bestFeature.properties.city || "Hà Nội"}`,
                confidence: bestScore > 10 ? "medium" : "low",
                source: "photon"
            };
        }
    } catch (error) {
        console.log("Photon geocoding failed:", error.message);
    }
    return null;
}

// Geocoding thông minh với district matching
async function geocodeWithDistrictMatching(address) {
    const normalizedAddress = normalizeVietnameseAddress(address);
    
    // Tìm quận/huyện trong địa chỉ
    let detectedDistrict = null;
    for (const [district, coords] of Object.entries(DISTANCE_CONFIG.REFERENCE_POINTS)) {
        if (normalizedAddress.toLowerCase().includes(district)) {
            detectedDistrict = { name: district, ...coords };
            break;
        }
    }
    
    if (detectedDistrict) {
        // Sử dụng tọa độ tham chiếu của quận + offset nhỏ
        const offset = 0.005; // ~500m
        return {
            lat: detectedDistrict.lat + (Math.random() - 0.5) * offset,
            lng: detectedDistrict.lng + (Math.random() - 0.5) * offset,
            formattedAddress: `${normalizedAddress} (ước tính dựa trên ${detectedDistrict.name})`,
            confidence: "low",
            source: "district_matching"
        };
    }
    
    return null;
}

// Hàm geocoding tổng hợp
async function comprehensiveGeocode(address) {
    const normalizedAddress = normalizeVietnameseAddress(address);
    console.log("Geocoding address:", normalizedAddress);
    
    // Thử các API theo thứ tự ưu tiên
    const geocoders = [
        () => geocodeWithMapBox(normalizedAddress),
        () => geocodeWithLocationIQ(normalizedAddress),
        () => geocodeWithPhoton(normalizedAddress),
        () => geocodeWithDistrictMatching(normalizedAddress)
    ];
    
    for (const geocoder of geocoders) {
        try {
            const result = await geocoder();
            if (result && result.lat && result.lng) {
                console.log("Geocoding success:", result);
                return result;
            }
        } catch (error) {
            console.log("Geocoder failed:", error.message);
        }
    }
    
    return null;
}

// Cải thiện tính khoảng cách với hệ số điều chỉnh
function calculateEnhancedDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        return null;
    }

    const R = 6371; // Bán kính trái đất
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let distance = R * c;
    
    // Áp dụng hệ số điều chỉnh cho khoảng cách thực tế tại Hà Nội
    // (do đường xá không thẳng, tắc đường, etc.)
    const adjustmentFactor = 1.3; // Tăng 30% so với khoảng cách thẳng
    distance = distance * adjustmentFactor;
    
    return Math.round(distance * 100) / 100;
}

// Hàm tính khoảng cách chính
async function calculateDistance(address) {
    try {
        const { lat: hustLat, lng: hustLng } = DISTANCE_CONFIG.HUST_COORDINATES;
        
        console.log("Calculating distance from HUST to:", address);
        
        const geocodeResult = await comprehensiveGeocode(address);
        
        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ với tất cả các phương thức");
        }

        const { lat, lng, formattedAddress, source, confidence } = geocodeResult;
        
        // Kiểm tra tọa độ có hợp lý (trong phạm vi mở rộng của Hà Nội)
        if (lat < 20.3 || lat > 21.7 || lng < 105.0 || lng > 106.2) {
            console.warn("Tọa độ nằm ngoài vùng Hà Nội mở rộng:", { lat, lng });
        }
        
        const distance = calculateEnhancedDistance(hustLat, hustLng, lat, lng);
        
        if (distance === null) {
            throw new Error("Không thể tính khoảng cách");
        }
        
        return {
            distance: distance,
            foundAddress: formattedAddress,
            coordinates: { lat, lng },
            source: source,
            confidence: confidence,
            method: "enhanced_haversine"
        };
        
    } catch (error) {
        console.error("Distance calculation failed:", error);
        throw error;
    }
}

// Cập nhật hàm updateShippingFee
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

    // Validation địa chỉ
    if (address.length < 10) {
        distanceInfo.style.display = "block";
        distanceText.innerHTML = '<span style="color: #f59e0b;">⚠️ Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 10 ký tự)</span>';
        shippingFeeSpan.textContent = "";
        return;
    }

    // Hiển thị loading
    distanceInfo.style.display = "block";
    distanceText.innerHTML = `
        <span class="loading-text">📍 Đang định vị địa chỉ...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, foundAddress, source, confidence } = result;

            // Icon và text theo nguồn
            const sourceInfo = {
                mapbox: { icon: "🗺️", name: "MapBox" },
                locationiq: { icon: "🌐", name: "LocationIQ" },
                photon: { icon: "🌍", name: "OpenStreetMap" },
                district_matching: { icon: "📍", name: "Ước tính theo quận" }
            };
            
            const sourceData = sourceInfo[source] || { icon: "📍", name: "Khác" };
            
            let confidenceText = "";
            if (confidence === "high") {
                confidenceText = " (Độ chính xác cao)";
            } else if (confidence === "medium") {
                confidenceText = " (Độ chính xác trung bình)";
            } else {
                confidenceText = " (Ước tính)";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        <br><small class="method-info">${sourceData.icon} ${sourceData.name}${confidenceText}</small>
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        <br><small class="method-info">${sourceData.icon} ${sourceData.name}${confidenceText}</small>
                    </div>
                `;
                shippingFeeSpan.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">🚚 Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ</span>`;
            }

            // Hiển thị địa chỉ tìm thấy nếu khác nhiều với input
            if (foundAddress && !foundAddress.toLowerCase().includes(address.toLowerCase().substring(0, 15))) {
                distanceText.innerHTML += `
                    <div class="found-address">
                        <small style="color: #666; font-style: italic;">
                            📍 Địa chỉ đã tìm: ${foundAddress}
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
                <span style="color: #ef4444;">❌ Không thể xác định vị trí địa chỉ</span>
                <br><small style="color: #666;">
                    Vui lòng kiểm tra lại địa chỉ hoặc liên hệ để được hỗ trợ
                </small>
                <br><small style="color: #888;">
                    💡 Ví dụ: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
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
    if (subtotal >= 200000 && !appliedDiscountCode) {
        discountAlert.style.display = "block";
    } else if (subtotal < 200000) {
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
