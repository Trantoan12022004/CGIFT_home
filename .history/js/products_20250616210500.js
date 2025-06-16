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
    {
        id: 2,
        name: "COMBO-NGỌT NGÀO 2",
        price: 132000,
        image: "images/sản phẩm tết/4.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "",
        quantityInputId: "quantity_combo2",
    },
    {
        id: 3,
        name: "COMBO-NGỌT NGÀO 3",
        price: 132000,
        image: "images/sản phẩm tết/5.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "",
        quantityInputId: "quantity_combo3",
    },
    {
        id: 4,
        name: "COMBO-NGỌT NGÀO 4",
        price: 132000,
        image: "images/sản phẩm tết/6.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "",
        quantityInputId: "quantity_combo4",
    },
    {
        id: 5,
        name: "COMBO-NGỌT NGÀO 5",
        price: 132000,
        image: "images/sản phẩm tết/7.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "",
        quantityInputId: "quantity_combo5",
    },
    {
        id: 6,
        name: "COMBO-NGỌT NGÀO 6",
        price: 132000,
        image: "images/sản phẩm tết/8.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "",
        quantityInputId: "quantity_combo6",
    },
];

// Xuất dữ liệu để sử dụng trong các file khác
if (typeof module !== "undefined" && module.exports) {
    module.exports = products;
} else {
    window.products = products;
}
