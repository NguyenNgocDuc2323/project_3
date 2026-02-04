import React, { useEffect, useState } from 'react'
import { Container, Card, Button } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../common/constants'
import './PaymentCallback.css'

const PaymentCallback = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const responseCode = params.get('vnp_ResponseCode')
    const txnRef = params.get('vnp_TxnRef')
    
    const statusZalo = params.get('status')
    
    if (responseCode === '00' || statusZalo === '1') {
      setStatus('success')
      setOrderId(txnRef || 'ZaloPay')
      
      // Clear cart on success
      cartService.clear().then(() => {
        window.dispatchEvent(new Event('cart:updated'))
      }).catch(err => console.error('Failed to clear cart:', err))

      window.showToast?.({
        severity: 'success',
        summary: 'Thanh toán thành công',
        detail: `Đơn hàng #${txnRef} đã được thanh toán.`
      })
    } else {
      setStatus('error')
      window.showToast?.({
        severity: 'error',
        summary: 'Thanh toán thất bại',
        detail: 'Giao dịch đã bị hủy hoặc có lỗi xảy ra.'
      })
    }
  }, [location])

  return (
    <Container className="py-5 my-5 text-center">
      <Card className="payment-result-card border-0 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body className="p-5">
          {status === 'processing' && (
            <div className="py-4">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <h4>Đang kiểm tra kết quả giao dịch...</h4>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="result-icon success mb-4">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h2 className="mb-3">Thanh toán thành công!</h2>
              <p className="text-muted mb-4">
                Cảm ơn bạn đã mua sắm. Đơn hàng <strong>#{orderId}</strong> của bạn đang được xử lý.
              </p>
              <Button variant="dark" className="px-4 py-2" onClick={() => navigate(ROUTES.DASHBOARD)}>
                Xem đơn hàng của tôi
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="result-icon error mb-4">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <h2 className="mb-3">Thanh toán thất bại</h2>
              <p className="text-muted mb-4">
                Đã có lỗi xảy ra trong quá trình thanh toán hoặc giao dịch đã bị hủy.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="outline-dark" onClick={() => navigate(ROUTES.CHECKOUT)}>
                  Thử lại
                </Button>
                <Button variant="dark" onClick={() => navigate(ROUTES.SHOP)}>
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default PaymentCallback
