/*
 * ============================================================
 * FILE: js/voucher-table.js
 * MỤC ĐÍCH: Render bảng danh sách chứng từ từ dữ liệu VOUCHERS
 *   (khai báo trong js/data.js).
 *
 * ĐỂ THÊM CỘT MỚI VÀO BẢNG:
 *   1. Thêm <th> trong index.html (phần thead của bảng)
 *   2. Thêm <td>${item.truong_moi}</td> vào hàm renderRow() bên dưới
 *   3. Thêm trường đó vào từng object trong VOUCHERS (data.js)
 *
 * ĐỂ LỌC/SẮP XẾP BẢNG: Thêm logic vào hàm renderVoucherTable()
 * ============================================================
 */

/* Tạo 1 hàng HTML từ object dữ liệu chứng từ */
function renderRow(item) {
  return `
    <tr>
      <td>${item.code}</td>
      <td>${item.customer}</td>
      <td>${item.date}</td>
      <td>${item.amount}</td>
      <td><span class="badge ${item.badgeClass}">${item.status}</span></td>
    </tr>
  `;
}

/* Render toàn bộ bảng từ mảng VOUCHERS */
function renderVoucherTable(data) {
  const tbody = document.getElementById('voucherTableBody');
  if (!tbody) return;

  tbody.innerHTML = data.map(renderRow).join('');
}

/* Thêm 1 hàng mới lên đầu bảng (gọi khi lưu chứng từ mới) */
function prependVoucherRow(item) {
  const tbody = document.getElementById('voucherTableBody');
  if (!tbody) return;

  const tempDiv = document.createElement('tbody');
  tempDiv.innerHTML = renderRow(item);
  tbody.insertBefore(tempDiv.firstElementChild, tbody.firstChild);
}

/* Khởi chạy khi trang load */
renderVoucherTable(VOUCHERS);
