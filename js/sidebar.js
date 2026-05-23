/*
 * ============================================================
 * FILE: js/sidebar.js
 * MỤC ĐÍCH: Xử lý điều hướng menu sidebar — highlight item
 *   được chọn và (tùy chọn) điều hướng sang trang khác.
 *
 * ĐỂ THÊM CHỨC NĂNG ĐIỀU HƯỚNG THẬT:
 *   Trong hàm handleMenuClick(), thêm logic chuyển trang:
 *   window.location.href = `pages/${page}.html`;
 *
 * ĐỂ DÙNG SINGLE PAGE (không reload):
 *   Thay window.location bằng hàm ẩn/hiện section tương ứng
 * ============================================================
 */

(function () {

  const menuItems = document.querySelectorAll('.menu-item');

  /* Xử lý khi click vào menu item */
  function handleMenuClick(clickedItem) {
    /* Bỏ active tất cả, đặt active cho item được click */
    menuItems.forEach(i => i.classList.remove('active'));
    clickedItem.classList.add('active');

    /* Lấy tên trang từ attribute data-page */
    const page = clickedItem.dataset.page;

    /* TODO: Thêm logic điều hướng tại đây nếu cần */
    /* Ví dụ: window.location.href = `pages/${page}.html`; */
    console.log('Chuyển trang:', page);
  }

  /* Gắn sự kiện cho tất cả menu item */
  menuItems.forEach(item => {
    item.addEventListener('click', () => handleMenuClick(item));
  });

})();
