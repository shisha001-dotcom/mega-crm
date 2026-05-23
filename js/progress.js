/*
 * ============================================================
 * FILE: js/progress.js
 * MỤC ĐÍCH: Render các thanh tiến độ nghiệp vụ từ PROGRESS_ITEMS
 *   (khai báo trong js/data.js).
 *
 * ĐỂ THÊM THANH TIẾN ĐỘ MỚI:
 *   Thêm object vào mảng PROGRESS_ITEMS trong data.js:
 *   { label: 'Tên nghiệp vụ', percent: 70, colorClass: 'blue' }
 *
 * Các colorClass có sẵn: blue | green | orange | red
 *   Thêm màu mới trong css/components.css nếu cần
 * ============================================================
 */

/* Tạo HTML cho 1 thanh tiến độ */
function renderProgressItem(item) {
  return `
    <div class="progress-item">
      <div class="progress-info">
        <span>${item.label}</span>
        <strong>${item.percent}%</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"
             style="width: ${item.percent}%; background: var(--${item.colorClass === 'blue' ? 'primary' : item.colorClass === 'green' ? 'success' : item.colorClass === 'orange' ? 'warning' : 'danger'});">
        </div>
      </div>
    </div>
  `;
}

/* Render toàn bộ từ mảng PROGRESS_ITEMS */
function renderProgress(data) {
  const box = document.getElementById('progressBox');
  if (!box) return;

  box.innerHTML = data.map(renderProgressItem).join('');
}

/* Khởi chạy khi trang load */
renderProgress(PROGRESS_ITEMS);
