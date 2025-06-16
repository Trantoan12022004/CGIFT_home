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

// Hệ thống mã giảm giá mới - sinh ngẫu nhiên và tracking
const DISCOUNT_SYSTEM = {
    // Lưu trữ mã đã sử dụng (trong thực tế nên lưu vào database)
    usedCodes: JSON.parse(localStorage.getItem("usedDiscountCodes") || "[]"),

    // Các loại mã giảm giá có thể sinh ra theo tầng
    discountTiers: {
        // Tầng 100k - chỉ freeship
        tier100k: [
            {
                type: "shipping",
                value: 100,
                maxDiscount: 25000,
                description: "Miễn phí ship tối đa 25k",
                code: "FREESHIP",
            },
        ],

        // Tầng 200k - freeship + summer combo
        tier200k: [
            {
                type: "shipping",
                value: 100,
                maxDiscount: 30000,
                description: "Miễn phí ship tối đa 30k",
                code: "FREESHIP",
            },
            {
                type: "percentage",
                value: 10,
                maxDiscount: 50000,
                description: "Giảm 10% tối đa 50k",
                code: "SUMMER2025",
            },
        ],

        // Tầng 300k+ - premium discounts
        tier300k: [
            {
                type: "percentage",
                value: 15,
                maxDiscount: 75000,
                description: "Giảm 15% tối đa 75k",
            },
            {
                type: "fixed",
                value: 50000,
                description: "Giảm cố định 50k",
            },
            {
                type: "shipping",
                value: 100,
                maxDiscount: 50000,
                description: "Miễn phí ship tối đa 50k",
            },
        ],
    },

    // Sinh mã giảm giá ngẫu nhiên
    generateRandomCode() {
        const prefixes = ["SAVE", "DEAL", "GIFT", "LUCK", "MEGA", "OCEAN", "WAVE"];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        return `${prefix}${randomNum}`;
    },

    // Sinh discount cho đơn hàng theo tầng
    generateDiscountForOrder(orderValue) {
        let discounts = [];

        if (orderValue >= 300000) {
            // Tầng 300k: chọn ngẫu nhiên 2-3 loại discount
            const availableDiscounts = [...this.discountTiers.tier300k];
            const numDiscounts = Math.floor(Math.random() * 2) + 2; // 2-3 mã

            for (let i = 0; i < numDiscounts && availableDiscounts.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableDiscounts.length);
                const selectedDiscount = availableDiscounts.splice(randomIndex, 1)[0];

                discounts.push({
                    code: selectedDiscount.code || this.generateRandomCode(),
                    ...selectedDiscount,
                    generatedAt: Date.now(),
                    orderValue: orderValue,
                });
            }
        } else if (orderValue >= 200000) {
            // Tầng 200k: cho cả freeship và summer
            discounts = this.discountTiers.tier200k.map((discount) => ({
                code: discount.code || this.generateRandomCode(),
                ...discount,
                generatedAt: Date.now(),
                orderValue: orderValue,
            }));
        } else if (orderValue >= 100000) {
            // Tầng 100k: chỉ freeship
            discounts = this.discountTiers.tier100k.map((discount) => ({
                code: discount.code || this.generateRandomCode(),
                ...discount,
                generatedAt: Date.now(),
                orderValue: orderValue,
            }));
        }

        return discounts;
    },

    // Kiểm tra mã đã được sử dụng chưa
    isCodeUsed(code) {
        return this.usedCodes.includes(code);
    },

    // Đánh dấu mã đã sử dụng
    markCodeAsUsed(code) {
        if (!this.usedCodes.includes(code)) {
            this.usedCodes.push(code);
            localStorage.setItem("usedDiscountCodes", JSON.stringify(this.usedCodes));
        }
    },

    // Lưu mã sinh ra cho user
    saveGeneratedCodes(codes) {
        const generatedCodes = JSON.parse(localStorage.getItem("generatedDiscountCodes") || "[]");
        codes.forEach((code) => {
            generatedCodes.push({
                code: code.code,
                discount: code,
                generatedAt: Date.now(),
                used: false,
            });
        });
        localStorage.setItem("generatedDiscountCodes", JSON.stringify(generatedCodes));
    },

    // Validate và apply mã giảm giá
    validateAndApplyCode(code, currentSubtotal) {
        // Kiểm tra mã đã được sử dụng chưa
        if (this.isCodeUsed(code)) {
            return {
                success: false,
                message: "❌ Mã giảm giá này đã được sử dụng",
            };
        }

        // Tìm mã trong danh sách đã sinh ra HOẶC mã cố định
        const generatedCodes = JSON.parse(localStorage.getItem("generatedDiscountCodes") || "[]");
        const foundCode = generatedCodes.find((c) => c.code === code && !c.used);

        // Nếu không tìm thấy trong generated codes, kiểm tra mã cố định
        if (!foundCode) {
            if (discountCodes[code]) {
                const discount = discountCodes[code];

                if (currentSubtotal < discount.minOrder) {
                    return {
                        success: false,
                        message: `⚠️ Đơn hàng tối thiểu ${discount.minOrder.toLocaleString("vi-VN")}đ để sử dụng mã này`,
                    };
                }

                let calculatedDiscount = 0;
                if (discount.type === "percentage") {
                    calculatedDiscount = Math.min((currentSubtotal * discount.value) / 100, discount.maxDiscount);
                } else if (discount.type === "fixed") {
                    calculatedDiscount = discount.value;
                } else if (discount.type === "shipping") {
                    calculatedDiscount = Math.min(shippingFee, discount.maxDiscount);
                }

                this.markCodeAsUsed(code);

                return {
                    success: true,
                    discount: calculatedDiscount,
                    description: discount.description,
                    message: `✅ Áp dụng thành công! ${discount.description}`,
                };
            } else {
                return {
                    success: false,
                    message: "❌ Mã giảm giá không hợp lệ hoặc đã hết hạn",
                };
            }
        }

        const discount = foundCode.discount;

        // Kiểm tra điều kiện áp dụng
        if (currentSubtotal < 100000) {
            return {
                success: false,
                message: "⚠️ Đơn hàng tối thiểu 100,000đ để sử dụng mã giảm giá",
            };
        }

        // Tính toán giảm giá
        let calculatedDiscount = 0;
        if (discount.type === "percentage") {
            calculatedDiscount = Math.min((currentSubtotal * discount.value) / 100, discount.maxDiscount || Infinity);
        } else if (discount.type === "fixed") {
            calculatedDiscount = discount.value;
        } else if (discount.type === "shipping") {
            calculatedDiscount = Math.min(shippingFee, discount.maxDiscount || Infinity);
        }

        // Đánh dấu mã đã sử dụng
        this.markCodeAsUsed(code);

        // Cập nhật trạng thái trong generated codes
        foundCode.used = true;
        localStorage.setItem("generatedDiscountCodes", JSON.stringify(generatedCodes));

        return {
            success: true,
            discount: calculatedDiscount,
            description: discount.description,
            message: `✅ Áp dụng thành công! ${discount.description}`,
        };
    },
};

// Cấu hình cho tính khoảng cách - sử dụng multiple APIs cải tiến
const DISTANCE_CONFIG = {
    // Tọa độ chính xác của HUST (kiểm tra lại bằng GPS)
    HUST_COORDINATES: {
        lat: 21.005054,
        lng: 105.843262,
        name: "Đại học Bách khoa Hà Nội, 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    },

    // Danh sách địa điểm tham chiếu cho Hà Nội (cập nhật tọa độ chính xác hơn)
    REFERENCE_POINTS: {
        "hoàn kiếm": { lat: 21.028511, lng: 105.854004 },
        "đống đa": { lat: 21.023659, lng: 105.834114 },
        "hai bà trưng": { lat: 21.003, lng: 105.85453 },
        "hoàng mai": { lat: 20.981, lng: 105.868 },
        "thanh xuân": { lat: 20.988889, lng: 105.804444 },
        "cầu giấy": { lat: 21.034722, lng: 105.795278 },
        "ba đình": { lat: 21.035, lng: 105.835 },
        "tây hồ": { lat: 21.075, lng: 105.82 },
        "long biên": { lat: 21.036944, lng: 105.888056 },
        "nam từ liêm": { lat: 21.013333, lng: 105.765 },
        "bắc từ liêm": { lat: 21.07, lng: 105.77 },
        "hà đông": { lat: 20.970556, lng: 105.781667 },
    },
};

// Chuẩn hóa địa chỉ Việt Nam cải tiến
function normalizeVietnameseAddress(address) {
    if (!address) return "";

    let normalized = address
        .trim()
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
        // Xử lý từ viết tắt đặc biệt
        .replace(/\bdc\b/gi, "Đại Cồ")
        .replace(/\bdcv\b/gi, "Đại Cồ Việt")
        .replace(/\bhust\b/gi, "Đại học Bách khoa Hà Nội")
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

// Geocoding sử dụng Here API (miễn phí 1000 requests/ngày)
async function geocodeWithHere(address) {
    try {
        const hereApiKey = "YOUR_HERE_API_KEY"; // Cần đăng ký tại developer.here.com

        const response = await fetch(
            `https://geocode.search.hereapi.com/v1/geocode?` +
                `q=${encodeURIComponent(address)}&` +
                `in=countryCode:VNM&` +
                `in=bbox:105.3,20.5,106.0,21.5&` +
                `apiKey=${hereApiKey}`
        );

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const item = data.items[0];
            return {
                lat: item.position.lat,
                lng: item.position.lng,
                formattedAddress: item.address.label,
                confidence: item.scoring?.queryScore > 0.8 ? "high" : "medium",
                source: "here",
            };
        }
    } catch (error) {
        console.log("Here API geocoding failed:", error.message);
    }
    return null;
}

// Geocoding sử dụng OpenCage API (miễn phí 2500 requests/ngày)
async function geocodeWithOpenCage(address) {
    try {
        const openCageApiKey = "YOUR_OPENCAGE_API_KEY"; // Cần đăng ký tại opencagedata.com

        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?` +
                `q=${encodeURIComponent(address)}&` +
                `key=${openCageApiKey}&` +
                `countrycode=vn&` +
                `bounds=105.3,20.5,106.0,21.5&` +
                `language=vi&` +
                `limit=3`
        );

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Tìm kết quả tốt nhất cho Hà Nội
            let bestResult = data.results[0];
            for (const result of data.results) {
                if (result.formatted.toLowerCase().includes("hà nội") || result.formatted.toLowerCase().includes("hanoi")) {
                    bestResult = result;
                    break;
                }
            }

            return {
                lat: bestResult.geometry.lat,
                lng: bestResult.geometry.lng,
                formattedAddress: bestResult.formatted,
                confidence: bestResult.confidence > 7 ? "high" : "medium",
                source: "opencage",
            };
        }
    } catch (error) {
        console.log("OpenCage geocoding failed:", error.message);
    }
    return null;
}

// Geocoding sử dụng Mapbox cải tiến
async function geocodeWithMapBox(address) {
    try {
        // Sử dụng access token public của Mapbox
        const mapboxToken = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
                `country=vn&` +
                `proximity=105.8431,21.0054&` +
                `bbox=105.3,20.5,106.0,21.5&` +
                `language=vi&` +
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
                source: "mapbox",
            };
        }
    } catch (error) {
        console.log("MapBox geocoding failed:", error.message);
    }
    return null;
}

// Hàm geocoding tổng hợp cải tiến
async function comprehensiveGeocode(address) {
    const normalizedAddress = normalizeVietnameseAddress(address);
    console.log("Geocoding address:", normalizedAddress);

    // Thử các API theo thứ tự ưu tiên (từ chính xác nhất đến ít chính xác nhất)
    const geocoders = [
        () => geocodeWithHere(normalizedAddress),
        () => geocodeWithOpenCage(normalizedAddress),
        () => geocodeWithMapBox(normalizedAddress),
        () => geocodeWithLocationIQ(normalizedAddress),
        () => geocodeWithPhoton(normalizedAddress),
        () => geocodeWithDistrictMatching(normalizedAddress),
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

// Cải thiện tính khoảng cách với multiple factors
function calculateEnhancedDistance(lat1, lon1, lat2, lon2) {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        return null;
    }

    const R = 6371; // Bán kính trái đất

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = R * c;

    // Áp dụng hệ số điều chỉnh thông minh dựa trên vị trí
    let adjustmentFactor = 1.3; // Mặc định 30%

    // Điều chỉnh theo khu vực
    if (lat2 > 21.05) {
        // Phía Bắc Hà Nội (xa trung tâm hơn)
        adjustmentFactor = 1.4;
    } else if (lat2 < 20.95) {
        // Phía Nam Hà Nội
        adjustmentFactor = 1.35;
    } else if (Math.abs(lon2 - 105.85) > 0.05) {
        // Xa trung tâm theo kinh độ
        adjustmentFactor = 1.38;
    }

    // Điều chỉnh cho khoảng cách ngắn (trong nội thành)
    if (distance < 3) {
        adjustmentFactor = 1.2; // Ít điều chỉnh hơn cho khoảng cách gần
    } else if (distance > 15) {
        adjustmentFactor = 1.5; // Điều chỉnh nhiều hơn cho khoảng cách xa
    }

    distance = distance * adjustmentFactor;

    return Math.round(distance * 100) / 100;
}

// Hàm tính khoảng cách chính được cải thiện
async function calculateDistance(address) {
    try {
        const { lat: hustLat, lng: hustLng } = DISTANCE_CONFIG.HUST_COORDINATES;

        console.log("Calculating distance from HUST to:", address);

        // Sử dụng geocoding nâng cao
        const geocodeResult = await advancedGeocode(address);

        if (!geocodeResult) {
            throw new Error("Không thể tìm thấy địa chỉ với tất cả các phương thức");
        }

        const { lat, lng, formattedAddress, source, confidence } = geocodeResult;

        // Kiểm tra xem tọa độ có hợp lý không (trong phạm vi Hà Nội)
        if (lat < 20.5 || lat > 21.5 || lng < 105.3 || lng > 106.0) {
            console.warn("Coordinates outside Hanoi bounds:", { lat, lng });
        }

        // Tính khoảng cách bằng công thức Haversine cải tiến
        const distance = calculateHaversineDistance(hustLat, hustLng, lat, lng);

        if (distance === null) {
            throw new Error("Không thể tính khoảng cách với tọa độ này");
        }

        return {
            distance: distance,
            foundAddress: formattedAddress,
            coordinates: { lat, lng },
            source: source,
            confidence: confidence,
            method: "haversine_enhanced",
        };
    } catch (error) {
        console.error("Distance calculation failed:", error);
        throw error;
    }
}

// Cập nhật hàm updateShippingFee với validation tốt hơn
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

    // Validation địa chỉ cải tiến
    if (address.length < 8) {
        distanceInfo.style.display = "block";
        distanceText.innerHTML = '<span style="color: #f59e0b;">⚠️ Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 8 ký tự)</span>';
        shippingFeeSpan.textContent = "";
        return;
    }

    // Kiểm tra xem có ký tự số không (để đảm bảo có số nhà)
    if (!/\d/.test(address)) {
        distanceInfo.style.display = "block";
        distanceText.innerHTML = '<span style="color: #f59e0b;">⚠️ Vui lòng nhập số nhà trong địa chỉ</span>';
        shippingFeeSpan.textContent = "";
        return;
    }

    // Hiển thị loading với animation
    distanceInfo.style.display = "block";
    distanceText.innerHTML = `
        <span class="loading-text">📍 Đang tìm kiếm địa chỉ chính xác...</span>
        <div class="loading-spinner-small"></div>
    `;
    shippingFeeSpan.textContent = "";

    try {
        const result = await calculateDistance(address);

        if (result && result.distance !== null) {
            const { distance, foundAddress, source, confidence } = result;

            // Icon theo nguồn dữ liệu
            let sourceIcon = source === "google_maps" ? "🗺️" : "🌍";
            let confidenceText = "";

            if (confidence === "high") {
                confidenceText = " (Chính xác cao)";
            } else if (confidence === "medium") {
                confidenceText = " (Chính xác trung bình)";
            } else {
                confidenceText = " (Ước tính)";
            }

            // Tính phí ship
            if (distance <= 5) {
                shippingFee = 0;
                distanceText.innerHTML = `
                    <div class="distance-result success">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        <br><small class="method-info">${sourceIcon} ${source === "google_maps" ? "Google Maps" : "OpenStreetMap"}${confidenceText}</small>
                    </div>
                `;
                shippingFeeSpan.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 Miễn phí giao hàng!</span>';
            } else {
                shippingFee = Math.ceil(distance - 5) * 5000;
                distanceText.innerHTML = `
                    <div class="distance-result">
                        <strong>📍 Khoảng cách: ${distance.toFixed(1)}km</strong>
                        <br><small class="method-info">${sourceIcon} ${source === "google_maps" ? "Google Maps" : "OpenStreetMap"}${confidenceText}</small>
                    </div>
                `;
                shippingFeeSpan.innerHTML = `<span style="color: #f59e0b; font-weight: bold;">🚚 Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ</span>`;
            }

            // Hiển thị địa chỉ được tìm thấy nếu khác đáng kể với input
            const normalizedInput = normalizeAddress(address);
            if (foundAddress && !foundAddress.toLowerCase().includes(normalizedInput.toLowerCase().substring(0, 20))) {
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
                <span style="color: #ef4444;">❌ Không thể tìm thấy địa chỉ</span>
                <br><small style="color: #666;">
                    Vui lòng kiểm tra lại địa chỉ hoặc liên hệ với chúng tôi
                </small>
                <br><small style="color: #888;">
                    💡 Gợi ý: Nhập đầy đủ "số nhà, tên đường, quận/huyện, Hà Nội"
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

// Hiển thị mã giảm giá sinh ngẫu nhiên cải tiến
function showGeneratedDiscounts(discounts) {
    const discountModal = document.createElement("div");
    discountModal.className = "discount-modal";

    let discountCardsHTML = "";
    discounts.forEach((discount, index) => {
        discountCardsHTML += `
            <div class="discount-card" style="animation-delay: ${index * 0.2}s">
                <div class="discount-badge">${getDiscountIcon(discount.type)}</div>
                <div class="discount-code-display">
                    <span class="discount-code">${discount.code}</span>
                    <button class="copy-code-btn" onclick="copyDiscountCode('${discount.code}')">
                        📋 Copy
                    </button>
                </div>
                <div class="discount-description">${discount.description}</div>
            </div>
        `;
    });

    discountModal.innerHTML = `
        <div class="discount-modal-content">
            <div class="discount-header">
                <h3>🎉 Chúc mừng! Bạn nhận được ${discounts.length} mã giảm giá</h3>
                <p>Mỗi mã chỉ sử dụng được 1 lần cho đơn hàng tiếp theo</p>
            </div>
            <div class="discount-cards">
                ${discountCardsHTML}
            </div>
            <div class="discount-actions">
                <button class="close-modal-btn" onclick="closeDiscountModal()">
                    Đã hiểu
                </button>
            </div>
        </div>
    `;

    // Thêm CSS cho modal cải tiến
    const modalCSS = `
        <style>
        .discount-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .discount-modal-content {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
            animation: slideUp 0.3s ease;
        }
        
        .discount-header h3 {
            color: #059669;
            margin-bottom: 10px;
            font-size: 1.4rem;
        }
        
        .discount-header p {
            color: #6b7280;
            margin-bottom: 25px;
            font-size: 0.9rem;
        }
        
        .discount-cards {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .discount-card {
            background: linear-gradient(145deg, #f0f9ff, #e0f7fa);
            padding: 20px;
            border-radius: 15px;
            border: 2px dashed #0ea5e9;
            position: relative;
            animation: slideInFromLeft 0.5s ease forwards;
            opacity: 0;
            transform: translateX(-50px);
        }
        
        .discount-badge {
            position: absolute;
            top: -10px;
            right: -10px;
            background: #059669;
            color: white;
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 1.2rem;
        }
        
        .discount-code {
            font-size: 1.3rem;
            font-weight: bold;
            color: #0ea5e9;
            letter-spacing: 1px;
            display: block;
            margin-bottom: 10px;
        }
        
        .copy-code-btn {
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s;
        }
        
        .copy-code-btn:hover {
            background: #0284c7;
            transform: translateY(-1px);
        }
        
        .discount-description {
            color: #059669;
            font-weight: 600;
            margin-top: 10px;
            font-size: 0.9rem;
        }
        
        .close-modal-btn {
            background: linear-gradient(145deg, #059669, #047857);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 1rem;
        }
        
        .close-modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(5, 150, 105, 0.3);
        }
        
        @keyframes slideInFromLeft {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        </style>
    `;

    if (!document.querySelector("#discount-modal-styles")) {
        const styleElement = document.createElement("div");
        styleElement.id = "discount-modal-styles";
        styleElement.innerHTML = modalCSS;
        document.head.appendChild(styleElement);
    }

    document.body.appendChild(discountModal);
}

// Helper function để lấy icon theo loại discount
function getDiscountIcon(type) {
    switch (type) {
        case "percentage":
            return "💸";
        case "fixed":
            return "💰";
        case "shipping":
            return "🚚";
        default:
            return "🎁";
    }
}

// Cập nhật hàm updatePaymentSummary với logic tầng mới
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

    // Hiển thị thông báo theo tầng
    const discountAlert = document.getElementById("discountAlert");
    if (subtotal >= 300000 && !appliedDiscountCode) {
        if (discountAlert) {
            discountAlert.style.display = "block";
            discountAlert.innerHTML = `
                <div style="background: linear-gradient(145deg, #fef3c7, #fcd34d); padding: 15px; border-radius: 10px; border-left: 4px solid #f59e0b;">
                    <strong>🎊 VIP! Đơn hàng 300k+ nhận 3 mã giảm giá cực khủng!</strong>
                    <br><small>Bao gồm: Giảm 15% tối đa 75k + Giảm cố định 50k + Free ship</small>
                </div>
            `;
        }
    } else if (subtotal >= 200000 && !appliedDiscountCode) {
        if (discountAlert) {
            discountAlert.style.display = "block";
            discountAlert.innerHTML = `
                <div style="background: linear-gradient(145deg, #f0fdf4, #dcfce7); padding: 15px; border-radius: 10px; border-left: 4px solid #10b981;">
                    <strong>🎁 Xuất sắc! Đơn hàng 200k+ nhận 2 mã giảm giá!</strong>
                    <br><small>Free ship + Giảm 10% tối đa 50k (SUMMER2025)</small>
                </div>
            `;
        }
    } else if (subtotal >= 100000 && !appliedDiscountCode) {
        if (discountAlert) {
            discountAlert.style.display = "block";
            discountAlert.innerHTML = `
                <div style="background: linear-gradient(145deg, #eff6ff, #dbeafe); padding: 15px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                    <strong>🚚 Tuyệt vời! Đơn hàng 100k+ nhận mã free ship!</strong>
                    <br><small>Miễn phí giao hàng tối đa 25k</small>
                </div>
            `;
        }
    } else if (subtotal < 100000) {
        if (discountAlert) {
            discountAlert.style.display = "none";
        }
    }

    // Cập nhật QR amount
    updateVietQR(finalTotal);
}

// Cập nhật hàm submitOrder để sinh mã theo tầng
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

    // Sinh mã giảm giá theo tầng
    let generatedDiscounts = [];
    if (subtotal >= 100000) {
        generatedDiscounts = DISCOUNT_SYSTEM.generateDiscountForOrder(subtotal);
        if (generatedDiscounts.length > 0) {
            DISCOUNT_SYSTEM.saveGeneratedCodes(generatedDiscounts);
        }
    }

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
        generatedDiscountCodes: generatedDiscounts.map((d) => d.code).join(", "),
    };

    // Gửi dữ liệu và hiển thị mã sau khi thành công
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

            // Hiển thị mã giảm giá nếu có
            if (generatedDiscounts.length > 0) {
                setTimeout(() => {
                    showGeneratedDiscounts(generatedDiscounts);
                }, 1000);
            }

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
