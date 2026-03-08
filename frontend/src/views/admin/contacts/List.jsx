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
          summary: 'Error',
          detail: err.response?.data?.message || 'Failed to load contacts',
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
          summary: 'Success',
          detail: 'Marked as resolved and reply email sent.',
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
          summary: 'Deleted',
          detail: 'Contact has been deleted.',
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
          summary: 'Error',
          detail: err.response?.data?.message || 'Unable to delete.',
          life: 4000
        })
      }
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-US', {
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
          Manage contacts
        </h1>
        <p className="text-muted mb-0">
          View and reply to messages from the contact form.
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
                  placeholder="Search by name, email, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small">Filter:</span>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${filter === FILTER_ALL ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(FILTER_ALL)}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn ${filter === FILTER_PENDING ? 'btn-warning' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(FILTER_PENDING)}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`btn ${filter === FILTER_RESOLVED ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(FILTER_RESOLVED)}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle admin-contacts-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Name</th>
                  <th>Email / Phone</th>
                  <th>Subject</th>
                  <th>Sent</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th style={{ width: 180 }} className="text-end">Actions</th>
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
                      No contacts found.
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
                          <span className="badge bg-success">Resolved</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setDetailModal({ open: true, contact })}
                            title="View details"
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
                            title="Delete"
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
        label="contacts"
      />

      {/* Detail modal */}
      {detailModal.open && detailModal.contact && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-envelope me-2"></i>
                  Contact details
                </h5>
                <button type="button" className="btn-close" onClick={() => setDetailModal({ open: false, contact: null })} aria-label="Close" />
              </div>
              <div className="modal-body">
                <p><strong>Name:</strong> {detailModal.contact.name}</p>
                <p><strong>Email:</strong> <a href={`mailto:${detailModal.contact.email}`}>{detailModal.contact.email}</a></p>
                {detailModal.contact.phone && <p><strong>Phone:</strong> {detailModal.contact.phone}</p>}
                <p><strong>Subject:</strong> {detailModal.contact.subject}</p>
                <p><strong>Sent:</strong> {formatDate(detailModal.contact.createdAt)}</p>
                <hr />
                <p><strong>Message:</strong></p>
                <div className="bg-light p-3 rounded small">{detailModal.contact.message || '-'}</div>
                {detailModal.contact.isResolved && detailModal.contact.adminResponse && (
                  <>
                    <hr />
                    <p><strong>Admin response:</strong></p>
                    <div className="bg-light p-3 rounded small">{detailModal.contact.adminResponse}</div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDetailModal({ open: false, contact: null })}>
                  Close
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
                    <i className="bi bi-reply me-1"></i> Reply
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
                <h5 className="modal-title">Reply & mark as resolved</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => !resolveSubmitting && setResolveModal({ open: false, contact: null, response: '' })}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-2">
                  Send to: <strong>{resolveModal.contact.email}</strong> — Subject: {resolveModal.contact.subject}
                </p>
                <label className="form-label">Response (will be sent by email to the customer)</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Enter your response..."
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
                  Cancel
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1"></i>
                      Send response & mark resolved
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
        title="Delete contact"
        message={`Are you sure you want to delete the contact from "${confirmDelete.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null, name: '' })}
        loading={deleting}
      />
    </div>
  )
}

export default AdminContactsList
