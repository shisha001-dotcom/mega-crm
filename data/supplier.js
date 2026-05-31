const SupplierAPI = (() => {
  const BASE_URL = 'http://localhost:3000/api/suppliers';

  async function request(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `Lỗi HTTP ${res.status}`);
    return json;
  }

  return {
    getAll()         { return request(BASE_URL); },
    getById(id)      { return request(`${BASE_URL}/${id}`); },
    create(data)     { return request(BASE_URL, { method: 'POST', body: JSON.stringify(data) }); },
    update(id, data) { return request(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    remove(id)       { return request(`${BASE_URL}/${id}`, { method: 'DELETE' }); },
  };
})();