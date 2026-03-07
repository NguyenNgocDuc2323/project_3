import React, { useEffect, useMemo, useState } from 'react'
import { reportService } from '../../../common/services'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './Reports.css'

const AdminReportsInvoices = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: 'Paid'
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
      if (filters.status) params.status = filters.status

      const res = await reportService.getInvoices(params)
      setItems(res.data || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to load invoices', err)
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

  const formatDateTime = (value) => {
    if (!value) return ''
    const dt = new Date(value)
    return dt.toLocaleString('vi-VN')
  }

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  return (
    <div className="admin-reports container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">
            <i className="bi bi-receipt-cutoff me-2"></i>
            Invoice & Payment Log
          </h1>
          <p className="text-muted mb-0">
            List of payment transactions for invoicing and reporting.
          </p>
        </div>
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
            <div className="col-md-3">
              <label className="form-label small text-muted">Payment status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
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
                  <th>Order</th>
                  <th className="text-end">Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Created at</th>
                  <th>Paid at</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr key={item.paymentId}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>
                        <div className="fw-semibold">
                          {item.fullName || item.username || 'Customer'}
                        </div>
                        <div className="text-muted small">
                          ID: {item.userId}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">ĐH #{item.orderId}</div>
                        {item.reference && (
                          <div className="text-muted small">
                            Ref: {item.reference}
                          </div>
                        )}
                      </td>
                      <td className="text-end">{formatCurrency(item.amount)}</td>
                      <td>
                        <div>{item.method || '-'}</div>
                        {item.provider && (
                          <div className="text-muted small">{item.provider}</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge bg-${item.status === 'Paid' ? 'success' : item.status === 'Pending' ? 'warning' : 'secondary'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{item.paidAt ? formatDateTime(item.paidAt) : '-'}</td>
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
          label="invoices"
        />
      )}
    </div>
  )
}

export default AdminReportsInvoices

