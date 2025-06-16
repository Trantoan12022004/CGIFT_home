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
        
        console.log('🔍 Tính khoảng cách từ HUST đến:', address);
        
        // Chuẩn hóa địa chỉ đầu vào
        const normalizedAddress = normalizeAddressInput(address);
        
        // Thử các phương pháp tìm kiếm khác nhau
        let result = null;
        
        // Method 1: Tìm kiếm với địa chỉ đầy đủ
        result = await tryGeocoding(normalizedAddress.full);
        
        // Method 2: Tìm kiếm với địa chỉ đơn giản
        if (!result && normalizedAddress.simple) {
            console.log('🔄 Thử tìm kiếm đơn giản...');
            result = await tryGeocoding(normalizedAddress.simple);
        }
        
        // Method 3: Tìm kiếm theo keywords
        if (!result) {
            console.log('🔍 Thử tìm kiếm theo từ khóa...');
            result = await tryKeywordGeocoding(address);
        }
        
        if (result) {
            const distance = calculateHaversineDistance(hustLat, hustLng, result.lat, result.lng);
            
            return {
                distance: distance,
                foundAddress: result.display_name,
                coordinates: { lat: result.lat, lng: result.lng },
                method: result.method,
                confidence: result.confidence || 0.7
            };
        }
        
        // Fallback: Ước tính theo khu vực
        return estimateByLocation(address);
        
    } catch (error) {
        console.error('❌ Lỗi tính khoảng cách:', error);
        return estimateByLocation(address);
    }
}

// Chuẩn hóa địa chỉ đầu vào
function normalizeAddressInput(address) {
    const original = address.trim();
    
    // Tạo phiên bản đầy đủ
    let fullAddress = original;
    if (!fullAddress.toLowerCase().includes('hà nội') && !fullAddress.toLowerCase().includes('hanoi')) {
        fullAddress += ', Hà Nội';
    }
    if (!fullAddress.toLowerCase().includes('việt nam') && !fullAddress.toLowerCase().includes('vietnam')) {
        fullAddress += ', Việt Nam';
    }
    
    // Tạo phiên bản đơn giản (chỉ lấy phần đầu)
    const parts = original.split(',').map(p => p.trim());
    let simpleAddress = null;
    
    if (parts.length > 1) {
        // Lấy 1-2 phần đầu tiên + Hà Nội
        simpleAddress = parts.slice(0, 2).join(', ') + ', Hà Nội, Việt Nam';
    }
    
    return {
        full: fullAddress,
        simple: simpleAddress,
        original: original
    };
}

// Thử geocoding với Nominatim
async function tryGeocoding(searchQuery) {
    try {
        const queries = [
            // Query 1: Tìm kiếm chính xác
            {
                url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=vn&accept-language=vi`,
                method: 'exact_search'
            },
            // Query 2: Tìm kiếm với bounded box Hà Nội
            {
                url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=vn&bounded=1&viewbox=105.3,21.4,106.0,20.8`,
                method: 'bounded_search'
            }
        ];
        
        for (const query of queries) {
            console.log(`🔍 Thử: ${query.method}`);
            
            const response = await fetch(query.url, {
                headers: {
                    'User-Agent': 'CTES-SIE-SHOP/1.0 (contact@ctessie.com)'
                }
            });
            
            if (!response.ok) continue;
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                // Tìm kết quả tốt nhất
                const bestResult = findBestResult(data, searchQuery);
                if (bestResult) {
                    return {
                        lat: parseFloat(bestResult.lat),
                        lng: parseFloat(bestResult.lon),
                        display_name: bestResult.display_name,
                        method: query.method,
                        confidence: calculateResultConfidence(bestResult, searchQuery)
                    };
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Tìm kết quả tốt nhất từ danh sách
function findBestResult(results, originalQuery) {
    let bestResult = null;
    let highestScore = 0;
    
    const queryLower = originalQuery.toLowerCase();
    const queryParts = queryLower.split(/[,\s]+/).filter(part => part.length > 1);
    
    for (const result of results) {
        let score = 0;
        const displayName = result.display_name.toLowerCase();
        
        // Điểm cho việc chứa "hà nội"
        if (displayName.includes('hà nội') || displayName.includes('hanoi')) {
            score += 40;
        }
        
        // Điểm cho loại địa điểm phù hợp
        const goodTypes = ['house', 'building', 'residential', 'road', 'street', 'address', 'amenity'];
        if (goodTypes.includes(result.type) || goodTypes.includes(result.class)) {
            score += 30;
        }
        
        // Điểm cho việc match các từ khóa
        let matchedWords = 0;
        for (const part of queryParts) {
            if (part.length > 2 && displayName.includes(part)) {
                matchedWords++;
                score += 15;
            }
        }
        
        // Điểm cho importance
        if (result.importance) {
            score += result.importance * 25;
        }
        
        // Điểm cho địa chỉ có cấu trúc tốt
        if (result.address) {
            if (result.address.road || result.address.street) score += 10;
            if (result.address.house_number) score += 15;
            if (result.address.suburb || result.address.district) score += 10;
        }
        
        // Ưu tiên kết quả trong thành phố Hà Nội
        if (result.address && (
            (result.address.city && result.address.city.toLowerCase().includes('hà nội')) ||
            (result.address.state && result.address.state.toLowerCase().includes('hà nội'))
        )) {
            score += 50;
        }
        
        console.log(`Score: ${score} for ${result.display_name.substring(0, 50)}...`);
        
        if (score > highestScore) {
            highestScore = score;
            bestResult = result;
        }
    }
    
    return bestResult;
}

// Tính confidence của kết quả
function calculateResultConfidence(result, originalQuery) {
    let confidence = 0.5;
    
    const displayName = result.display_name.toLowerCase();
    const query = originalQuery.toLowerCase();
    
    // Tăng confidence dựa trên match
    const queryWords = query.split(/[,\s]+/).filter(w => w.length > 2);
    const matchedWords = queryWords.filter(word => displayName.includes(word));
    
    confidence += (matchedWords.length / queryWords.length) * 0.3;
    
    // Tăng confidence cho loại địa điểm tốt
    const goodTypes = ['house', 'building', 'residential', 'road'];
    if (goodTypes.includes(result.type)) {
        confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
}

// Tìm kiếm theo keywords
async function tryKeywordGeocoding(address) {
    try {
        const keywords = extractKeywords(address);
        
        for (const keyword of keywords) {
            const searchQuery = `${keyword}, Hà Nội, Việt Nam`;
            console.log('🔍 Keyword search:', searchQuery);
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=3&countrycodes=vn`,
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
                    display_name: result.display_name,
                    method: 'keyword_search',
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

// Trích xuất từ khóa quan trọng
function extractKeywords(address) {
    const keywords = [];
    const addressLower = address.toLowerCase();
    
    // Tìm tên đường/phố
    const streetPatterns = [
        /(\w+\s+đường)/g,
        /(\w+\s+phố)/g,
        /(đường\s+\w+)/g,
        /(phố\s+\w+)/g
    ];
    
    streetPatterns.forEach(pattern => {
        const matches = addressLower.match(pattern);
        if (matches) {
            keywords.push(...matches);
        }
    });
    
    // Tìm quận/huyện
    const districtPatterns = [
        /(quận\s+\w+)/g,
        /(huyện\s+\w+)/g,
        /(\w+\s+quận)/g,
        /(\w+\s+huyện)/g
    ];
    
    districtPatterns.forEach(pattern => {
        const matches = addressLower.match(pattern);
        if (matches) {
            keywords.push(...matches);
        }
    });
    
    // Tìm landmarks
    const landmarks = ['đại học', 'bệnh viện', 'chợ', 'công viên', 'trường', 'bưu điện'];
    landmarks.forEach(landmark => {
        if (addressLower.includes(landmark)) {
            // Lấy cả từ trước và sau landmark
            const words = addressLower.split(/\s+/);
            const landmarkIndex = words.findIndex(word => word.includes(landmark));
            if (landmarkIndex >= 0) {
                const start = Math.max(0, landmarkIndex - 1);
                const end = Math.min(words.length, landmarkIndex + 2);
                keywords.push(words.slice(start, end).join(' '));
            }
        }
    });
    
    return [...new Set(keywords)].filter(k => k.length > 3);
}

// Ước tính theo khu vực
function estimateByLocation(address) {
    const addressLower = address.toLowerCase();
    
    // Database ước tính khoảng cách chi tiết hơn
    const locationEstimates = {
        // Quận trung tâm
        'hai bà trưng': 2.5,
        'đống đa': 4.0,
        'ba đình': 5.0,
        'hoàn kiếm': 4.5,
        'thanh xuân': 6.0,
        'hoàng mai': 4.0,
        'cầu giấy': 8.0,
        'tây hồ': 7.0,
        'long biên': 7.0,
        
        // Khu vực cụ thể
        'định công': 5.0,
        'giải phóng': 4.5,
        'bach khoa': 1.0,
        'bách khoa': 1.0,
        'đại cồ việt': 0.5,
        'lê thanh nghị': 3.0,
        'phạm ngọc thạch': 2.5,
        'trần đại nghĩa': 1.5,
        
        // Huyện ngoại thành
        'đông anh': 25.0,
        'gia lâm': 15.0,
        'sóc sơn': 35.0,
        'me linh': 40.0,
        'hà đông': 18.0,
        'nam từ liêm': 12.0,
        'bắc từ liêm': 15.0,
        
        // Landmarks
        'bệnh viện bach mai': 3.0,
        'đại học quốc gia': 8.0,
        'sân bay nội bài': 45.0,
        'ga hà nội': 6.0
    };
    
    for (const [location, distance] of Object.entries(locationEstimates)) {
        if (addressLower.includes(location)) {
            console.log(`📍 Ước tính theo khu vực ${location}: ${distance}km`);
            return {
                distance: distance,
                foundAddress: `Ước tính cho khu vực ${location}`,
                coordinates: { lat: null, lng: null },
                method: 'location_estimate',
                confidence: 0.5,
                isEstimate: true
            };
        }
    }
    
    // Fallback cuối cùng
    console.log('⚠️ Sử dụng ước tính mặc định');
    return {
        distance: 8.0,
        foundAddress: 'Ước tính cho khu vực Hà Nội',
        coordinates: { lat: null, lng: null },
        method: 'default_estimate',
        confidence: 0.3,
        isEstimate: true
    };
}

// Cập nhật hàm updateShippingFee để sử dụng kết quả mới
async function updateShippingFee() {
    const addressInput = document.getElementById("address");
    const distanceInfo = document.getElementById("distanceInfo");
    const distanceText = document.getElementById("distanceText");
    const shippingFeeSpan = document.getElementById("shippingFee");

    if (!addressInput || !distanceInfo || !distanceText || !shippingFeeSpan) {
        console.error("❌ Thiếu elements cần thiết");
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
    if (address.length < 6) {
        distanceInfo.style.display = "block";
        distanceText.innerHTML = `
            <div class="distance-warning">
                ⚠️ Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 6 ký tự)
                <br><small>💡 VD: 50B Định Công, Hoàng Mai</small>
            </div>
        `;
        shippingFeeSpan.textContent = '';
        return;
    }

    // Hiển thị loading
    distanceInfo.style.display = "block";
    distanceText.innerHTML = `
        <div class="distance-loading">
            <span class="loading-icon">🔍</span>
            <span class="loading-text">Đang tìm kiếm địa chỉ và tính khoảng cách...</span>
            <div class="loading-progress"></div>
        </div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, foundAddress, method, confidence, isEstimate } = result;
            
            // Tính phí ship
            let shippingCost = 0;
            if (distance <= 5) {
                shippingCost = 0;
            } else {
                shippingCost = Math.ceil(distance - 5) * 5000;
            }
            
            shippingFee = shippingCost;
            
            // Xác định icon và text cho method
            const methodInfo = {
                'exact_search': { icon: '🎯', text: 'Tìm kiếm chính xác' },
                'bounded_search': { icon: '🗺️', text: 'Tìm kiếm trong Hà Nội' },
                'keyword_search': { icon: '🔍', text: 'Tìm kiếm từ khóa' },
                'location_estimate': { icon: '📍', text: 'Ước tính theo khu vực' },
                'default_estimate': { icon: '⚖️', text: 'Ước tính mặc định' }
            };
            
            const methodData = methodInfo[method] || { icon: '🔍', text: 'Tìm kiếm' };
            
            // Hiển thị kết quả
            distanceText.innerHTML = `
                <div class="distance-result ${shippingCost === 0 ? 'free-shipping' : ''}">
                    <div class="distance-main">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        ${isEstimate ? ' <span class="estimate-badge">Ước tính</span>' : ''}
                    </div>
                    <div class="distance-meta">
                        <small class="confidence">
                            ${methodData.icon} ${methodData.text} 
                            | 🎯 Độ tin cậy: ${Math.round(confidence * 100)}%
                        </small>
                    </div>
                    ${foundAddress && foundAddress !== `Ước tính cho khu vực ${address}` ? `
                        <div class="found-address">
                            <small>📍 Tìm thấy: ${foundAddress}</small>
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
                <div class="error-main">❌ Không thể tìm thấy địa chỉ chính xác</div>
                <div class="error-help">
                    💡 <strong>Thử cải thiện:</strong>
                    <ul>
                        <li>Thêm số nhà cụ thể (VD: "50B" thay vì chỉ "Định Công")</li>
                        <li>Ghi rõ tên đường/phố (VD: "Đường Định Công")</li>
                        <li>Thêm tên quận (VD: "Hoàng Mai", "Hai Bà Trưng")</li>
                        <li>Sử dụng tên địa điểm nổi tiếng gần đó</li>
                    </ul>
                </div>
                <div class="error-contact">
                    📞 Hoặc liên hệ: <strong>0123-456-789</strong> để được tư vấn
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

        const orderId = "MHX2025_" + ddMMyy;
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
