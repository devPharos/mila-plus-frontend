
import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2, ChevronLeft, ChevronRight, FileSpreadsheet, Search } from "lucide-react";
import api, { baseURL } from "~/services/api";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const DEBOUNCE_MS = 450;

export default function DefaultRateModal({ isOpen, onClose, periodData }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const limit = 10;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm((searchTerm || "").trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen && periodData) {
      setCurrentPage(1);
      setSearchTerm("");
      setDebouncedTerm("");
      loadDetailData();
    }
  }, [isOpen, periodData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedTerm]);

  async function loadDetailData() {
    if (!periodData) return;
    setLoading(true);
    try {
      const params = {
        period_from: periodData.from,
        period_to: periodData.to,
        period_by: "Due Date",
        orderBy: "due_date",
        orderASC: "ASC",
        _t: Date.now(),
      };
      const response = await api.get("/reports/default-rate/detail", { params });
      setData(response.data);
    } catch (err) {
      console.error("Error loading default rate detail:", err);
      toast(err?.response?.data?.error || "Error loading detail data", {
        type: "error",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleExportExcel() {
    if (!periodData) return;
    setExportingExcel(true);
    try {
      const response = await api.get("/reports/default-rate/detail/excel", {
        params: {
          period_from: periodData.from,
          period_to: periodData.to,
          period_by: "Due Date",
        },
      });
      const { name } = response.data;
      saveAs(`${baseURL}/get-file/${name}`, name);
      toast("Excel file downloaded successfully!", {
        type: "success",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      toast(err?.response?.data?.error || "Error exporting to Excel", {
        type: "error",
        autoClose: 3000,
      });
    } finally {
      setExportingExcel(false);
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}/${year}`;
  };

  const normalized = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const clientFilteredRows = useMemo(() => {
    if (!data?.rows) return [];
    const term = normalized(debouncedTerm);
    if (!term) return data.rows;
    return data.rows.filter((row) => {
      const invoice = normalized(row.invoice_number);
      const issuer = normalized(row.issuer?.name);
      const branch = normalized(row.filial?.name);
      return invoice.includes(term) || issuer.includes(term) || branch.includes(term);
    });
  }, [data?.rows, debouncedTerm]);

  const totalRowsUI = clientFilteredRows.length;
  const totalPages = totalRowsUI ? Math.ceil(totalRowsUI / limit) : 0;

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return clientFilteredRows.slice(start, start + limit);
  }, [clientFilteredRows, currentPage]);

  const startRecord = totalRowsUI ? (currentPage - 1) * limit + 1 : 0;
  const endRecord = totalRowsUI ? Math.min(currentPage * limit, totalRowsUI) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${isMobile ? "w-full h-full" : "w-full max-w-7xl max-h-[90vh]"} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold`}>Delinquency Details - {periodData?.period}</h2>
            {data?.period && (
              <p className="text-sm text-gray-600 mt-1">
                {Number(data.period.rate ?? 0).toFixed(2)}% delinquency rate • {USDollar.format(data.period.overdue || 0)} overdue of {USDollar.format(data.period.total || 0)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              {totalRowsUI > 0 && (
                <>
                  <span>
                    Showing <span className="font-semibold">{startRecord}</span> to <span className="font-semibold">{endRecord}</span> of <span className="font-semibold">{totalRowsUI}</span> rows
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading || totalPages <= 1}
                  >
                    {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span>of {totalPages}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by invoice, issuer, branch..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="w-full sm:w-80 pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  {searchTerm && (
                    <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleExportExcel}
                disabled={exportingExcel || !data}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {exportingExcel ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin" size={36} />
            </div>
          ) : data && clientFilteredRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Issuer</th>
                    {!isMobile && <th className="text-left p-3 text-sm font-semibold text-gray-700">Branch</th>}
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Discount</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Fee</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Balance</th>
                    {!isMobile && <th className="text-center p-3 text-sm font-semibold text-gray-700">Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((row, idx) => (
                    <tr
                      key={row.id ?? `${row.invoice_number}-${idx}`}
                      className={`border-b hover:bg-green-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="p-3 text-sm font-medium text-gray-900">{row.invoice_number}</td>
                      <td className="p-3 text-sm text-gray-700">{row.issuer?.name || "-"}</td>
                      {!isMobile && <td className="p-3 text-sm text-gray-700">{row.filial?.name || "-"}</td>}
                      <td className="p-3 text-sm text-gray-700">{formatDate(row.due_date)}</td>
                      <td className="p-3 text-sm text-right text-gray-900">{USDollar.format(row.amount || 0)}</td>
                      <td className="p-3 text-sm text-right text-red-600">{row.discount ? `(${USDollar.format(row.discount)})` : "-"}</td>
                      <td className="p-3 text-sm text-right text-gray-900">{row.fee ? USDollar.format(row.fee) : "-"}</td>
                      <td className="p-3 text-sm text-right text-gray-900">{USDollar.format(row.total)}</td>
                      <td className="p-3 text-sm text-right font-semibold text-gray-900">{USDollar.format(row.balance)}</td>
                      {!isMobile && (
                        <td className="p-3 text-sm text-center">
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            {row.status}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              {debouncedTerm ? `No results found for "${debouncedTerm}"` : "No overdue receivables found for this period"}
            </div>
          )}
        </div>

        {totalRowsUI > 0 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors bg-white"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm px-3 font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors bg-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}