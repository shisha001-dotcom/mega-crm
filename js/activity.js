/*
 * ============================================================
 * FILE: js/activity.js
 * MỤC ĐÍCH: Render danh sách hoạt động gần đây từ ACTIVITIES
 *   (khai báo trong js/data.js).
 *
 * ĐỂ THÊM HOẠT ĐỘNG MỚI:
 *   Thêm object vào đầu mảng ACTIVITIES trong data.js:
 *   { icon: '📧', title: 'Tiêu đề', description: 'Nội dung...' }
 *
 * ĐỂ GIỚI HẠN SỐ HOẠT ĐỘNG HIỂN THỊ:
 *   Sửa renderActivity(ACTIVITIES) → renderActivity(ACTIVITIES.slice(0, 5))
 * ============================================================
 */

/* Tạo HTML cho 1 hoạt động */
function renderActivityItem(item) {
  return `
    <div class="activity-item">
      <div class="activity-icon">${item.icon}</div>
      <div>
        <h4>${item.title}</h4>
        <p>${item.description}</p>
      </div>
    </div>
  `;
}

/* Render toàn bộ từ mảng ACTIVITIES */
function renderActivity(data) {
  const list = document.getElementById('activityList');
  if (!list) return;

  list.innerHTML = data.map(renderActivityItem).join('');
}

/* Khởi chạy khi trang load */
renderActivity(ACTIVITIES);
