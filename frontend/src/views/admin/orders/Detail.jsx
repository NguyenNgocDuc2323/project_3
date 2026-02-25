import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminOrderService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import './Detail.css'

const STATUSES = ['Pending', 'Paid', 'Processing', 'Shipped', 'Completed', 'Cancelled']

const getStatusClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed') return 'admin-status admin-status--success'
  if (s === 'cancelled') return 'admin-status admin-status--danger'
  if (s === 'shipped') return 'admin-status admin-status--info'
  if (s === 'paid') return 'admin-status admin-status--primary'
  if (s === 'processing') return 'admin-status admin-status--warning'
  return 'admin-status admin-status--secondary'
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

const computeFees = (order) => {
  const subtotal = Number(order?.subtotal || 0)
  const total = Number(order?.total || 0)
  const paymentMethod = String(order?.paymentMethod || '').trim().toLowerCase()
  const paymentFee = paymentMethod === 'cod' ? 15000 : 0
  const shippingFee = Math.max(0, total - subtotal - paymentFee)
  return { subtotal, total, shippingFee, paymentFee }
}

const AdminOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const handleDownloadInvoice = async () => {
    if (!order?.id) return
    setDownloading(true)
    try {
      await adminOrderService.downloadInvoice(order.id)
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
      setDownloading(false)
    }
  }

  const fees = useMemo(() => computeFees(order), [order])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await adminOrderService.getById(id)
        if (!mounted) return
        setOrder(res.data || null)
        setStatus(res.data?.status || '')
      } catch (e) {
        console.error('Failed to load order:', e)
        if (!mounted) return
        const msg = e?.response?.data?.message || 'Failed to load order detail'
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
  }, [id])

  const handleUpdateStatus = async () => {
    if (!order?.id || !status) return
    setSaving(true)
    setError('')
    try {
      const res = await adminOrderService.updateStatus(order.id, status)
      const updatedAt = res.data?.updatedAt || order.updatedAt
      setOrder(prev => prev ? { ...prev, status, updatedAt } : prev)
      if (window.showToast) {
        window.showToast({ severity: 'success', summary: 'Success', detail: 'Order status updated', life: 3000 })
      }
    } catch (e) {
      console.error('Failed to update status:', e)
      const msg = e?.response?.data?.message || 'Failed to update status'
      setError(msg)
      if (window.showToast) {
        window.showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-order-detail">
      <div className="container-fluid">
        <div className="admin-orders-hero mb-3">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2">
            <div>
              <div className="admin-eyebrow">
                <i className="bi bi-gem me-2"></i>
                Diamonds Admin
              </div>
              <h1 className="h2 m-0 fw-bold admin-title">Order Detail</h1>
              {!loading && order?.id && (
                <div className="text-muted small mt-1">Order #{order.id}</div>
              )}
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary admin-cta"
                onClick={handleDownloadInvoice}
                disabled={downloading || !order?.id}
                title="Download invoice (PDF)"
              >
                {downloading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="bi bi-download me-2"></i>
                )}
                Download invoice
              </button>
              <button className="btn btn-outline-dark admin-cta" onClick={() => navigate(ROUTES.ADMIN_ORDERS_LIST)}>
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
            </div>
          </div>

          {!loading && order && (
            <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
              <span className={getStatusClass(order.status)}>{order.status || '-'}</span>
              <span className="admin-pill">
                <i className="bi bi-clock me-1"></i>
                {formatDateTime(order.createdAt)}
              </span>
              <span className="admin-pill">
                <i className="bi bi-credit-card me-1"></i>
                {order.paymentMethod || '-'}
              </span>
              <span className="admin-pill ms-auto">
                <i className="bi bi-cash-coin me-1"></i>
                Total: {formatMoney(order.total)}
              </span>
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status"></span>
            <span>Loading...</span>
          </div>
        ) : !order ? (
          <div className="alert alert-warning">Order not found</div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm mb-3 admin-soft-card">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                      <div className="text-muted small">Customer</div>
                      <div className="fw-semibold">{order.user?.fullName || order.user?.username || 'Unknown'}</div>
                      <div className="text-muted small">{order.user?.email || '-'}</div>
                      <div className="text-muted small">{order.user?.phone || '-'}</div>
                    </div>

                    <div className="text-end">
                      <div className="text-muted small">Placed at</div>
                      <div className="fw-semibold">{formatDateTime(order.createdAt)}</div>
                      <div className="text-muted small mt-2">Last updated</div>
                      <div className="fw-semibold">{formatDateTime(order.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm admin-soft-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0 fw-bold">Items</h5>
                    <span className="text-muted small">{order.items?.length || 0} lines</span>
                  </div>

                  <div className="admin-items-list">
                    {(order.items || []).length === 0 ? (
                      <div className="text-center py-4 text-muted">No items</div>
                    ) : (order.items || []).map((it) => (
                      <div className="admin-item-line" key={it.id}>
                        {it.product?.imageUrl ? (
                          <img className="order-item-thumb" src={it.product.imageUrl} alt={it.product?.name || 'Product'} />
                        ) : (
                          <div className="order-item-thumb d-flex align-items-center justify-content-center bg-light">
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                        <div className="admin-item-main" style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-truncate">{it.product?.name || 'Product'}</div>
                          <div className="text-muted small">
                            {formatMoney(it.unitPrice)} x {it.quantity}
                          </div>
                        </div>
                        <div className="admin-item-right">
                          <div className="fw-bold">{formatMoney(it.totalPrice)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card shadow-sm mb-3 admin-soft-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Status</h5>
                  <div className="d-flex gap-2">
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={saving || status === order.status}>
                      {saving ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                  <div className="text-muted small mt-2">Current: <span className="fw-semibold">{order.status}</span></div>
                </div>
              </div>

              <div className="card shadow-sm mb-3 admin-soft-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Summary</h5>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted">Subtotal</div>
                    <div className="fw-semibold">{formatMoney(fees.subtotal)}</div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <div className="text-muted">Shipping fee</div>
                    <div className="fw-semibold">{formatMoney(fees.shippingFee)}</div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <div className="text-muted">Payment fee</div>
                    <div className="fw-semibold">{formatMoney(fees.paymentFee)}</div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <div className="fw-bold">Total</div>
                    <div className="fw-bold">{formatMoney(fees.total)}</div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm mb-3 admin-soft-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Delivery</h5>
                  <div className="text-muted small mb-1">Shipping address</div>
                  <div className="order-address-block">{order.shippingAddress || '-'}</div>
                </div>
              </div>

              <div className="card shadow-sm mb-3 admin-soft-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Payment</h5>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted">Method</div>
                    <div className="fw-semibold">{order.paymentMethod || '-'}</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-muted small mb-2">Records</div>
                    {(order.payments || []).length === 0 ? (
                      <div className="text-muted small">No payment records</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Status</th>
                              <th className="text-end">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.payments || []).map(p => (
                              <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.status || '-'}</td>
                                <td className="text-end">{formatMoney(p.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrderDetail

