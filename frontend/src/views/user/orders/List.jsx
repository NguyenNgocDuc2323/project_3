import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
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

const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed') return 'text-bg-success'
  if (s === 'cancelled') return 'text-bg-danger'
  if (s === 'shipped') return 'text-bg-info'
  if (s === 'paid') return 'text-bg-primary'
  if (s === 'processing') return 'text-bg-warning'
  return 'text-bg-secondary'
}

const UserOrdersList = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const goDetail = (orderId) => navigate(`${ROUTES.USER_ORDERS_DETAIL}/${orderId}`)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await orderService.getAll()
        if (!mounted) return
        setOrders(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error('Failed to load your orders:', e)
        if (!mounted) return
        const msg = e?.response?.data?.message || 'Failed to load your orders'
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
  }, [])

  const totalOrders = orders.length
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize))
  const page = Math.max(1, Math.min(currentPage, totalPages))
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize
    return orders.slice(start, start + pageSize)
  }, [orders, page, pageSize])

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
                My Orders
              </h1>
              <div className="text-muted small mt-1">
                Track your purchases and view order details anytime.
              </div>
            </div>
            <button className="btn btn-outline-dark lux-cta" onClick={() => navigate(ROUTES.SHOP)}>
              <i className="bi bi-shop me-2"></i>
              Continue shopping
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status"></span>
            <span>Loading...</span>
          </div>
        ) : totalOrders === 0 ? (
          <div className="card shadow-sm lux-empty">
            <div className="card-body text-center py-5">
              <div className="lux-empty-icon mb-3">
                <i className="bi bi-bag-heart"></i>
              </div>
              <div className="fw-semibold">No orders yet</div>
              <div className="text-muted mt-1">Find your perfect gemstone and place your first order.</div>
              <button className="btn btn-dark mt-3" onClick={() => navigate(ROUTES.SHOP)}>
                <i className="bi bi-gem me-2"></i>
                Start shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3">
              {paginatedOrders.map((o) => {
              const preview = Array.isArray(o.itemsPreview) ? o.itemsPreview : []
              const first = preview[0]
              const itemCount = Number(o.itemCount || 0)
              const titleBase = first?.productName || `Order #${o.id}`
              const title = itemCount > 1 ? `${titleBase} + ${itemCount - 1} more` : titleBase

              const headerQty = itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : ''
              const itemLines = preview

              const thumbItems = preview.filter(it => !!it?.imageUrl).slice(0, 4)
              const thumbs = thumbItems.length > 0
                ? thumbItems.map((it, idx) => (
                  <span className="lux-thumb" key={`${o.id}-${it.productId}-${idx}`}>
                    <img
                      className="lux-thumb-img"
                      src={it.imageUrl}
                      alt={it.productName || 'Product'}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </span>
                ))
                : (
                  <span className="lux-thumb lux-thumb--icon" aria-hidden="true">
                    <i className="bi bi-gem"></i>
                  </span>
                )

              return (
                <div className="col-12" key={o.id}>
                  <div
                    className="card order-card shadow-sm lux-order-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => goDetail(o.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') goDetail(o.id)
                    }}
                  >
                    <div className="card-body">
                      <div className="lux-order-grid">
                        <div className="lux-order-left">
                          <div className="order-thumbs lux-thumbs">{thumbs}</div>

                          <div className="lux-order-main" style={{ minWidth: 0 }}>
                            <div className="lux-order-head">
                              <div className="lux-order-head-left">
                                <h5 className="m-0 fw-bold text-truncate lux-order-title">
                                  {title}
                                </h5>
                                <span className={`badge lux-status ${getStatusBadgeClass(o.status)}`}>{o.status || '-'}</span>
                              </div>
                            </div>

                            <div className="order-meta lux-meta mt-2">
                              <span>
                                <i className="bi bi-clock me-1"></i>
                                {formatDateTime(o.createdAt)}
                              </span>
                            </div>

                            {itemLines.length > 0 && (
                              <div className="lux-items">
                                {itemLines.map((it, idx) => (
                                  <div className="lux-item-line" key={`${o.id}-item-${it.productId}-${idx}`}>
                                    <i className="bi bi-bag me-2"></i>
                                    <div className="name text-truncate">{it.productName || 'Product'}</div>
                                    <div className="qty">x {it.quantity}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="lux-order-right">
                          {headerQty && (
                            <div className="lux-count-wrap">
                              <span className="lux-count-badge">{headerQty}</span>
                            </div>
                          )}
                          <div className="lux-total-label">Total</div>
                          <div className="order-total lux-total">{formatMoney(o.total)}</div>
                          <div className="lux-view">
                            View details <i className="bi bi-arrow-right ms-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
            <Pagination
              totalItems={totalOrders}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              showPageSizeSelect
              label="orders"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default UserOrdersList

