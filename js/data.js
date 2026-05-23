/*
 * ============================================================
 * FILE: js/data.js
 * MỤC ĐÍCH: Lưu toàn bộ dữ liệu mẫu (mock data) của ứng dụng.
 *   Khi kết nối API thật, chỉ cần sửa file này — các file JS
 *   khác không cần thay đổi.
 *
 * ĐỂ THÊM CHỨNG TỪ MẪU: Thêm object vào mảng VOUCHERS
 * ĐỂ THÊM PROGRESS MỚI: Thêm object vào mảng PROGRESS_ITEMS
 * ĐỂ THÊM MODULE MỚI: Thêm object vào mảng MODULES
 * ĐỂ THÊM HOẠT ĐỘNG MỚI: Thêm object vào mảng ACTIVITIES
 *
 * Màu thanh progress: blue | green | orange | red | purple
 *   (thêm màu mới trong css/components.css nếu cần)
 * ============================================================
 */

/* Dữ liệu chứng từ mẫu */
const VOUCHERS = [
  {
    code:     'CT0001',
    customer: 'Công ty Minh Long',
    date:     '24/05/2026',
    amount:   '185.000.000đ',
    status:   'Đã duyệt',         /* success | warning | danger */
    badgeClass: 'success'
  },
  {
    code:     'CT0002',
    customer: 'Công ty Hoàng Hà',
    date:     '24/05/2026',
    amount:   '72.000.000đ',
    status:   'Chờ xử lý',
    badgeClass: 'warning'
  },
  {
    code:     'CT0003',
    customer: 'Công ty Việt Á',
    date:     '23/05/2026',
    amount:   '450.000.000đ',
    status:   'Hoàn tất',
    badgeClass: 'success'
  },
  {
    code:     'CT0004',
    customer: 'Công ty Thiên Phát',
    date:     '23/05/2026',
    amount:   '91.500.000đ',
    status:   'Từ chối',
    badgeClass: 'danger'
  }
];

/* Dữ liệu thanh tiến độ nghiệp vụ */
const PROGRESS_ITEMS = [
  { label: 'Thu hồi công nợ',   percent: 82, colorClass: 'blue'   },
  { label: 'Đối soát ngân hàng', percent: 65, colorClass: 'green'  },
  { label: 'Kê khai thuế',       percent: 48, colorClass: 'orange' }
];

/* Dữ liệu module hệ thống */
const MODULES = [
  {
    icon:        '👤',
    title:       'CRM Khách hàng',
    description: 'Quản lý khách hàng, lịch sử giao dịch, chăm sóc khách hàng và pipeline bán hàng.'
  },
  {
    icon:        '💳',
    title:       'Kế toán tài chính',
    description: 'Hệ thống sổ cái, nhật ký chung, hạch toán, quản lý thu chi và công nợ.'
  },
  {
    icon:        '📦',
    title:       'Quản lý kho',
    description: 'Theo dõi tồn kho, nhập xuất hàng hóa, kiểm kê và quản lý vật tư.'
  },
  {
    icon:        '📈',
    title:       'Báo cáo tài chính',
    description: 'Xuất báo cáo theo thông tư 99, bảng cân đối kế toán và báo cáo lưu chuyển tiền tệ.'
  }
];

/* Dữ liệu hoạt động gần đây */
const ACTIVITIES = [
  {
    icon:        '💰',
    title:       'Thu tiền khách hàng',
    description: 'Công ty Minh Long đã thanh toán hóa đơn trị giá 185 triệu VNĐ.'
  },
  {
    icon:        '🧾',
    title:       'Xuất hóa đơn điện tử',
    description: 'Hệ thống đã phát hành 28 hóa đơn điện tử trong ngày hôm nay.'
  },
  {
    icon:        '🏦',
    title:       'Đối soát ngân hàng',
    description: 'Đã đồng bộ dữ liệu giao dịch từ ngân hàng BIDV.'
  }
];
