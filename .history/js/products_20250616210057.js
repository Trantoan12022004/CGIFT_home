const products = [
    {
        id: 1,
        name: "COMBO-NGỌT NGAO",
        price: 350000,
        image: "images/sản phẩm tết/3.png",
        category: "combo",
        description: "Combo vui vẻ 10 cái nem chua đặc biệt",
        unit: "10 cái",
        quantityInputId: "quantity_combo1",
    },
    {
        id: 2,
        name: "ĐÀO QUẤT MAI",
        price: null, // Giá động theo lựa chọn
        image: "images/sản phẩm tết/2.png",
        category: "flowers",
        description: "Hoa đào, quất, mai handmade các size",
        hasVariants: true,
        variants: [
            { id: "dao-s", name: "ĐÀO-S", price: 89000 },
            { id: "dao-m", name: "ĐÀO-M", price: 149000 },
            { id: "dao-l", name: "ĐÀO-L", price: 269000 },
            { id: "mai-s", name: "MAI-S", price: 89000 },
            { id: "mai-m", name: "MAI-M", price: 149000 },
            { id: "mai-l", name: "MAI-L", price: 269000 },
            { id: "quat-s", name: "QUẤT-S", price: 89000 },
            { id: "quat-m", name: "QUẤT-M", price: 149000 },
            { id: "quat-l", name: "QUẤT-L", price: 269000 },
        ],
        quantityInputId: "quantity_combo5",
        selectId: "sizeColorCombo5",
    },
    {
        id: 3,
        name: "BÁNH GẠO SỮA",
        price: null, // Giá động theo lựa chọn
        image: "images/sản phẩm tết/4.png",
        category: "food",
        description: "Bánh gạo sữa thơm ngon",
        hasVariants: true,
        variants: [
            { id: "10_cai-GAO", name: "10 cái", price: 18000 },
            { id: "20_cai-GAO", name: "20 cái", price: 30000 },
        ],
        quantityInputId: "quantity_combo4",
        selectId: "sizeColorCombo4",
    },
    {
        id: 4,
        name: "KẸO HẠNH PHÚC",
        price: null, // Giá động theo lựa chọn
        image: "images/sản phẩm tết/1.png",
        category: "candy",
        description: "Kẹo hạnh phúc ngọt ngào",
        hasVariants: true,
        variants: [
            { id: "5_cai-HP", name: "5 cái", price: 20000 },
            { id: "10_cai-HP", name: "10 cái", price: 35000 },
            { id: "22_cai-HP", name: "22 cái", price: 69000 },
        ],
        quantityInputId: "quantity_combo3",
        selectId: "sizeColorCombo3",
    },
];

// Xuất dữ liệu để sử dụng trong các file khác
if (typeof module !== "undefined" && module.exports) {
    module.exports = products;
} else {
    window.products = products;
}
