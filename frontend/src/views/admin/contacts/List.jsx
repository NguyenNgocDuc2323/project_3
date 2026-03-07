import React, { useEffect, useMemo, useState } from 'react'
import { contactService } from '../../../common/services'
import { ROUTES } from '../../../common/constants'
import ConfirmModal from '../../../components/common/ConfirmModal'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../../components/common/Pagination'
import './List.css'

const FILTER_ALL = 'all'
const FILTER_PENDING = 'pending'
const FILTER_RESOLVED = 'resolved'

const AdminContactsList = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(FILTER_ALL)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [detailModal, setDetailModal] = useState({ open: false, contact: null })
  const [resolveModal, setResolveModal] = useState({ open: false, contact: null, response: '' })
  const [resolveSubmitting, setResolveSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const res = await contactService.getAll()
      setContacts(res.data || [])
    } catch (err) {
      console.error('Failed to load contacts', err)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: err.response?.data?.message || 'Không tải được danh sách liên hệ',
          life: 4000
        })
      }
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = useMemo(() => {
    let list = contacts
    if (filter === FILTER_PENDING) list = list.filter(c => !c.isResolved)
    if (filter === FILTER_RESOLVED) list = list.filter(c => c.isResolved)
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase()
      list = list.filter(
        c =>
          (c.name && c.name.toLowerCase().includes(s)) ||
          (c.email && c.email.toLowerCase().includes(s)) ||
          (c.subject && c.subject.toLowerCase().includes(s)) ||
          (c.message && c.message.toLowerCase().includes(s))
      )
    }
    return list
  }, [contacts, filter, searchTerm])

  const totalFiltered = filteredContacts.length
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredContacts.slice(start, start + pageSize)
  }, [filteredContacts, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  const handleResolve = async () => {
    const { contact, response } = resolveModal
    if (!contact?.id || !response?.trim()) {
      if (window.showToast) {
        window.showToast({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Vui lòng nhập nội dung phản hồi.',
          life: 3000
        })
      }
      return
    }
    try {
      setResolveSubmitting(true)
      await contactService.resolve(contact.id, { response: response.trim() })
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã đánh dấu đã xử lý và gửi email phản hồi.',
          life: 3000
        })
      }
      setResolveModal({ open: false, contact: null, response: '' })
      loadContacts()
    } catch (err) {
      console.error('Failed to resolve contact', err)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: err.response?.data?.message || 'Không thể gửi phản hồi.',
          life: 4000
        })
      }
    } finally {
      setResolveSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete.id) return
    try {
      setDeleting(true)
      await contactService.delete(confirmDelete.id)
      if (window.showToast) {
        window.showToast({
          severity: 'success',
          summary: 'Đã xóa',
          detail: 'Liên hệ đã được xóa.',
          life: 3000
        })
      }
      setConfirmDelete({ open: false, id: null, name: '' })
      loadContacts()
    } catch (err) {
      console.error('Failed to delete contact', err)
      if (window.showToast) {
        window.showToast({
          severity: 'error',
          summary: 'Lỗi',
          detail: err.response?.data?.message || 'Không thể xóa.',
          life: 4000
        })
      }
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-contacts container my-4">
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-1">
          <i className="bi bi-envelope me-2"></i>
          Quản lý liên hệ
        </h1>
        <p className="text-muted mb-0">
          Xem và phản hồi tin nhắn từ form liên hệ.
        </p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tên, email, chủ đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small">Lọc:</span>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${filter === FILTER_ALL ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(FILTER_ALL)}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`btn ${filter === FILTER_PENDING ? 'btn-warning' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(FILTER_PENDING)}
                >
                  Chưa xử lý
                </button>
                <button
                  type="button"
                  className={`btn ${filter === FILTER_RESOLVED ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(FILTER_RESOLVED)}
                >
                  Đã xử lý
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle admin-contacts-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Tên</th>
                  <th>Email / SĐT</th>
                  <th>Chủ đề</th>
                  <th>Ngày gửi</th>
                  <th style={{ width: 100 }}>Trạng thái</th>
                  <th style={{ width: 180 }} className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : totalFiltered === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Không có liên hệ nào.
                    </td>
                  </tr>
                ) : (
                  paginatedContacts.map((contact, index) => (
                    <tr key={contact.id}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>
                        <span className="fw-semibold">{contact.name || '-'}</span>
                      </td>
                      <td>
                        <div className="small">
                          <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          {contact.phone && (
                            <div className="text-muted">{contact.phone}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: 200 }} title={contact.subject}>
                          {contact.subject || '-'}
                        </span>
                      </td>
                      <td className="small text-muted">{formatDate(contact.createdAt)}</td>
                      <td>
                        {contact.isResolved ? (
                          <span className="badge bg-success">Đã xử lý</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Chưa xử lý</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setDetailModal({ open: true, contact })}
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {!contact.isResolved && (
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              onClick={() => setResolveModal({ open: true, contact, response: '' })}
                              title="Phản hồi & đánh dấu đã xử lý"
                            >
                              <i className="bi bi-reply"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => setConfirmDelete({ open: true, id: contact.id, name: contact.name || contact.email })}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination
        totalItems={totalFiltered}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showPageSizeSelect
        label="liên hệ"
      />

      {/* Detail modal */}
      {detailModal.open && detailModal.contact && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-envelope me-2"></i>
                  Chi tiết liên hệ
                </h5>
                <button type="button" className="btn-close" onClick={() => setDetailModal({ open: false, contact: null })} aria-label="Close" />
              </div>
              <div className="modal-body">
                <p><strong>Tên:</strong> {detailModal.contact.name}</p>
                <p><strong>Email:</strong> <a href={`mailto:${detailModal.contact.email}`}>{detailModal.contact.email}</a></p>
                {detailModal.contact.phone && <p><strong>Số điện thoại:</strong> {detailModal.contact.phone}</p>}
                <p><strong>Chủ đề:</strong> {detailModal.contact.subject}</p>
                <p><strong>Ngày gửi:</strong> {formatDate(detailModal.contact.createdAt)}</p>
                <hr />
                <p><strong>Nội dung:</strong></p>
                <div className="bg-light p-3 rounded small">{detailModal.contact.message || '-'}</div>
                {detailModal.contact.isResolved && detailModal.contact.adminResponse && (
                  <>
                    <hr />
                    <p><strong>Phản hồi admin:</strong></p>
                    <div className="bg-light p-3 rounded small">{detailModal.contact.adminResponse}</div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDetailModal({ open: false, contact: null })}>
                  Đóng
                </button>
                {!detailModal.contact.isResolved && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      setDetailModal({ open: false, contact: null })
                      setResolveModal({ open: true, contact: detailModal.contact, response: '' })
                    }}
                  >
                    <i className="bi bi-reply me-1"></i> Phản hồi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve modal */}
      {resolveModal.open && resolveModal.contact && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Phản hồi & đánh dấu đã xử lý</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => !resolveSubmitting && setResolveModal({ open: false, contact: null, response: '' })}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-2">
                  Gửi tới: <strong>{resolveModal.contact.email}</strong> — Chủ đề: {resolveModal.contact.subject}
                </p>
                <label className="form-label">Nội dung phản hồi (sẽ gửi email cho khách)</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Nhập nội dung phản hồi..."
                  value={resolveModal.response}
                  onChange={(e) => setResolveModal(prev => ({ ...prev, response: e.target.value }))}
                  disabled={resolveSubmitting}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => !resolveSubmitting && setResolveModal({ open: false, contact: null, response: '' })}
                  disabled={resolveSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleResolve}
                  disabled={resolveSubmitting || !resolveModal.response?.trim()}
                >
                  {resolveSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1"></i>
                      Gửi phản hồi & đánh dấu đã xử lý
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Xóa liên hệ"
        message={`Bạn có chắc muốn xóa liên hệ từ "${confirmDelete.name}"? Hành động không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null, name: '' })}
        loading={deleting}
      />
    </div>
  )
}

export default AdminContactsList
