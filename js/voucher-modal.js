/*
 * ============================================================
 * FILE: js/voucher-modal.js
 * MỤC ĐÍCH: Xử lý toàn bộ logic modal "Tạo chứng từ mới":
 *   - Mở / đóng modal
 *   - Tự động sinh mã chứng từ theo ngày
 *   - Validate form và lưu chứng từ mới vào bảng
 *
 * ĐỂ THÊM TRƯỜNG VALIDATE MỚI:
 *   Thêm điều kiện vào hàm validateForm() bên dưới
 *
 * ĐỂ GỬI DỮ LIỆU LÊN API:
 *   Thay phần "// TODO: gọi API" bằng fetch/axios call thật
 *
 * ĐỂ ĐỔI PREFIX MÃ CHỨNG TỪ (VD: "CT" thay vì ngày):
 *   Sửa hàm generateVoucherCode()
 * ============================================================
 */

(function () {

  /* ---- Lấy các element cần thiết ---- */
  const modal          = document.getElementById('voucherModal');
  const openBtn        = document.getElementById('openVoucherModal');
  const closeBtn       = document.getElementById('closeVoucherModal');
  const saveBtn        = document.getElementById('saveVoucherBtn');
  const dateInput      = document.getElementById('voucherDate');
  const codeDisplay    = document.getElementById('voucherCode');
  const customerInput  = document.getElementById('voucherCustomer');
  const amountInput    = document.getElementById('voucherAmount');
  const statusSelect   = document.getElementById('voucherStatus');
  const noteInput      = document.getElementById('voucherNote');

  /* Đếm số chứng từ theo từng ngày (reset khi tải lại trang) */
  const voucherCounter = {};

  /* ---- Sinh mã chứng từ tự động ---- */
  /* Format: YYYYMMDD + số thứ tự 3 chữ số, ví dụ: 20260524001 */
  function generateVoucherCode(dateValue) {
    if (!dateValue) return;

    const date  = new Date(dateValue);
    const yyyy  = date.getFullYear();
    const mm    = String(date.getMonth() + 1).padStart(2, '0');
    const dd    = String(date.getDate()).padStart(2, '0');
    const key   = `${yyyy}${mm}${dd}`;

    if (!voucherCounter[key]) voucherCounter[key] = 1;

    const seq = String(voucherCounter[key]).padStart(3, '0');
    codeDisplay.textContent = `${key}${seq}`;
  }

  /* ---- Lấy ngày hôm nay dạng YYYY-MM-DD ---- */
  function getTodayValue() {
    const t  = new Date();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${t.getFullYear()}-${mm}-${dd}`;
  }

  /* ---- Mở modal ---- */
  function openModal() {
    modal.classList.add('active');
    const today = getTodayValue();
    dateInput.value = today;
    generateVoucherCode(today);
  }

  /* ---- Đóng modal & reset form ---- */
  function closeModal() {
    modal.classList.remove('active');
    customerInput.value = '';
    amountInput.value   = '';
    noteInput.value     = '';
    statusSelect.selectedIndex = 0;
  }

  /* ---- Validate dữ liệu trước khi lưu ---- */
  function validateForm() {
    if (!customerInput.value.trim()) {
      alert('Vui lòng nhập tên khách hàng!');
      return false;
    }
    if (!amountInput.value || Number(amountInput.value) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return false;
    }
    return true;
  }

  /* ---- Định dạng số tiền ---- */
  function formatAmount(value) {
    return Number(value).toLocaleString('vi-VN') + 'đ';
  }

  /* ---- Lưu chứng từ mới ---- */
  function saveVoucher() {
    if (!validateForm()) return;

    /* Lấy ngày hiển thị (DD/MM/YYYY) */
    const dateParts = dateInput.value.split('-');
    const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    /* Map trạng thái → class badge */
    const badgeMap = {
      'Chờ xử lý': 'warning',
      'Đã duyệt':  'success',
      'Hoàn tất':  'success'
    };

    /* Tăng số thứ tự cho ngày này */
    const key = dateInput.value.replace(/-/g, '');
    if (!voucherCounter[key]) voucherCounter[key] = 1;
    else voucherCounter[key]++;

    const newVoucher = {
      code:       codeDisplay.textContent,
      customer:   customerInput.value.trim(),
      date:       displayDate,
      amount:     formatAmount(amountInput.value),
      status:     statusSelect.value,
      badgeClass: badgeMap[statusSelect.value] || 'warning'
    };

    /* TODO: Thay bằng API call thật nếu có backend */
    /* fetch('/api/vouchers', { method: 'POST', body: JSON.stringify(newVoucher) }) */

    /* Thêm hàng mới lên đầu bảng (hàm từ voucher-table.js) */
    prependVoucherRow(newVoucher);

    closeModal();
  }

  /* ---- Gắn sự kiện ---- */
  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', saveVoucher);
  dateInput.addEventListener('change', e => generateVoucherCode(e.target.value));

  /* Click ra ngoài modal để đóng */
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

})();
