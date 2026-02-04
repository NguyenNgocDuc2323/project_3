import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Form, Modal, Badge } from 'react-bootstrap'
import { addressService } from '../../common/services'
import './AddressManagement.css'

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id, formData)
      } else {
        await addressService.create(formData)
      }
      setShowModal(false)
      loadAddresses()
      window.showToast?.({
        severity: 'success',
        summary: 'Thành công',
        detail: editingAddress ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới'
      })
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return
    try {
      await addressService.delete(id)
      loadAddresses()
      window.showToast?.({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã xóa địa chỉ'
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
        summary: 'Thành công',
        detail: 'Đã đặt làm địa chỉ mặc định'
      })
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  return (
    <Container className="py-5 address-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Sổ địa chỉ</h1>
        <Button variant="dark" className="rounded-0 px-4" onClick={() => handleShowModal()}>
          Thêm địa chỉ mới
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
            <p className="text-muted">Bạn chưa có địa chỉ giao hàng nào.</p>
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
                    {address.isDefault && <Badge bg="dark" className="rounded-0 text-uppercase small">Mặc định</Badge>}
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
                      Chỉnh sửa
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button 
                          variant="outline-dark" 
                          className="rounded-0 px-4 py-2 text-uppercase small fw-bold"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Mặc định
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          className="rounded-0 px-4 py-2 text-uppercase small fw-bold"
                          onClick={() => handleDelete(address.id)}
                        >
                          Xóa
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
            <Modal.Title className="h5 fw-bold text-uppercase">{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4">
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">Tên người nhận</Form.Label>
              <Form.Control 
                type="text" 
                name="receiverName" 
                value={formData.receiverName} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">Số điện thoại</Form.Label>
              <Form.Control 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">Địa chỉ chi tiết</Form.Label>
              <Form.Control 
                type="text" 
                name="addressLine" 
                value={formData.addressLine} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
                placeholder="Số nhà, tên đường..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold">Thành phố / Tỉnh</Form.Label>
              <Form.Control 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                required 
                className="rounded-0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="Đặt làm địa chỉ mặc định" 
                name="isDefault" 
                checked={formData.isDefault} 
                onChange={handleInputChange}
                className="small"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="outline-dark" className="rounded-0 px-4" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="dark" type="submit" className="rounded-0 px-4">Lưu địa chỉ</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default AddressManagement
