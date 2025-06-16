const products = [
    {
        id: 1,
        name: "COMBO-NGỌT NGÀO 1",
        price: 132000,
        image: "images/sản phẩm tết/3.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "",
        quantityInputId: "quantity_combo1",
    },
    
];

// Xuất dữ liệu để sử dụng trong các file khác
if (typeof module !== "undefined" && module.exports) {
    module.exports = products;
} else {
    window.products = products;
}
