const products = [
    // Sản phẩm đơn lẻ - Giáng Sinh
    {
        id: 1,
        name: "HOA NGƯỜI TUYẾT",
        price: 35000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/hoa.jpg",
        category: "single",
        description:
            "Hoa người tuyết xinh xắn, thủ công tinh xảo, mang không khí Giáng sinh ấm áp. Món quà trang trí hoàn hảo",
        unit: "bông",
        quantityInputId: "quantity_single1",
        isPopular: true,
    },
    {
        id: 2,
        name: "CÂY THÔNG ĐẤT SET",
        price: 100000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/thong.jpg",
        category: "single",
        description:
            "Cây thông Noel đất set mini, xinh xắn và độc đáo. Trang trí không gian Giáng sinh thêm ấm cúng",
        unit: "cây",
        quantityInputId: "quantity_single2",
        isPopular: true,
    },
    {
        id: 3,
        name: "BÁNH GIÁNG SINH",
        price: 7000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/banh.jpg",
        category: "food",
        description:
            "Bánh Giáng sinh thơm ngon, trang trí đẹp mắt với họa tiết Noel. Món ngọt tuyệt vời cho mùa lễ hội",
        unit: "cái",
        quantityInputId: "quantity_single3",
        isPopular: true,
    },

    // Combo hoa người tuyết
    {
        id: 4,
        name: "COMBO 2 HOA NGƯỜI TUYẾT",
        price: 60000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/hoa.jpg",
        category: "combo",
        description:
            "Combo 2 bông hoa người tuyết xinh xắn, tiết kiệm hơn mua lẻ. Trang trí bàn làm việc hoặc tặng bạn bè",
        unit: "combo 2 bông",
        quantityInputId: "quantity_combo1",
        isPopular: true,
        originalPrice: 70000,
        discount: "Tiết kiệm 10k",
    },

    // Combo 5 bánh giáng sinh
    {
        id: 5,
        name: "COMBO 5 BÁNH GIÁNG SINH",
        price: 30000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/banh.jpg",
        category: "combo",
        description:
            "Combo 5 bánh Giáng sinh đa dạng hương vị, hoàn hảo cho bữa tiệc hoặc chia sẻ cùng gia đình",
        unit: "combo 5 cái",
        quantityInputId: "quantity_combo2",
        isPopular: true,
        originalPrice: 35000,
        discount: "Tiết kiệm 5k",
    },

    // Combo Giáng sinh - Best Sale
    {
        id: 6,
        name: "COMBO MERRY CHRISTMAS 1",
        price: 50000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/hoa.jpg",
        category: "combo",
        description:
            "Combo Giáng sinh cơ bản gồm: 1 hoa người tuyết + 2 bánh Giáng sinh. Phù hợp trang trí bàn làm việc",
        unit: "combo",
        quantityInputId: "quantity_combo3",
        isPopular: true,
        originalPrice: 49000,
        discount: "Giá ưu đãi đặc biệt",
    },
    {
        id: 7,
        name: "COMBO MERRY CHRISTMAS 2",
        price: 165000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/thong.jpg",
        category: "combo",
        description:
            "Combo trang trí Noel sang trọng gồm: 1 cây thông đất set + 2 hoa người tuyết. Tạo không gian lễ hội đẹp mắt",
        unit: "combo",
        quantityInputId: "quantity_combo4",
        isPopular: true,
        originalPrice: 170000,
        discount: "Tiết kiệm 5k",
    },
    {
        id: 8,
        name: "COMBO MERRY CHRISTMAS 3",
        price: 180000,
        image: "https://raw.githubusercontent.com/Trantoan12022004/host_image_page_anhtonton/main/images/gayquygiangsinh/banh.jpg",
        category: "combo",
        description:
            "Combo Giáng sinh hoàn hảo gồm: 1 cây thông đất set + 2 hoa người tuyết + 2 bánh Giáng sinh. Trọn vẹn không khí Noel",
        unit: "combo",
        quantityInputId: "quantity_combo5",
        isPopular: true,
        originalPrice: 184000,
        discount: "Tiết kiệm 4k",
    },
];

// Xuất dữ liệu để sử dụng trong các file khác
if (typeof module !== "undefined" && module.exports) {
    module.exports = products;
} else {
    window.products = products;
}
