import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { orderService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import './Orders.css'

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

const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed') return 'text-bg-success'
  if (s === 'cancelled') return 'text-bg-danger'
  if (s === 'shipped') return 'text-bg-info'
  if (s === 'paid') return 'text-bg-primary'
  if (s === 'processing') return 'text-bg-warning'
  return 'text-bg-secondary'
}

const canConfirmDelivery = (status) => {
  const s = String(status || '').trim()
  return s === 'Paid' || s === 'Shipped'
}

const UserOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const fees = useMemo(() => computeFees(order), [order])

  const handleConfirmDelivery = async () => {
    if (!order?.id || !canConfirmDelivery(order.status)) return
    setConfirming(true)
    setError('')
    try {
      const res = await orderService.confirmDelivery(order.id)
      setOrder(prev => prev ? { ...prev, status: res.data?.status ?? 'Completed', updatedAt: res.data?.updatedAt } : prev)
      if (window.showToast) {
        window.showToast({ severity: 'success', summary: 'Success', detail: 'Delivery confirmed.', life: 3000 })
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Could not confirm. Please try again.'
      setError(msg)
      if (window.showToast) {
        window.showToast({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })
      }
    } finally {
      setConfirming(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await orderService.getById(id)
        if (!mounted) return
        setOrder(res.data || null)
      } catch (e) {
        console.error('Failed to load order detail:', e)
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

  return (
    <div className="user-orders-page py-4">
      <div className="container">
        <div className="lux-orders-hero mb-3">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2">
            <div>
              <div className="lux-eyebrow">
                <i className="bi bi-gem me-2"></i>
                Diamonds
              </div>
              <h1 className="h2 m-0 fw-bold lux-title">
                Order Detail
              </h1>
              {!loading && order?.id && (
                <div className="text-muted small mt-1">Order #{order.id}</div>
              )}
            </div>
            <button className="btn btn-outline-dark lux-cta" onClick={() => navigate(ROUTES.USER_ORDERS_LIST)}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to orders
            </button>
          </div>
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
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0 fw-bold">Items</h5>
                    <span className="text-muted small">{order.items?.length || 0} lines</span>
                  </div>

                  <div className="order-items-list">
                    {(order.items || []).length === 0 ? (
                      <div className="text-center py-4 text-muted">No items</div>
                    ) : (order.items || []).map((it) => (
                      <div className="order-line" key={it.id}>
                        {it.product?.imageUrl ? (
                          <img className="order-line-thumb" src={it.product.imageUrl} alt={it.product?.name || 'Product'} />
                        ) : (
                          <div className="order-line-thumb d-flex align-items-center justify-content-center bg-light">
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p className="order-line-title text-truncate">{it.product?.name || 'Product'}</p>
                          <div className="order-line-sub">
                            {formatMoney(it.unitPrice)} x {it.quantity}
                          </div>
                        </div>
                        <div className="order-line-right">
                          <div className="fw-bold">{formatMoney(it.totalPrice)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="text-muted small">Status</div>
                      <span className={`badge lux-status ${getStatusBadgeClass(order.status)}`}>{order.status || '-'}</span>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Payment method</div>
                      <div className="fw-semibold">{order.paymentMethod || '-'}</div>
                    </div>
                  </div>
                  {canConfirmDelivery(order.status) && (
                    <div className="mt-3 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={handleConfirmDelivery}
                        disabled={confirming}
                      >
                        {confirming ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Đang xác nhận...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Đã nhận hàng
                          </>
                        )}
                      </button>
                      <div className="text-muted small mt-2">Click when you have received the order.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm mb-3">
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

              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Delivery</h5>
                  <div className="text-muted small mb-1">Shipping address</div>
                  <div className="order-address-block">{order.shippingAddress || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserOrderDetail

