// Mảng chứa thông tin giỏ hàng
let cart = [];
let currentFilter = "all";

// Global variables for new features
let shippingFee = 0;
let discountAmount = 0;
let appliedDiscountCode = '';

// Discount codes database
const discountCodes = {
    'SUMMER2025': {
        type: 'percentage',
        value: 10,
        maxDiscount: 50000,
        minOrder: 200000,
        description: 'Giảm 10% tối đa 50k cho đơn từ 200k'
    },
    'NEWCUSTOMER': {
        type: 'fixed',
        value: 20000,
        maxDiscount: 20000,
        minOrder: 100000,
        description: 'Giảm 20k cho khách hàng mới'
    },
    'FREESHIP': {
        type: 'shipping',
        value: 100,
        maxDiscount: 50000,
        minOrder: 150000,
        description: 'Miễn phí ship cho đơn từ 150k'
    }
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

// Database địa chỉ mẫu cho validation (có thể mở rộng)
const HANOI_DISTRICTS = [
    'ba đình', 'hoàn kiếm', 'tây hồ', 'long biên', 'cầu giấy', 'đống đa', 
    'hai bà trưng', 'hoàng mai', 'thanh xuân', 'sóc sơn', 'đông anh',
    'gia lâm', 'nam từ liêm', 'bắc từ liêm', 'me linh', 'hà đông',
    'sơn tây', 'ba vì', 'phúc thọ', 'đan phượng', 'hoài đức',
    'quốc oai', 'thạch thất', 'chương mỹ', 'thanh oai', 'thường tín',
    'phú xuyên', 'ứng hòa', 'mỹ đức'
];

// Tính khoảng cách từ HUST (Đại học Bách khoa Hà Nội) - Cải tiến
async function calculateDistance(address) {
    try {
        // Tọa độ chính xác của số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
        const hustLat = 21.0285;
        const hustLng = 105.8542;
        
        console.log('🔍 Đang tính khoảng cách từ HUST đến:', address);
        
        // Bước 1: Chuẩn hóa địa chỉ đầu vào
        const normalizedAddress = normalizeAddress(address);
        console.log('📍 Địa chỉ chuẩn hóa:', normalizedAddress);
        
        // Bước 2: Thử multiple geocoding methods
        let result = null;
        
        // Method 1: Nominatim với địa chỉ chi tiết
        result = await tryNominatimGeocoding(normalizedAddress);
        
        // Method 2: Nếu không thành công, thử với địa chỉ đơn giản hóa
        if (!result) {
            const simplifiedAddress = simplifyAddress(address);
            console.log('🔄 Thử với địa chỉ đơn giản:', simplifiedAddress);
            result = await tryNominatimGeocoding(simplifiedAddress);
        }
        
        // Method 3: Thử tìm kiếm theo từ khóa quan trọng
        if (!result) {
            result = await tryKeywordSearch(address);
        }
        
        if (result) {
            const { lat, lng, foundAddress, confidence } = result;
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);
            
            console.log('✅ Tìm thấy tọa độ:', { lat, lng, distance });
            
            return {
                distance: distance,
                foundAddress: foundAddress,
                coordinates: { lat, lng },
                confidence: confidence,
                method: 'enhanced_nominatim'
            };
        } else {
            throw new Error('Không thể tìm thấy địa chỉ');
        }
        
    } catch (error) {
        console.error('❌ Lỗi tính khoảng cách:', error);
        
        // Fallback: Ước tính dựa trên quận/huyện
        return estimateDistanceByDistrict(address);
    }
}

// Chuẩn hóa địa chỉ đầu vào
function normalizeAddress(address) {
    let normalized = address.toLowerCase().trim();
    
    // Chuẩn hóa các từ viết tắt phổ biến
    const replacements = {
        'đ.': 'đường',
        'đ ': 'đường ',
        'p.': 'phường',
        'p ': 'phường ',
        'q.': 'quận',
        'q ': 'quận ',
        'tp.': 'thành phố',
        'tp ': 'thành phố ',
        'tx.': 'thị xã',
        'tt.': 'thị trấn',
        'khu tập thể': 'ktx',
        'chung cư': 'cc',
        'tầng': 'tang'
    };
    
    for (const [key, value] of Object.entries(replacements)) {
        normalized = normalized.replace(new RegExp(key, 'g'), value);
    }
    
    // Thêm "Hà Nội" nếu chưa có
    if (!normalized.includes('hà nội') && !normalized.includes('hanoi')) {
        normalized += ', hà nội';
    }
    
    // Thêm "Việt Nam" nếu chưa có
    if (!normalized.includes('việt nam') && !normalized.includes('vietnam')) {
        normalized += ', việt nam';
    }
    
    return normalized;
}

// Đơn giản hóa địa chỉ để tìm kiếm
function simplifyAddress(address) {
    const parts = address.split(',').map(part => part.trim());
    
    // Chỉ lấy 2-3 phần đầu tiên và thêm Hà Nội
    const simplified = parts.slice(0, 3).join(', ') + ', Hà Nội, Việt Nam';
    return simplified;
}

// Thử geocoding với Nominatim
async function tryNominatimGeocoding(address) {
    try {
        const searchQueries = [
            // Query 1: Địa chỉ đầy đủ
            `${address}`,
            // Query 2: Thêm country code
            `${address}&countrycodes=vn`,
            // Query 3: Structured search
            buildStructuredQuery(address)
        ].filter(Boolean);
        
        for (const query of searchQueries) {
            console.log('🔍 Thử query:', query);
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(query)}&` +
                `limit=5&` +
                `addressdetails=1&` +
                `countrycodes=vn&` +
                `accept-language=vi&` +
                `bounded=1&` +
                `viewbox=105.3,21.4,106.0,20.8`, // Bbox cho Hà Nội
                {
                    headers: {
                        'User-Agent': 'CTES-SIE-SHOP/1.0'
                    }
                }
            );
            
            if (!response.ok) continue;
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                // Tìm kết quả tốt nhất
                const bestResult = findBestGeocodingResult(data, address);
                if (bestResult) {
                    return {
                        lat: parseFloat(bestResult.lat),
                        lng: parseFloat(bestResult.lon),
                        foundAddress: bestResult.display_name,
                        confidence: calculateConfidence(bestResult, address)
                    };
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Nominatim geocoding failed:', error);
        return null;
    }
}

// Xây dựng structured query
function buildStructuredQuery(address) {
    const parts = address.toLowerCase().split(',').map(s => s.trim());
    
    // Tìm số nhà/đường
    let street = '';
    let district = '';
    let city = 'hà nội';
    
    for (const part of parts) {
        if (part.includes('đường') || part.includes('phố') || /^\d+/.test(part)) {
            street = part;
        } else if (part.includes('quận') || part.includes('huyện') || 
                   HANOI_DISTRICTS.some(d => part.includes(d))) {
            district = part;
        }
    }
    
    if (street && district) {
        return `street=${encodeURIComponent(street)}&district=${encodeURIComponent(district)}&city=${encodeURIComponent(city)}&country=vietnam`;
    }
    
    return null;
}

// Tìm kết quả geocoding tốt nhất
function findBestGeocodingResult(results, originalAddress) {
    let bestResult = null;
    let highestScore = 0;
    
    for (const result of results) {
        let score = 0;
        const displayName = result.display_name.toLowerCase();
        const address = originalAddress.toLowerCase();
        
        // Điểm cho việc có chứa "hà nội"
        if (displayName.includes('hà nội') || displayName.includes('hanoi')) {
            score += 30;
        }
        
        // Điểm cho class/type phù hợp
        const preferredTypes = ['house', 'building', 'residential', 'address', 'street'];
        if (preferredTypes.includes(result.class) || preferredTypes.includes(result.type)) {
            score += 20;
        }
        
        // Điểm cho việc match keywords
        const addressParts = address.split(/[,\s]+/);
        for (const part of addressParts) {
            if (part.length > 2 && displayName.includes(part)) {
                score += 10;
            }
        }
        
        // Điểm cho importance
        if (result.importance) {
            score += result.importance * 20;
        }
        
        // Ưu tiên kết quả trong Hà Nội
        if (result.address && result.address.state && 
            (result.address.state.toLowerCase().includes('hà nội') || 
             result.address.state.toLowerCase().includes('hanoi'))) {
            score += 40;
        }
        
        console.log(`🎯 Result score: ${score} for ${result.display_name}`);
        
        if (score > highestScore) {
            highestScore = score;
            bestResult = result;
        }
    }
    
    return bestResult;
}

// Tính confidence score
function calculateConfidence(result, originalAddress) {
    let confidence = 0.5; // Base confidence
    
    const displayName = result.display_name.toLowerCase();
    const address = originalAddress.toLowerCase();
    
    // Tăng confidence nếu match keywords
    const addressParts = address.split(/[,\s]+/).filter(part => part.length > 2);
    const matchedParts = addressParts.filter(part => displayName.includes(part));
    
    confidence += (matchedParts.length / addressParts.length) * 0.4;
    
    // Tăng confidence cho loại địa chỉ tốt
    const goodTypes = ['house', 'building', 'residential', 'address'];
    if (goodTypes.includes(result.type) || goodTypes.includes(result.class)) {
        confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
}

// Tìm kiếm theo từ khóa
async function tryKeywordSearch(address) {
    try {
        // Trích xuất từ khóa quan trọng
        const keywords = extractKeywords(address);
        
        for (const keyword of keywords) {
            const query = `${keyword}, Hà Nội, Việt Nam`;
            console.log('🔍 Keyword search:', query);
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&` +
                `q=${encodeURIComponent(query)}&` +
                `limit=3&` +
                `countrycodes=vn`,
                {
                    headers: {
                        'User-Agent': 'CTES-SIE-SHOP/1.0'
                    }
                }
            );
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                return {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    foundAddress: result.display_name,
                    confidence: 0.6
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('Keyword search failed:', error);
        return null;
    }
}

// Trích xuất từ khóa quan trọng từ địa chỉ
function extractKeywords(address) {
    const parts = address.toLowerCase().split(/[,\s]+/);
    const keywords = [];
    
    // Tìm tên đường/phố
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes('đường') || part.includes('phố')) {
            // Lấy cả đường và từ trước nó
            if (i > 0) {
                keywords.push(`${parts[i-1]} ${part}`);
            }
            keywords.push(part);
        }
    }
    
    // Tìm quận/huyện
    for (const part of parts) {
        if (part.includes('quận') || part.includes('huyện')) {
            keywords.push(part);
        }
    }
    
    // Tìm landmarks
    const landmarks = ['trường', 'bệnh viện', 'chợ', 'công viên', 'trung tâm'];
    for (const part of parts) {
        for (const landmark of landmarks) {
            if (part.includes(landmark)) {
                keywords.push(part);
            }
        }
    }
    
    return keywords.filter(k => k.length > 3);
}

// Ước tính khoảng cách theo quận/huyện
function estimateDistanceByDistrict(address) {
    const addressLower = address.toLowerCase();
    
    // Database ước tính khoảng cách từ HUST đến các quận/huyện
    const districtDistances = {
        'hai bà trưng': 2.5,
        'đống đa': 4.0,
        'ba đình': 5.0,
        'hoàn kiếm': 4.5,
        'cầu giấy': 8.0,
        'tây hồ': 7.0,
        'thanh xuân': 6.0,
        'hoàng mai': 4.0,
        'long biên': 7.0,
        'nam từ liêm': 12.0,
        'bắc từ liêm': 15.0,
        'hà đông': 18.0,
        'định công': 5.0, // Thêm Định Công
        'giải phóng': 4.5,
        'bach khoa': 1.0,
        'bách khoa': 1.0
    };
    
    for (const [district, distance] of Object.entries(districtDistances)) {
        if (addressLower.includes(district)) {
            console.log(`📍 Ước tính khoảng cách theo quận ${district}: ${distance}km`);
            return {
                distance: distance,
                foundAddress: `Ước tính cho khu vực ${district}`,
                coordinates: { lat: null, lng: null },
                confidence: 0.4,
                method: 'district_estimation',
                isEstimate: true
            };
        }
    }
    
    // Fallback cuối cùng
    console.log('⚠️ Không thể xác định địa chỉ, sử dụng ước tính mặc định');
    return {
        distance: 8.0, // Ước tính trung bình cho Hà Nội
        foundAddress: 'Ước tính cho khu vực Hà Nội',
        coordinates: { lat: null, lng: null },
        confidence: 0.2,
        method: 'default_estimate',
        isEstimate: true
    };
}

// Cải tiến hàm Haversine với validation tốt hơn
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    // Validation đầu vào
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        console.error('❌ Tọa độ không hợp lệ:', { lat1, lon1, lat2, lon2 });
        return null;
    }
    
    // Kiểm tra tọa độ có hợp lý không (trong phạm vi Việt Nam)
    if (lat1 < 8 || lat1 > 24 || lon1 < 102 || lon1 > 110 ||
        lat2 < 8 || lat2 > 24 || lon2 < 102 || lon2 > 110) {
        console.warn('⚠️ Tọa độ ngoài phạm vi Việt Nam:', { lat1, lon1, lat2, lon2 });
    }
    
    const R = 6371; // Bán kính trái đất (km)
    
    // Chuyển đổi sang radian
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLatRad = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLonRad = ((lon2 - lon1) * Math.PI) / 180;
    
    // Công thức Haversine
    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Làm tròn và validate kết quả
    const roundedDistance = Math.round(distance * 100) / 100;
    
    // Kiểm tra kết quả có hợp lý không
    if (roundedDistance < 0 || roundedDistance > 1000) {
        console.warn('⚠️ Khoảng cách bất thường:', roundedDistance);
        return null;
    }
    
    console.log(`📏 Khoảng cách Haversine: ${roundedDistance}km`);
    return roundedDistance;
}

// Cập nhật hàm updateShippingFee với UX tốt hơn
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error('❌ Thiếu elements cần thiết');
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
    if (address.length < 8) {
        distanceInfo.style.display = "block";
        distanceText.innerHTML = `
            <div class="distance-warning">
                ⚠️ Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 8 ký tự)
                <br><small>💡 Ví dụ: 50B Định Công, Hoàng Mai, Hà Nội</small>
            </div>
        `;
        shippingFeeSpan.textContent = '';
        return;
    }

    // Hiển thị loading với animation đẹp hơn
    distanceInfo.style.display = "block";
    distanceText.innerHTML = `
        <div class="distance-loading">
            <span class="loading-icon">🔍</span>
            <span class="loading-text">Đang tính toán khoảng cách...</span>
            <div class="loading-progress"></div>
        </div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, foundAddress, confidence, method, isEstimate } = result;
            
            // Tính phí ship
            let shippingCost = 0;
            if (distance <= 5) {
                shippingCost = 0;
            } else {
                shippingCost = Math.ceil(distance - 5) * 5000;
            }
            
            shippingFee = shippingCost;
            
            // Hiển thị kết quả với thông tin chi tiết
            const confidenceText = confidence >= 0.8 ? 'Chính xác cao' : 
                                  confidence >= 0.6 ? 'Khá chính xác' : 
                                  confidence >= 0.4 ? 'Ước tính' : 'Ước tính thô';
            
            const methodText = {
                'enhanced_nominatim': '🗺️ Bản đồ OSM',
                'district_estimation': '📍 Ước tính theo quận',
                'default_estimate': '⚖️ Ước tính mặc định'
            }[method] || '🔍 Tìm kiếm';
            
            distanceText.innerHTML = `
                <div class="distance-result ${shippingCost === 0 ? 'free-shipping' : ''}">
                    <div class="distance-main">
                        <strong>📍 Khoảng cách: ${distance}km</strong>
                        ${isEstimate ? ' <span class="estimate-badge">Ước tính</span>' : ''}
                    </div>
                    <div class="distance-meta">
                        <small class="confidence">🎯 ${confidenceText} | ${methodText}</small>
                    </div>
                    ${foundAddress !== address ? `
                        <div class="found-address">
                            <small>📍 Đã tìm: ${foundAddress}</small>
                        </div>
                    ` : ''}
                </div>
            `;
            
            if (shippingCost === 0) {
                shippingFeeSpan.innerHTML = `
                    <span class="free-shipping-text">
                        🎉 Miễn phí giao hàng!
                    </span>
                `;
            } else {
                shippingFeeSpan.innerHTML = `
                    <span class="shipping-fee-text">
                        🚚 Phí ship: ${shippingCost.toLocaleString("vi-VN")}đ
                        <small>(5.000đ/km sau 5km đầu)</small>
                    </span>
                `;
            }
            
        } else {
            throw new Error('Không thể tính khoảng cách');
        }
    } catch (error) {
        console.error('❌ Lỗi tính khoảng cách:', error);
        
        distanceText.innerHTML = `
            <div class="distance-error">
                <div class="error-main">❌ Không thể tính khoảng cách chính xác</div>
                <div class="error-help">
                    💡 <strong>Gợi ý cải thiện:</strong>
                    <ul>
                        <li>Thêm số nhà cụ thể (VD: 50B thay vì chỉ "Định Công")</li>
                        <li>Ghi rõ tên đường/phố</li>
                        <li>Thêm tên quận/huyện</li>
                    </ul>
                </div>
                <div class="error-contact">
                    📞 Hoặc liên hệ với chúng tôi để được hỗ trợ tính phí ship chính xác
                </div>
            </div>
        `;
        shippingFeeSpan.innerHTML = `
            <span class="manual-shipping">
                📋 Phí ship sẽ được xác nhận qua điện thoại
            </span>
        `;
        shippingFee = 0;
    }

    updatePaymentSummary();
}

// Thêm CSS cho các hiệu ứng mới
const distanceCalculationCSS = `
    <style>
        .distance-loading {
            background: linear-gradient(135deg, #e1f5fe, #f0f9ff);
            padding: 15px;
            border-radius: 12px;
            border-left: 4px solid #0ea5e9;
            text-align: center;
        }
        
        .loading-icon {
            font-size: 1.2rem;
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loading-text {
            margin-left: 8px;
            color: #0369a1;
            font-weight: 500;
        }
        
        .loading-progress {
            margin-top: 8px;
            height: 3px;
            background: #e1f5fe;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .loading-progress::after {
            content: '';
            display: block;
            height: 100%;
            background: linear-gradient(90deg, #0ea5e9, #06b6d4);
            animation: progress 2s ease-in-out infinite;
        }
        
        @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .distance-result {
            background: linear-gradient(135deg, #f0f9ff, #e0f7fa);
            padding: 15px;
            border-radius: 12px;
            border-left: 4px solid #0ea5e9;
        }
        
        .distance-result.free-shipping {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-left-color: #10b981;
        }
        
        .distance-main {
            margin-bottom: 8px;
        }
        
        .distance-meta {
            margin-bottom: 8px;
        }
        
        .estimate-badge {
            background: #fbbf24;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .confidence {
            color: #6b7280;
            font-size: 0.8rem;
        }
        
        .found-address {
            margin-top: 8px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 6px;
            border: 1px dashed #d1d5db;
        }
        
        .distance-warning {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            padding: 12px;
            border-radius: 10px;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }
        
        .distance-error {
            background: linear-gradient(135deg, #fef2f2, #fee2e2);
            padding: 15px;
            border-radius: 12px;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }
        
        .error-main {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .error-help ul {
            margin: 8px 0;
            padding-left: 20px;
        }
        
        .error-help li {
            margin-bottom: 4px;
        }
        
        .error-contact {
            margin-top: 10px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .free-shipping-text {
            color: #10b981;
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .shipping-fee-text {
            color: #f59e0b;
            font-weight: bold;
        }
        
        .shipping-fee-text small {
            display: block;
            color: #6b7280;
            font-weight: normal;
            font-size: 0.8rem;
            margin-top: 2px;
        }
        
        .manual-shipping {
            color: #6b7280;
            font-style: italic;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
`;

// Thêm CSS khi trang load
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('#distance-calculation-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'distance-calculation-styles';
        styleElement.innerHTML = distanceCalculationCSS;
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
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Hà Nội, Việt Nam')}&limit=1`
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            
            // Tính khoảng cách bằng công thức Haversine
            const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);
            return distance;
        } else {
            throw new Error('Không tìm thấy địa chỉ');
        }
    } catch (error) {
        console.error('Error calculating distance:', error);
        return null;
    }
}

// Công thức Haversine để tính khoảng cách giữa hai điểm
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

// Cập nhật phí giao hàng dựa trên khoảng cách
async function updateShippingFee() {
    const addressInput = document.getElementById('address');
    const distanceInfo = document.getElementById('distanceInfo');
    const distanceText = document.getElementById('distanceText');
    const shippingFeeSpan = document.getElementById('shippingFee');
    
    if (!addressInput.value.trim()) {
        distanceInfo.style.display = 'none';
        shippingFee = 0;
        updatePaymentSummary();
        return;
    }
    
    // Hiển thị loading
    distanceInfo.style.display = 'block';
    distanceText.textContent = '📍 Đang tính khoảng cách...';
    shippingFeeSpan.textContent = '';
    
    try {
        const distance = await calculateDistance(addressInput.value);
        
        if (distance !== null) {
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.textContent = `📍 Khoảng cách: ${distance.toFixed(1)}km`;
                shippingFeeSpan.textContent = '🎉 Miễn phí giao hàng!';
                shippingFeeSpan.style.color = '#10b981';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.textContent = `📍 Khoảng cách: ${distance.toFixed(1)}km`;
                shippingFeeSpan.textContent = `🚚 Phí ship: ${shippingFee.toLocaleString('vi-VN')}đ`;
                shippingFeeSpan.style.color = '#f59e0b';
            }
        } else {
            distanceText.textContent = '⚠️ Không thể tính khoảng cách';
            shippingFeeSpan.textContent = 'Vui lòng nhập địa chỉ chi tiết hơn';
            shippingFee = 0;
        }
    } catch (error) {
        distanceText.textContent = '⚠️ Lỗi tính khoảng cách';
        shippingFeeSpan.textContent = 'Phí ship sẽ được tính khi giao hàng';
        shippingFee = 0;
    }
    
    updatePaymentSummary();
}

// Áp dụng mã giảm giá
function applyDiscountCode() {
    const codeInput = document.getElementById('discountCode');
    const statusDiv = document.getElementById('discountStatus');
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        statusDiv.className = 'discount-status error';
        statusDiv.textContent = '⚠️ Vui lòng nhập mã giảm giá';
        statusDiv.style.display = 'block';
        return;
    }
    
    const currentSubtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    
    if (discountCodes[code]) {
        const discount = discountCodes[code];
        
        // Kiểm tra yêu cầu đơn hàng tối thiểu
        if (currentSubtotal < discount.minOrder) {
            statusDiv.className = 'discount-status error';
            statusDiv.textContent = `⚠️ Đơn hàng tối thiểu ${discount.minOrder.toLocaleString('vi-VN')}đ để sử dụng mã này`;
            statusDiv.style.display = 'block';
            return;
        }
        
        // Tính toán giảm giá
        let calculatedDiscount = 0;
        if (discount.type === 'percentage') {
            calculatedDiscount = Math.min((currentSubtotal * discount.value / 100), discount.maxDiscount);
        } else if (discount.type === 'fixed') {
            calculatedDiscount = discount.value;
        } else if (discount.type === 'shipping') {
            calculatedDiscount = Math.min(shippingFee, discount.maxDiscount);
        }
        
        discountAmount = calculatedDiscount;
        appliedDiscountCode = code;
        
        statusDiv.className = 'discount-status success';
        statusDiv.textContent = `✅ Áp dụng thành công! ${discount.description}`;
        statusDiv.style.display = 'block';
        
        codeInput.disabled = true;
        document.querySelector('.apply-discount-btn').textContent = 'Đã áp dụng';
        document.querySelector('.apply-discount-btn').disabled = true;
        
    } else {
        statusDiv.className = 'discount-status error';
        statusDiv.textContent = '❌ Mã giảm giá không hợp lệ';
        statusDiv.style.display = 'block';
        discountAmount = 0;
        appliedDiscountCode = '';
    }
    
    updatePaymentSummary();
}

// Cập nhật tóm tắt thanh toán
function updatePaymentSummary() {
    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    
    // Cập nhật các phần tử hiển thị
    document.getElementById('subtotal').textContent = subtotal.toLocaleString('vi-VN') + ' VND';
    document.getElementById('shippingFeeDisplay').textContent = shippingFee.toLocaleString('vi-VN') + ' VND';
    
    // Xử lý hiển thị giảm giá
    const discountRow = document.getElementById('discountRow');
    const discountAmountSpan = document.getElementById('discountAmount');
    
    if (discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountAmountSpan.textContent = '-' + discountAmount.toLocaleString('vi-VN') + ' VND';
    } else {
        discountRow.style.display = 'none';
    }
    
    // Tính toán tổng cộng cuối cùng
    const finalTotal = subtotal + shippingFee - discountAmount;
    document.getElementById('finalTotal').textContent = finalTotal.toLocaleString('vi-VN') + ' VND';
    document.getElementById('totalAmount').value = finalTotal.toLocaleString('vi-VN') + ' VND';
    
    // Hiển thị thông báo giảm giá cho đơn hàng >= 200k
    const discountAlert = document.getElementById('discountAlert');
    if (subtotal >= 200000 && !appliedDiscountCode) {
        discountAlert.style.display = 'block';
    } else if (subtotal < 200000) {
        discountAlert.style.display = 'none';
    }
    
    // Cập nhật QR amount
    updateVietQR(finalTotal);
}

// Xử lý thay đổi phương thức thanh toán
function handlePaymentMethodChange() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const vietqrSection = document.getElementById('vietqrSection');
    
    if (paymentMethod === 'bank') {
        vietqrSection.style.display = 'block';
        const finalTotal = cart.reduce((total, item) => total + item.totalPrice, 0) + shippingFee - discountAmount;
        updateVietQR(finalTotal);
    } else {
        vietqrSection.style.display = 'none';
    }
}

// Cập nhật VietQR
function updateVietQR(amount) {
    const qrAmount = document.getElementById('qrAmount');
    const qrContent = document.getElementById('qrContent');
    const qrCode = document.getElementById('qrCode');
    
    if (amount > 0) {
        qrAmount.textContent = amount.toLocaleString('vi-VN') + ' VND';
        
        // Tạo ID đơn hàng
        const orderId = 'MHX' + Date.now().toString().slice(-6);
        qrContent.textContent = `${orderId} MHX2025`;
        
        // Tạo URL VietQR
        const bankId = '970436'; // Vietcombank
        const accountNo = '1234567890';
        const template = 'compact2';
        const description = encodeURIComponent(`${orderId} MHX2025`);
        
        const vietqrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${description}&accountName=CTES-SIE%20SHOP`;
        
        qrCode.innerHTML = `<img src="${vietqrUrl}" alt="VietQR Code" style="max-width: 100%; height: auto;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjc3NDhGIiBmb250LXNizemU9IjE0Ij5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4='" />`;
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
        cartItemsString += `Sản phẩm ${index + 1}: ${item.productName}, SL: ${item.quantity}, Giá: ${item.price.toLocaleString("vi-VN")}đ, Tổng: ${item.totalPrice.toLocaleString("vi-VN")}đ; `;
    });

    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    const finalTotal = subtotal + shippingFee - discountAmount;
    const note = document.getElementById("note").value;

    const orderData = {
        fullName: fullName,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        subtotal: subtotal.toLocaleString('vi-VN') + " VND",
        shippingFee: shippingFee.toLocaleString('vi-VN') + " VND",
        discountCode: appliedDiscountCode,
        discountAmount: discountAmount.toLocaleString('vi-VN') + " VND",
        totalAmount: finalTotal.toLocaleString("vi-VN") + " VND",
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
            shippingFee = 0;
            discountAmount = 0;
            appliedDiscountCode = '';
            document.getElementById("paymentForm").reset();
            document.getElementById('discountCode').disabled = false;
            document.querySelector('.apply-discount-btn').disabled = false;
            document.querySelector('.apply-discount-btn').textContent = 'Áp dụng';
            document.getElementById('discountStatus').style.display = 'none';
            document.getElementById('distanceInfo').style.display = 'none';
            document.getElementById('vietqrSection').style.display = 'none';
            document.getElementById('discountAlert').style.display = 'none';
            
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
    const addressInput = document.getElementById('address');
    if (addressInput) {
        let addressTimeout;
        addressInput.addEventListener('input', function() {
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
