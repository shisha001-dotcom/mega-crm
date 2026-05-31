/* ---- Biến trạng thái ---- */
let allSuppliers    = [];
let pendingDeleteId = null;

/* ---- DOM references ---- */
const tbody       = document.getElementById('supplierTableBody');
const searchInput = document.getElementById('searchInput');
const recordCount = document.getElementById('recordCount');
const modal       = document.getElementById('supplierModal');
const confirmOv   = document.getElementById('confirmOverlay');

/* ===========================================================
   RENDER BẢNG
   =========================================================== */
function renderTable(list) {
  if (list.length === 0) {
    tbody.innerHTML = `<tr class="state-row"><td colspan="11">Không có dữ liệu phù hợp.</td></tr>`;
    recordCount.textContent = '';
    return;
  }

  tbody.innerHTML = list.map((s, i) => `
    <tr>
      <td style="color:var(--sub);font-size:13px;">${i + 1}</td>
      <td><strong>${esc(s.SupplierCode)}</strong></td>
      <td>${esc(s.SupplierShortName)}</td>
      <td>${esc(s.SupplierFullName)}</td>
      <td style="font-family:monospace;">${esc(s.TaxCode)}</td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          title="${esc(s.Address)}">${esc(s.Address)}</td>
      <td>${esc(s.Email)}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          title="${esc(s.BeneficiaryBank)}">${esc(s.BeneficiaryBank)}</td>
      <td style="text-align:center;">
        <span style="background:#dbeafe;color:#2563eb;padding:4px 10px;border-radius:8px;font-weight:600;">
          ${s.PaymentDays} ngày
        </span>
      </td>
      <td style="color:var(--sub);font-size:13px;">${esc(s.CreatedDate)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit"
                  onclick="openEditModal(${s.Id})">✏️ Sửa</button>
          <button class="btn-delete"
                  onclick="openDeleteConfirm(${s.Id}, '${esc(s.SupplierFullName)}')">🗑️ Xóa</button>
        </div>
      </td>
    </tr>
  `).join('');

  recordCount.textContent = `Tổng: ${list.length} nhà cung cấp`;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ===========================================================
   TẢI DỮ LIỆU
   =========================================================== */
async function loadSuppliers() {
  tbody.innerHTML = `<tr class="state-row"><td colspan="11">⏳ Đang tải...</td></tr>`;
  try {
    const res = await SupplierAPI.getAll();
    allSuppliers = res.data || [];
    renderTable(allSuppliers);
  } catch (err) {
    tbody.innerHTML = `<tr class="state-row"><td colspan="11">❌ Lỗi: ${esc(err.message)}</td></tr>`;
    showToast('Không thể tải danh sách. Kiểm tra server!', 'error');
  }
}

/* ===========================================================
   TÌM KIẾM REALTIME
   =========================================================== */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) { renderTable(allSuppliers); return; }

  const filtered = allSuppliers.filter(s =>
    (s.SupplierCode      || '').toLowerCase().includes(q) ||
    (s.SupplierShortName || '').toLowerCase().includes(q) ||
    (s.SupplierFullName  || '').toLowerCase().includes(q) ||
    (s.TaxCode           || '').toLowerCase().includes(q) ||
    (s.Address           || '').toLowerCase().includes(q) ||
    (s.Email             || '').toLowerCase().includes(q)
  );
  renderTable(filtered);
});

/* ===========================================================
   MODAL THÊM MỚI
   =========================================================== */
document.getElementById('btnAddSupplier').addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Thêm nhà cung cấp mới';
  document.getElementById('editId').value = '';
  clearForm();
  modal.classList.add('open');
  document.getElementById('fSupplierCode').focus();
});

document.getElementById('btnCloseModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

function closeModal() {
  modal.classList.remove('open');
}

function clearForm() {
  ['fSupplierCode','fSupplierShortName','fSupplierFullName',
   'fTaxCode','fEmail','fAddress','fBeneficiaryBank','fBankAccountNumber'
  ].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fPaymentDays').value = 30;
}

/* ===========================================================
   MODAL CHỈNH SỬA
   =========================================================== */
async function openEditModal(id) {
  document.getElementById('modalTitle').textContent = '✏️ Chỉnh sửa nhà cung cấp';
  document.getElementById('editId').value = id;

  const supplier = allSuppliers.find(s => s.Id === id);
  if (supplier) {
    fillForm(supplier);
  } else {
    try {
      const res = await SupplierAPI.getById(id);
      fillForm(res.data);
    } catch (err) {
      showToast('Không tải được thông tin nhà cung cấp.', 'error');
      return;
    }
  }
  modal.classList.add('open');
}

function fillForm(s) {
  document.getElementById('fSupplierCode').value      = s.SupplierCode      || '';
  document.getElementById('fSupplierShortName').value = s.SupplierShortName || '';
  document.getElementById('fSupplierFullName').value  = s.SupplierFullName  || '';
  document.getElementById('fTaxCode').value           = s.TaxCode           || '';
  document.getElementById('fEmail').value             = s.Email             || '';
  document.getElementById('fAddress').value           = s.Address           || '';
  document.getElementById('fBeneficiaryBank').value   = s.BeneficiaryBank   || '';
  document.getElementById('fBankAccountNumber').value = s.BankAccountNumber || '';
  document.getElementById('fPaymentDays').value       = s.PaymentDays       || 30;
}

/* ===========================================================
   LƯU
   =========================================================== */
document.getElementById('btnSaveSupplier').addEventListener('click', async () => {
  const id   = document.getElementById('editId').value;
  const data = getFormData();

  if (!data.SupplierCode.trim()) {
    showToast('Vui lòng nhập Mã nhà cung cấp!', 'error');
    document.getElementById('fSupplierCode').focus();
    return;
  }
  if (!data.SupplierFullName.trim()) {
    showToast('Vui lòng nhập Tên đầy đủ!', 'error');
    document.getElementById('fSupplierFullName').focus();
    return;
  }

  const btn = document.getElementById('btnSaveSupplier');
  btn.disabled = true;
  btn.textContent = 'Đang lưu...';

  try {
    if (id) {
      await SupplierAPI.update(id, data);
      showToast('✅ Cập nhật nhà cung cấp thành công!', 'success');
    } else {
      await SupplierAPI.create(data);
      showToast('✅ Thêm mới nhà cung cấp thành công!', 'success');
    }
    closeModal();
    await loadSuppliers();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Lưu';
  }
});

function getFormData() {
  return {
    SupplierCode:      document.getElementById('fSupplierCode').value.trim(),
    SupplierShortName: document.getElementById('fSupplierShortName').value.trim(),
    SupplierFullName:  document.getElementById('fSupplierFullName').value.trim(),
    TaxCode:           document.getElementById('fTaxCode').value.trim(),
    Email:             document.getElementById('fEmail').value.trim(),
    Address:           document.getElementById('fAddress').value.trim(),
    BeneficiaryBank:   document.getElementById('fBeneficiaryBank').value.trim(),
    BankAccountNumber: document.getElementById('fBankAccountNumber').value.trim(),
    PaymentDays:       parseInt(document.getElementById('fPaymentDays').value) || 30,
  };
}

/* ===========================================================
   XÓA
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
    await SupplierAPI.remove(pendingDeleteId);
    showToast('✅ Đã xóa nhà cung cấp.', 'success');
    confirmOv.classList.remove('open');
    pendingDeleteId = null;
    await loadSuppliers();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Xóa';
  }
});

/* ===========================================================
   RELOAD
   =========================================================== */
document.getElementById('btnReload').addEventListener('click', loadSuppliers);

/* ===========================================================
   TOAST
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
   KHỞI CHẠY
   =========================================================== */
loadSuppliers();