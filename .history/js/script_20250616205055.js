// Sử dụng dữ liệu sản phẩm từ file products.js
function displayProducts(productsToShow = products) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price.toLocaleString('vi-VN')}đ</p>
            <p class="description">${product.description}</p>
            <button onclick="addToCart(${product.id})" class="btn btn-primary">Thêm vào giỏ</button>
        `;
        productGrid.appendChild(productCard);
    });
}

// Hàm lọc sản phẩm theo danh mục
function filterProducts(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Logic thêm vào giỏ hàng
        console.log('Đã thêm vào giỏ:', product.name);
        // Có thể thêm animation hoặc thông báo ở đây
    }
}