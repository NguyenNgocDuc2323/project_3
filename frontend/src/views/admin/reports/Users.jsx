import React, { useEffect, useMemo, useState } from 'react'
import { reportService } from '../../../common/services'
import { downloadCsv } from '../../../common/utils'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './Reports.css'

const USER_CSV_COLUMNS = [
  { key: 'userId', label: 'User ID' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'ordersCount', label: 'Orders Count' },
  { key: 'totalSpent', label: 'Total Spent (VND)' },
  { key: 'averageOrderValue', label: 'Avg Order Value (VND)' }
]

const AdminReportsUsers = () => {
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

      const res = await reportService.getUserSales(params)
      setItems(res.data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to load user sales', err)
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

  const handleExportCsv = () => {
    if (items.length === 0) return
    const rows = items.map((item) => ({
      userId: item.userId,
      fullName: item.fullName || item.username || 'Customer',
      email: item.email || '',
      ordersCount: item.ordersCount ?? 0,
      totalSpent: item.totalSpent ?? 0,
      averageOrderValue: item.averageOrderValue ?? 0
    }))
    const from = filters.from || 'start'
    const to = filters.to || 'end'
    downloadCsv(rows, USER_CSV_COLUMNS, `user-sales-report_${from}_${to}.csv`)
  }

  return (
    <div className="admin-reports container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">
            <i className="bi bi-person-lines-fill me-2"></i>
            Customer Sales Report
          </h1>
          <p className="text-muted mb-0">
            Top customers by order count and total spending.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={handleExportCsv}
          disabled={loading || items.length === 0}
          title="Download"
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
                  <th>Customer</th>
                  <th className="text-end">Orders</th>
                  <th className="text-end">Total spent</th>
                  <th className="text-end">Avg. order value</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr key={item.userId}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>
                        <div className="fw-semibold">
                          {item.fullName || item.username || 'Customer'}
                        </div>
                        <div className="text-muted small">
                          ID: {item.userId}
                          {item.email && <> · {item.email}</>}
                        </div>
                      </td>
                      <td className="text-end">{item.ordersCount}</td>
                      <td className="text-end">{formatCurrency(item.totalSpent)}</td>
                      <td className="text-end">{formatCurrency(item.averageOrderValue)}</td>
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

export default AdminReportsUsers

