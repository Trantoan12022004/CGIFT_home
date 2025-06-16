const products = [
    {
        id: 1,
        name: "Gấu bông Teddy",
        price: 250000,
        image: "images/teddy-bear.jpg",
        category: "stuffed-animals",
        description: "Gấu bông Teddy mềm mại, dễ thương, phù hợp làm quà tặng cho mọi lứa tuổi."
    },
    {
        id: 2,
        name: "Hoa hồng đỏ",
        price: 150000,
        image: "images/red-roses.jpg",
        category: "flowers",
        description: "Bó hoa hồng đỏ tươi thắm, biểu tượng của tình yêu và lòng chân thành."
    },
    {
        id: 3,
        name: "Chocolate Ferrero",
        price: 180000,
        image: "images/ferrero-chocolate.jpg",
        category: "chocolates",
        description: "Chocolate Ferrero Rocher cao cấp, hương vị thơm ngon khó cưỡng."
    },
    {
        id: 4,
        name: "Túi xách thời trang",
        price: 450000,
        image: "images/fashion-bag.jpg",
        category: "accessories",
        description: "Túi xách thời trang sang trọng, thiết kế hiện đại, phù hợp đi làm và dạo phố."
    },
    {
        id: 5,
        name: "Đồng hồ nam",
        price: 800000,
        image: "images/mens-watch.jpg",
        category: "accessories",
        description: "Đồng hồ nam cao cấp, thiết kế lịch lãm, thể hiện phong cách và đẳng cấp."
    },
    {
        id: 6,
        name: "Nước hoa nữ",
        price: 320000,
        image: "images/womens-perfume.jpg",
        category: "cosmetics",
        description: "Nước hoa nữ mùi hương quyến rũ, lưu hương lâu, tạo ấn tượng đặc biệt."
    }
];

// Xuất dữ liệu để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
} else {
    window.products = products;
}