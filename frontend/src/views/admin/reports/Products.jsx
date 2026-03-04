import React, { useEffect, useMemo, useState } from 'react'
import { reportService } from '../../../common/services'
import { downloadCsv } from '../../../common/utils'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './Reports.css'

const PRODUCT_CSV_COLUMNS = [
  { key: 'productId', label: 'Product ID' },
  { key: 'productName', label: 'Product Name' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'revenue', label: 'Revenue (VND)' }
]

const AdminReportsProducts = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    top: 10
  })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      if (filters.top) params.top = filters.top

      const res = await reportService.getProductSales(params)
      setItems(res.data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to load product sales', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const handleExportCsv = () => {
    if (items.length === 0) return
    const rows = items.map((item) => ({
      productId: item.productId,
      productName: item.productName || '',
      quantity: item.quantity ?? 0,
      revenue: item.revenue ?? 0
    }))
    const from = filters.from || 'start'
    const to = filters.to || 'end'
    downloadCsv(rows, PRODUCT_CSV_COLUMNS, `product-sales-report_${from}_${to}.csv`)
  }

  return (
    <div className="admin-reports container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">
            <i className="bi bi-box-seam me-2"></i>
            Product Sales Report
          </h1>
          <p className="text-muted mb-0">
            Top products by quantity sold and revenue.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={handleExportCsv}
          disabled={loading || items.length === 0}
          title="Export báo cáo thống kê theo sản phẩm ra file CSV"
        >
          <i className="bi bi-file-earmark-spreadsheet me-1"></i>
          Export CSV
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small text-muted">From date</label>
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">To date</label>
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted">Top</label>
              <input
                type="number"
                min={1}
                max={100}
                name="top"
                value={filters.top}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-dark w-100"
                onClick={loadData}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Filter'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th className="text-end">Quantity</th>
                  <th className="text-end">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.productId}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="me-3 rounded"
                              style={{ width: 48, height: 48, objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{item.productName}</div>
                            <div className="text-muted small">ID: {item.productId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {items.length > 0 && (
        <Pagination
          totalItems={items.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          showPageSizeSelect
          label="items"
        />
      )}
    </div>
  )
}

export default AdminReportsProducts

