import React, { useEffect, useState } from 'react'
import { reportService } from '../../../common/services'
import './Reports.css'

const AdminReportsDashboard = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: ''
  })
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to

      const res = await reportService.getSummary(params)
      setSummary(res.data)
    } catch (err) {
      console.error('Failed to load sales summary', err)
      setSummary(null)
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

  return (
    <div className="admin-reports container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Sales Report
          </h1>
          <p className="text-muted mb-0">
            Overview of revenue, orders, and customers for the selected period.
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
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-dark w-100"
                onClick={loadSummary}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    View report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="row g-4">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 report-card-primary">
              <div className="card-body">
                <div className="text-muted small mb-1">Total revenue</div>
                <div className="h4 fw-bold mb-0">{formatCurrency(summary.totalRevenue)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Orders</div>
                <div className="h4 fw-bold mb-0">{summary.ordersCount}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Customers</div>
                <div className="h4 fw-bold mb-0">{summary.customersCount}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Average order value</div>
                <div className="h4 fw-bold mb-0">{formatCurrency(summary.averageOrderValue)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Paid orders</div>
                <div className="h4 fw-bold mb-0">{summary.paidOrdersCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReportsDashboard

