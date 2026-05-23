/*
 * ============================================================
 * FILE: js/modules.js
 * MỤC ĐÍCH: Render các module-card hệ thống từ mảng MODULES
 *   (khai báo trong js/data.js).
 *
 * ĐỂ THÊM MODULE MỚI:
 *   Thêm object vào mảng MODULES trong data.js:
 *   { icon: '⚙️', title: 'Tên module', description: 'Mô tả...' }
 *
 * ĐỂ GẮN SỰ KIỆN KHI CLICK VÀO MODULE:
 *   Sửa phần onclick="..." trong hàm renderModuleCard() bên dưới
 *   hoặc thêm event listener sau khi render
 * ============================================================
 */

/* Tạo HTML cho 1 module card */
function renderModuleCard(item) {
  return `
    <div class="module-card" onclick="alert('Mở module: ${item.title}')">
      <div class="module-icon">${item.icon}</div>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  `;
}

/* Render toàn bộ từ mảng MODULES */
function renderModules(data) {
  const grid = document.getElementById('moduleGrid');
  if (!grid) return;

  grid.innerHTML = data.map(renderModuleCard).join('');
}

/* Khởi chạy khi trang load */
renderModules(MODULES);
