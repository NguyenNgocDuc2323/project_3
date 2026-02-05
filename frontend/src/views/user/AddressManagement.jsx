import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Form, Modal, Badge } from 'react-bootstrap'
import { addressService } from '../../common/services'
import './AddressManagement.css'

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    receiverName: '',
    phone: '',
    addressLine: '',
    city: '',
    isDefault: false
  })

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await addressService.getAll()
      setAddresses(response.data || [])
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextValue =
      name === 'phone'
        ? String(value || '').replace(/\D/g, '').slice(0, 10)
        : (type === 'checkbox' ? checked : value)
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleShowModal = (address = null) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        receiverName: address.receiverName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        isDefault: address.isDefault
      })
    } else {
      setEditingAddress(null)
      setFormData({
        receiverName: '',
        phone: '',
        addressLine: '',
        city: '',
        isDefault: addresses.length === 0
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const hasDigits = (value) => /\d/.test(String(value || ''))

  const validate = () => {
    const next = {}
    const receiverName = String(formData.receiverName || '').trim()
    if (!receiverName) next.receiverName = 'Recipient name is required'
    else if (receiverName.length < 2) next.receiverName = 'Recipient name must be at least 2 characters'
    else if (receiverName.length > 100) next.receiverName = 'Recipient name must be 100 characters or less'
    else if (hasDigits(receiverName)) next.receiverName = 'Recipient name must not contain numbers'

    const phone = String(formData.phone || '').trim()
    if (!phone) {
      next.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(phone)) {
      next.phone = 'Phone number must be exactly 10 digits'
    }

    const addressLine = String(formData.addressLine || '').trim()
    if (!addressLine) next.addressLine = 'Address line is required'
    else if (addressLine.length < 5) next.addressLine = 'Address line must be at least 5 characters'
    else if (addressLine.length > 500) next.addressLine = 'Address line must be 500 characters or less'

    const city = String(formData.city || '').trim()
    if (!city) next.city = 'City / Province is required'
    else if (city.length < 2) next.city = 'City / Province must be at least 2 characters'
    else if (city.length > 100) next.city = 'City / Province must be 100 characters or less'

    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const nextErrors = validate()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        window.showToast?.({
          severity: 'error',
          summary: 'Missing information',
          detail: 'Please fill in all required fields (*)'
        })
        return
      }

      if (editingAddress) {
        await addressService.update(editingAddress.id, formData)
      } else {
        await addressService.create(formData)
      }
      setShowModal(false)
      loadAddresses()
      window.showToast?.({
        severity: 'success',
        summary: 'Success',
        detail: editingAddress ? 'Address updated' : 'Address added'
      })
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      await addressService.delete(id)
      loadAddresses()
      window.showToast?.({
        severity: 'success',
        summary: 'Success',
        detail: 'Address deleted'
      })
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id)
      loadAddresses()
      window.showToast?.({
        severity: 'success',
        summary: 'Success',
        detail: 'Default address updated'
      })
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  return (
    <Container className="py-5 address-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Address book</h1>
        <Button variant="dark" className="rounded-0 px-4" onClick={() => handleShowModal()}>
          Add new address
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status"></div>
        </div>
      ) : addresses.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <i className="bi bi-geo-alt display-1 text-muted mb-3"></i>
            <p className="text-muted">You don't have any shipping addresses yet.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {addresses.map((address) => (
            <Col md={6} key={address.id}>
              <Card className={`address-card h-100 ${address.isDefault ? 'border-dark' : ''}`}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0">{address.receiverName}</h5>
                    {address.isDefault && <Badge bg="dark" className="rounded-0 text-uppercase small">Default</Badge>}
                  </div>
                  <p className="mb-2"><i className="bi bi-telephone me-2"></i>{address.phone}</p>
                  <p className="mb-4 text-muted">
                    <i className="bi bi-geo-alt me-2"></i>
                    {address.addressLine}, {address.city}
                  </p>
                  <div className="d-flex gap-3 mt-3">
                    <Button 
                      variant="dark" 
                      className="rounded-0 px-4 py-2 text-uppercase small fw-bold"
                      onClick={() => handleShowModal(address)}
                    >
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button 
                          variant="outline-dark" 
                          className="rounded-0 px-4 py-2 text-uppercase small fw-bold"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Set default
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          className="rounded-0 px-4 py-2 text-uppercase small fw-bold"
                          onClick={() => handleDelete(address.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="h5 fw-bold text-uppercase">{editingAddress ? 'Edit address' : 'Add new address'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4">
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">
                Recipient name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                name="receiverName" 
                value={formData.receiverName} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
                isInvalid={!!errors.receiverName}
                maxLength={100}
                placeholder="Full name"
              />
              <Form.Control.Feedback type="invalid">{errors.receiverName}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">
                Phone number <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
                isInvalid={!!errors.phone}
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                placeholder="10 digits"
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">
                Address line <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                name="addressLine" 
                value={formData.addressLine} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
                placeholder="House number, street name..."
                isInvalid={!!errors.addressLine}
                maxLength={500}
              />
              <Form.Control.Feedback type="invalid">{errors.addressLine}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">
                City / Province <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
                isInvalid={!!errors.city}
                maxLength={100}
                placeholder="City / Province"
              />
              <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="Set as default address" 
                name="isDefault" 
                checked={formData.isDefault} 
                onChange={handleInputChange}
                className="small"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="outline-dark" className="rounded-0 px-4" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="dark" type="submit" className="rounded-0 px-4">Save address</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default AddressManagement
