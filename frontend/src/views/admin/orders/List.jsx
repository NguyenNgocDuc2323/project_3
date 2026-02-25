import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminOrderService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import './List.css'

const STATUSES = ['', 'Pending', 'Paid', 'Processing', 'Shipped', 'Completed', 'Cancelled']
const PAYMENT_METHODS = [
  { value: '', label: 'All payments' },
  { value: 'cod', label: 'COD' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'vnpay', label: 'VNPay' }
]

const getCustomerName = (o) => o?.user?.fullName || o?.user?.username || 'Unknown'

const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed') return 'badge bg-success'
  if (s === 'cancelled') return 'badge bg-danger'
  if (s === 'shipped') return 'badge bg-info text-dark'
  if (s === 'paid') return 'badge bg-primary'
  if (s === 'processing') return 'badge bg-warning text-dark'
  return 'badge bg-secondary'
}

const formatMoney = (value) => {
  const num = Number(value || 0)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

const AdminOrdersList = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')
  const [manualRefresh, setManualRefresh] = useState(0)
  const [downloadingId, setDownloadingId] = useState(null)

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingId(orderId)
    try {
      await adminOrderService.downloadInvoice(orderId)
      if (window.showToast) {
        window.showToast({ severity: 'success', summary: 'Success', detail: 'Invoice downloaded', life: 3000 })
      }
    } catch (e) {
      console.error('Download invoice failed:', e)
      const msg = e?.response?.data?.message || 'Failed to download invoice'
      if (window.showToast) {
        window.showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
      }
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 400)
    return () => clearTimeout(t)
  }, [q])

  const filters = useMemo(() => ({
    status: status || null,
    paymentMethod: paymentMethod || null,
    q: String(qDebounced || '').trim()
  }), [status, paymentMethod, qDebounced])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await adminOrderService.getAll(filters)
        if (!mounted) return
        setOrders(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error('Failed to load orders:', e)
        if (!mounted) return
        const msg = e?.response?.data?.message || 'Failed to load orders'
        setError(msg)
        if (window.showToast) {
          window.showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [filters, manualRefresh])

  return (
    <div className="admin-orders-list">
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-2">
              <i className="bi bi-receipt me-2"></i>
              Manage Orders
            </h1>
            <p className="text-muted">Review customer purchases and update statuses</p>
          </div>
          <button
            className="btn btn-outline-dark"
            onClick={() => setManualRefresh((x) => x + 1)}
            disabled={loading}
            title="Refresh"
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-4 g-2 align-items-center">
          <div className="col-12 col-md-2">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s ? s : 'All statuses'}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Order ID, username, email, fullname, phone..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-2">
            <div className="admin-filter-actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setStatus('')
                  setPaymentMethod('')
                  setQ('')
                  setQDebounced('')
                }}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }}>STT</th>
                    <th>Customer</th>
                    <th style={{ width: '240px' }}>Email</th>
                    <th style={{ width: '160px' }}>Phone</th>
                    <th style={{ width: '190px' }}>Payment</th>
                    <th style={{ width: '160px' }}>Status</th>
                    <th style={{ width: '220px' }}>Time</th>
                    <th className="text-end" style={{ width: '180px' }}>Total</th>
                    <th style={{ width: '110px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="9" className="py-5">
                        <div className="d-flex justify-content-center align-items-center gap-2 text-muted">
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && orders.length > 0 ? (
                    orders.map((o, idx) => (
                      <tr key={o.id ?? idx}>
                        <td className="fw-bold">{idx + 1}</td>
                        <td>
                          <div className="fw-bold">{getCustomerName(o)}</div>
                        </td>
                        <td>{o.user?.email || <span className="text-muted">-</span>}</td>
                        <td>{o.user?.phone || <span className="text-muted">-</span>}</td>
                        <td>{o.paymentMethod || <span className="text-muted">-</span>}</td>
                        <td>
                          <span className={getStatusBadgeClass(o.status)}>{o.status || '-'}</span>
                        </td>
                        <td>{formatDateTime(o.createdAt)}</td>
                        <td className="text-end fw-bold">{formatMoney(o.total)}</td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-dark"
                              onClick={() => navigate(`${ROUTES.ADMIN_ORDERS_DETAIL}/${o.id}`)}
                              title="View"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleDownloadInvoice(o.id)}
                              disabled={downloadingId === o.id}
                              title="Download invoice (PDF)"
                            >
                              {downloadingId === o.id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <i className="bi bi-download"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (!loading && (
                    <tr>
                      <td colSpan="9" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-2"></i>
                        No orders found
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  )
}

export default AdminOrdersList

