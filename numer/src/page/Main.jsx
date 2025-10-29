// src/page/roots.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://api-web-oop-deploy-production.up.railway.app/", // ← ชี้ไปที่ backend ของคุณ
});

export default function Main() {
  // table data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // query params (จะถูกแนบไปกับ GET /roe ถ้า backend รองรับก็ทำงาน ถ้าไม่ก็ไม่เป็นไร)
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState("desc"); // asc | desc

  // pagination meta (fallback เผื่อ API ไม่ส่ง pagination กลับมา)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    order: "DESC",
  });

  // create/edit
  const [newEquation, setNewEquation] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingEquation, setEditingEquation] = useState("");

  // debounce search
  const debouncedQ = useDebounce(q, 300);

  // ------- fetch list -------
  const fetchList = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const params = { page, limit, order };
      if (debouncedQ.trim()) params.q = debouncedQ.trim();

      const { data } = await api.get("/roe", { params });

      // รองรับได้ทั้ง {results: [...] , pagination: {...}} หรือ {results: [...] } อย่างเดียว
      const resultRows = Array.isArray(data?.results) ? data.results : [];
      const p = data?.pagination || {
        page,
        limit,
        total: resultRows.length,
        totalPages: Math.max(1, Math.ceil(resultRows.length / limit)),
        order: (order || "desc").toUpperCase(),
      };

      setRows(resultRows);
      setPagination(p);
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ (GET /roe)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, order, debouncedQ]);

  // ------- CRUD handlers -------
  const handleCreate = async (e) => {
    e.preventDefault();
    const eq = newEquation.trim();
    if (!eq) return;

    try {
      setLoading(true);
      setErrMsg("");
      await api.post("/roe", { equation: eq });
      setNewEquation("");
      if (order === "desc") setPage(1); // ให้รายการใหม่ขึ้นบนสุด
      await fetchList();
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "เพิ่มสมการไม่สำเร็จ (POST /roe)");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (row) => {
    setEditingId(row.id);
    setEditingEquation(row.equation);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingEquation("");
  };

  const handleSaveEdit = async (id) => {
    const eq = editingEquation.trim();
    if (!eq) return;
    try {
      setLoading(true);
      setErrMsg("");
      // PUT ทั้งแถว (API คุณรองรับ /roe/:id)
      await api.put(`/roe/${id}`, { equation: eq });
      setEditingId(null);
      setEditingEquation("");
      await fetchList();
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "แก้ไขไม่สำเร็จ (PUT /roe/:id)");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(`ยืนยันลบ ID ${id} ?`);
    if (!ok) return;
    try {
      setLoading(true);
      setErrMsg("");
      await api.delete(`/roe/${id}`);
      // ถ้าลบแถวสุดท้ายของหน้า ให้เลื่อนกลับหน้าก่อน
      if (rows.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchList();
      }
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "ลบไม่สำเร็จ (DELETE /roe/:id)");
    } finally {
      setLoading(false);
    }
  };

  // ------- UI helpers -------
  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(
    () => page < (pagination?.totalPages || 1),
    [page, pagination?.totalPages]
  );
  const toggleOrder = () => setOrder((o) => (o === "asc" ? "desc" : "asc"));

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Roots Equations Manager (อย่า Insert สิ่งที่ไม่สุภาพกันนะครับ)
      </h1>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">ค้นหา (q)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="เช่น x^5, sin(x) - x/2"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">ต่อหน้า</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value) || 10);
                setPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">เรียงตาม id</label>
            <button
              onClick={toggleOrder}
              className="w-full border rounded-lg px-3 py-2 hover:bg-gray-50"
              title="สลับการเรียง asc/desc"
            >
              {order === "asc" ? "asc ↑" : "desc ↓"}
            </button>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newEquation}
            onChange={(e) => setNewEquation(e.target.value)}
            placeholder="เพิ่มสมการใหม่ เช่น x^3 - x - 2"
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
          >
            เพิ่ม
          </button>
        </form>
      </div>

      {/* Status */}
      {errMsg && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg border">
          {errMsg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 w-20">ID</th>
              <th className="text-left px-4 py-2">Equation</th>
              <th className="text-right px-4 py-2 w-44">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center">
                  กำลังโหลด...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2 align-top">{r.id}</td>
                  <td className="px-4 py-2">
                    {editingId === r.id ? (
                      <input
                        value={editingEquation}
                        onChange={(e) => setEditingEquation(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    ) : (
                      <code className="bg-gray-50 px-2 py-1 rounded">
                        {r.equation}
                      </code>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingId === r.id ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(r.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:opacity-90"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white hover:opacity-90"
                        >
                          ลบ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          หน้า {pagination.page} / {pagination.totalPages} • ทั้งหมด{" "}
          {pagination.total} รายการ
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-2 rounded-lg border ${
              canPrev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
            }`}
          >
            ก่อนหน้า
          </button>
          <input
            type="number"
            min={1}
            max={pagination.totalPages || 1}
            value={page}
            onChange={(e) =>
              setPage(
                clampInt(
                  Number(e.target.value),
                  1,
                  pagination.totalPages || 1
                )
              )
            }
            className="w-20 text-center border rounded-lg px-2 py-2"
          />
          <button
            disabled={!canNext}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages || 1, p + 1))
            }
            className={`px-3 py-2 rounded-lg border ${
              canNext ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
            }`}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function clampInt(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

/** ใช้ debounce สำหรับค้นหา */
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
