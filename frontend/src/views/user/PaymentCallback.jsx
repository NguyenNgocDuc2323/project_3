import React, { useEffect, useState } from 'react'
import { Container, Card, Button } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../common/constants'
import { cartService } from '../../common/services'
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
        summary: 'Payment successful',
        detail: 'Your payment has been confirmed.'
      })
    } else {
      setStatus('error')
      window.showToast?.({
        severity: 'error',
        summary: 'Payment failed',
        detail: 'The transaction was cancelled or an error occurred.'
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
              <h4>Checking payment status...</h4>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="result-icon success mb-4">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h2 className="mb-3">Payment successful!</h2>
              <p className="text-muted mb-4">
                Thank you for your purchase. Your order is being processed.
              </p>
              <Button variant="dark" className="px-4 py-2" onClick={() => navigate(ROUTES.USER_ORDERS_LIST)}>
                View my orders
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="result-icon error mb-4">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <h2 className="mb-3">Payment failed</h2>
              <p className="text-muted mb-4">
                There was an error during payment, or the transaction was cancelled.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="outline-dark" onClick={() => navigate(ROUTES.CHECKOUT)}>
                  Try again
                </Button>
                <Button variant="dark" onClick={() => navigate(ROUTES.SHOP)}>
                  Continue shopping
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
