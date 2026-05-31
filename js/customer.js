/*
 * Toàn bộ logic UI cho trang CRM Khách hàng
 * Phụ thuộc: data/customer.js phải load trước
 */

/* ---- Biến trạng thái ---- */
let allCustomers   = [];
let pendingDeleteId = null;

/* ---- DOM references ---- */
const tbody       = document.getElementById('customerTableBody');
const searchInput = document.getElementById('searchInput');
const recordCount = document.getElementById('recordCount');
const modal       = document.getElementById('customerModal');
const confirmOv   = document.getElementById('confirmOverlay');

/* ===========================================================
   RENDER BẢNG
   =========================================================== */
function renderTable(list) {
  if (list.length === 0) {
    tbody.innerHTML = `<tr class="state-row"><td colspan="10">Không có dữ liệu phù hợp.</td></tr>`;
    recordCount.textContent = '';
    return;
  }

  tbody.innerHTML = list.map((c, i) => `
    <tr>
      <td style="color:var(--sub);font-size:13px;">${i + 1}</td>
      <td><strong>${esc(c.CustomerCode)}</strong></td>
      <td>${esc(c.CustomerShortName)}</td>
      <td>${esc(c.CustomerFullName)}</td>
      <td style="font-family:monospace;">${esc(c.TaxCode)}</td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          title="${esc(c.Address)}">${esc(c.Address)}</td>
      <td>${esc(c.Email)}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          title="${esc(c.BeneficiaryBank)}">${esc(c.BeneficiaryBank)}</td>
      <td style="color:var(--sub);font-size:13px;">${esc(c.CreatedDate)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit"
                  onclick="openEditModal(${c.Id})">✏️ Sửa</button>
          <button class="btn-delete"
                  onclick="openDeleteConfirm(${c.Id}, '${esc(c.CustomerFullName)}')">🗑️ Xóa</button>
        </div>
      </td>
    </tr>
  `).join('');

  recordCount.textContent = `Tổng: ${list.length} khách hàng`;
}

/* Escape HTML tránh XSS */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ===========================================================
   TẢI DỮ LIỆU TỪ SQL SERVER
   =========================================================== */
async function loadCustomers() {
  tbody.innerHTML = `<tr class="state-row"><td colspan="10">⏳ Đang tải...</td></tr>`;
  try {
    const res = await CustomerAPI.getAll();
    allCustomers = res.data || [];
    renderTable(allCustomers);
  } catch (err) {
    tbody.innerHTML = `<tr class="state-row"><td colspan="10">❌ Lỗi: ${esc(err.message)}</td></tr>`;
    showToast('Không thể tải danh sách. Kiểm tra server đã chạy chưa!', 'error');
  }
}

/* ===========================================================
   TÌM KIẾM REALTIME
   =========================================================== */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) { renderTable(allCustomers); return; }

  const filtered = allCustomers.filter(c =>
    (c.CustomerCode      || '').toLowerCase().includes(q) ||
    (c.CustomerShortName || '').toLowerCase().includes(q) ||
    (c.CustomerFullName  || '').toLowerCase().includes(q) ||
    (c.TaxCode           || '').toLowerCase().includes(q) ||
    (c.Address           || '').toLowerCase().includes(q) ||
    (c.Email             || '').toLowerCase().includes(q)
  );
  renderTable(filtered);
});

/* ===========================================================
   MỞ MODAL THÊM MỚI
   =========================================================== */
document.getElementById('btnAddCustomer').addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Thêm khách hàng mới';
  document.getElementById('editId').value = '';
  clearForm();
  modal.classList.add('open');
  document.getElementById('fCustomerCode').focus();
});

document.getElementById('btnCloseModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

function closeModal() {
  modal.classList.remove('open');
}

function clearForm() {
  ['fCustomerCode','fCustomerShortName','fCustomerFullName',
   'fTaxCode','fEmail','fAddress','fBeneficiaryBank','fBankAccountNumber'
  ].forEach(id => document.getElementById(id).value = '');
}

/* ===========================================================
   MỞ MODAL CHỈNH SỬA
   =========================================================== */
async function openEditModal(id) {
  document.getElementById('modalTitle').textContent = '✏️ Chỉnh sửa khách hàng';
  document.getElementById('editId').value = id;

  const customer = allCustomers.find(c => c.Id === id);
  if (customer) {
    fillForm(customer);
  } else {
    try {
      const res = await CustomerAPI.getById(id);
      fillForm(res.data);
    } catch (err) {
      showToast('Không tải được thông tin khách hàng.', 'error');
      return;
    }
  }
  modal.classList.add('open');
}

function fillForm(c) {
  document.getElementById('fCustomerCode').value      = c.CustomerCode      || '';
  document.getElementById('fCustomerShortName').value = c.CustomerShortName || '';
  document.getElementById('fCustomerFullName').value  = c.CustomerFullName  || '';
  document.getElementById('fTaxCode').value           = c.TaxCode           || '';
  document.getElementById('fEmail').value             = c.Email             || '';
  document.getElementById('fAddress').value           = c.Address           || '';
  document.getElementById('fBeneficiaryBank').value   = c.BeneficiaryBank   || '';
  document.getElementById('fBankAccountNumber').value = c.BankAccountNumber || '';
}

/* ===========================================================
   LƯU (THÊM MỚI HOẶC CẬP NHẬT)
   =========================================================== */
document.getElementById('btnSaveCustomer').addEventListener('click', async () => {
  const id   = document.getElementById('editId').value;
  const data = getFormData();

  if (!data.CustomerCode.trim()) {
    showToast('Vui lòng nhập Mã khách hàng!', 'error');
    document.getElementById('fCustomerCode').focus();
    return;
  }
  if (!data.CustomerFullName.trim()) {
    showToast('Vui lòng nhập Tên đầy đủ!', 'error');
    document.getElementById('fCustomerFullName').focus();
    return;
  }

  const btn = document.getElementById('btnSaveCustomer');
  btn.disabled = true;
  btn.textContent = 'Đang lưu...';

  try {
    if (id) {
      await CustomerAPI.update(id, data);
      showToast('✅ Cập nhật khách hàng thành công!', 'success');
    } else {
      await CustomerAPI.create(data);
      showToast('✅ Thêm mới khách hàng thành công!', 'success');
    }
    closeModal();
    await loadCustomers();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Lưu';
  }
});

function getFormData() {
  return {
    CustomerCode:      document.getElementById('fCustomerCode').value.trim(),
    CustomerShortName: document.getElementById('fCustomerShortName').value.trim(),
    CustomerFullName:  document.getElementById('fCustomerFullName').value.trim(),
    TaxCode:           document.getElementById('fTaxCode').value.trim(),
    Email:             document.getElementById('fEmail').value.trim(),
    Address:           document.getElementById('fAddress').value.trim(),
    BeneficiaryBank:   document.getElementById('fBeneficiaryBank').value.trim(),
    BankAccountNumber: document.getElementById('fBankAccountNumber').value.trim(),
  };
}

/* ===========================================================
   XÓA KHÁCH HÀNG
   =========================================================== */
function openDeleteConfirm(id, name) {
  pendingDeleteId = id;
  document.getElementById('confirmMsg').textContent =
    `Bạn có chắc muốn xóa "${name}"? Hành động này không thể hoàn tác.`;
  confirmOv.classList.add('open');
}

document.getElementById('btnCancelDelete').addEventListener('click', () => {
  pendingDeleteId = null;
  confirmOv.classList.remove('open');
});

document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
  if (!pendingDeleteId) return;

  const btn = document.getElementById('btnConfirmDelete');
  btn.disabled = true;
  btn.textContent = 'Đang xóa...';

  try {
    await CustomerAPI.remove(pendingDeleteId);
    showToast('✅ Đã xóa khách hàng.', 'success');
    confirmOv.classList.remove('open');
    pendingDeleteId = null;
    await loadCustomers();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Xóa';
  }
});

/* ===========================================================
   NÚT TẢI LẠI
   =========================================================== */
document.getElementById('btnReload').addEventListener('click', loadCustomers);

/* ===========================================================
   TOAST THÔNG BÁO
   =========================================================== */
let toastTimer = null;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
}

/* ===========================================================
   KHỞI CHẠY KHI TRANG LOAD
   =========================================================== */
loadCustomers();