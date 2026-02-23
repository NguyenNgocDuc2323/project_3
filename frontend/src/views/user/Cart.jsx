import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Spinner, Alert, Image, Modal } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { cartService } from '../../common/services'
import { ROUTES } from '../../common/constants'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productIdToDelete, setProductIdToDelete] = useState(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartService.getAll()
      setCartItems(response.data || [])
    } catch (error) {
      console.error('Error loading cart:', error)
      setError('Unable to load your cart. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      setUpdating(true)
      await cartService.update(productId, newQuantity)
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.productId || item.ProductId) === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
      window.dispatchEvent(new Event('cart:updated'))
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = (productId) => {
    setProductIdToDelete(productId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!productIdToDelete) return

    try {
      setUpdating(true)
      setShowDeleteModal(false)
      await cartService.remove(productIdToDelete)
      setCartItems(prevItems => prevItems.filter(item => (item.productId || item.ProductId) !== productIdToDelete))
      window.dispatchEvent(new Event('cart:updated'))
      
      window.showToast?.({
        severity: 'success',
        summary: 'Success',
        detail: 'Item removed'
      })
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(false)
      setProductIdToDelete(null)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product?.mrp * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="cart-page d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="dark" />
      </div>
    )
  }

  return (
    <div className="cart-page py-5">
      <Container className="cart-container">
        <h1 className="cart-title mb-5 text-center">Your Shopping Bag</h1>

        {cartItems.length === 0 ? (
          <Card className="cart-card text-center py-5 border-0 shadow-sm">
            <Card.Body>
              <i className="bi bi-bag-x display-1 text-muted mb-4"></i>
              <h3>Your bag is empty</h3>
              <p className="text-muted mb-4">Looks like you haven't added any jewelry yet.</p>
              <Button variant="dark" size="lg" className="btn-checkout px-5" onClick={() => navigate(ROUTES.SHOP)}>
                Explore Collections
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="cart-card">
                <Card.Header className="cart-header">
                  <h5>Items ({cartItems.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        <Image src={item.product?.imageUrl} fluid />
                      </div>
                      <div className="cart-item-details">
                        <Link to={`/products/${item.productId}`} className="cart-item-name">
                          {item.product?.name}
                        </Link>
                        <div className="cart-item-meta">
                          <span>SKU: {item.product?.styleCode}</span>
                          <br />
                          <span>Category: {item.product?.category?.name}</span>
                        </div>
                        <div className="cart-item-price">
                    {item.product?.mrp?.toLocaleString('en-US')}₫
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <Button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </Button>
                          <span className="quantity-value">{item.quantity}</span>
                          <Button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={updating}
                          >
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                        <Button className="btn-remove" onClick={() => handleRemove(item.productId)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="summary-card sticky-top" style={{ top: '100px' }}>
                <Card.Header className="summary-header">
                  <h5 className="text-uppercase text-white">Order Summary</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{calculateSubtotal().toLocaleString('en-US')}₫</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span className="text-success">Calculated at checkout</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Estimated Total</span>
                    <span>{calculateSubtotal().toLocaleString('en-US')}₫</span>
                  </div>
                  <Button 
                    variant="dark" 
                    className="w-100 btn-checkout mt-4"
                    onClick={() => navigate(ROUTES.CHECKOUT)}
                  >
                    Proceed to Checkout
                  </Button>
                  <div className="text-center mt-3">
                    <Link to={ROUTES.SHOP} className="text-dark small text-decoration-none">
                      <i className="bi bi-arrow-left me-2"></i>
                      Continue Shopping
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="cart-delete-modal">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Confirm removal</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <i className="bi bi-exclamation-circle text-warning display-4 d-block mb-3"></i>
          <p className="mb-0">Are you sure you want to remove this item from your cart?</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pb-4">
          <Button variant="outline-dark" className="px-4 rounded-0 text-uppercase small" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="px-4 rounded-0 text-uppercase small" onClick={confirmDelete}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Cart


