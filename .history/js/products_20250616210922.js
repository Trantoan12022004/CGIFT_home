const products = [
    // Sản phẩm đơn lẻ
    {
        id: 1,
        name: "BÔNG LAN SỐT RUỐC",
        price: 30000,
        image: "images/sản phẩm tết/1.png",
        category: "single",
        description: "Bông lan mềm mịn với sốt ruốc thơm ngon",
        unit: "cái",
        quantityInputId: "quantity_single1",
        isPopular: false
    },
    {
        id: 2,
        name: "BÁNH SÂU GÀ",
        price: 30000,
        image: "images/sản phẩm tết/2.png",
        category: "single",
        description: "Bánh sâu giòn tan với nhân gà đậm đà",
        unit: "cái",
        quantityInputId: "quantity_single2",
        isPopular: false
    },
    {
        id: 3,
        name: "TRÀ THÁI",
        price: 12000,
        image: "images/sản phẩm tết/3.png",
        category: "drink",
        description: "Trà Thái đậm đà, thơm mát",
        unit: "hộp",
        quantityInputId: "quantity_single3",
        isPopular: false
    },
    {
        id: 4,
        name: "BÁNH TART TRỨNG",
        price: 10000,
        image: "images/sản phẩm tết/4.png",
        category: "single",
        description: "Bánh tart trứng béo ngậy, thơm phức",
        unit: "cái",
        quantityInputId: "quantity_single4",
        isPopular: false
    },
    {
        id: 5,
        name: "HOA QUẢ DẦM",
        price: 20000,
        image: "images/sản phẩm tết/1.png",
        category: "dessert",
        description: "Hoa quả tươi ngon được dầm đường mát lạnh",
        unit: "hộp",
        quantityInputId: "quantity_single5",
        isPopular: false
    },
    {
        id: 6,
        name: "SỮA ĐẬU NÀNH",
        price: 15000,
        image: "images/sản phẩm tết/2.png",
        category: "drink",
        description: "Sữa đậu nành nguyên chất, bổ dưỡng",
        unit: "chai",
        quantityInputId: "quantity_single6",
        isPopular: false
    },
    {
        id: 7,
        name: "SỮA CHUA HỘP",
        price: 75000,
        image: "images/sản phẩm tết/3.png",
        category: "dessert",
        description: "Hộp 12 hũ sữa chua nhỏ thơm ngon",
        unit: "hộp 12 hũ",
        quantityInputId: "quantity_single7",
        isPopular: false
    },
    {
        id: 8,
        name: "SỮA CHUA TÚI",
        price: 40000,
        image: "images/sản phẩm tết/4.png",
        category: "dessert",
        description: "10 túi sữa chua tiện lợi",
        unit: "10 túi",
        quantityInputId: "quantity_single8",
        isPopular: false
    },
    
    // Combo sản phẩm - nổi bật
    {
        id: 9,
        name: "COMBO NGỌT NGÀO 1",
        price: 132000,
        image: "images/sản phẩm tết/1.png",
        category: "combo",
        description: "1 Bông lan sốt ruốc + 1 Bánh sâu gà + 1 Trà Thái + 1 Sữa chua Hộp",
        unit: "combo",
        quantityInputId: "quantity_combo1",
        isPopular: true,
        originalPrice: 147000,
        discount: "Tiết kiệm 15k"
    },
    {
        id: 10,
        name: "COMBO NGỌT NGÀO 2",
        price: 101000,
        image: "images/sản phẩm tết/2.png",
        category: "combo",
        description: "1 Bông lan sốt ruốc + 1 Bánh sâu gà + 1 Trà Thái + 1 Sữa chua túi",
        unit: "combo",
        quantityInputId: "quantity_combo2",
        isPopular: true,
        originalPrice: 112000,
        discount: "Tiết kiệm 11k"
    },
    {
        id: 11,
        name: "COMBO THANH MÁT 1",
        price: 117000,
        image: "images/sản phẩm tết/3.png",
        category: "combo",
        description: "1 Bông lan sốt ruốc + 1 Bánh tart trứng + 1 Sữa đậu nành + 1 Sữa chua Hộp",
        unit: "combo",
        quantityInputId: "quantity_combo3",
        isPopular: true,
        originalPrice: 130000,
        discount: "Tiết kiệm 13k"
    },
    {
        id: 12,
        name: "COMBO THANH MÁT 2",
        price: 86000,
        image: "images/sản phẩm tết/4.png",
        category: "combo",
        description: "1 Bông lan sốt ruốc + 1 Bánh tart trứng + 1 Sữa đậu nành + 1 Sữa chua túi",
        unit: "combo",
        quantityInputId: "quantity_combo4",
        isPopular: false,
        originalPrice: 95000,
        discount: "Tiết kiệm 9k"
    },
    {
        id: 13,
        name: "COMBO YÊU THÍCH 1",
        price: 131000,
        image: "images/sản phẩm tết/1.png",
        category: "combo",
        description: "1 Bánh sâu gà + 1 Bánh tart trứng + 1 Hoa quả dầm + 1 Sữa chua Hộp",
        unit: "combo",
        quantityInputId: "quantity_combo5",
        isPopular: true,
        originalPrice: 135000,
        discount: "Tiết kiệm 4k"
    },
    {
        id: 14,
        name: "COMBO YÊU THÍCH 2",
        price: 99000,
        image: "images/sản phẩm tết/2.png",
        category: "combo",
        description: "1 Bánh sâu gà + 1 Bánh tart trứng + 1 Hoa quả dầm + 1 Sữa chua túi",
        unit: "combo",
        quantityInputId: "quantity_combo6",
        isPopular: false,
        originalPrice: 100000,
        discount: "Tiết kiệm 1k"
    }
];

// Xuất dữ liệu để sử dụng trong các file khác
if (typeof module !== "undefined" && module.exports) {
    module.exports = products;
} else {
    window.products = products;
}
