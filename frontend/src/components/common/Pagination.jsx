import React from 'react'
import './Pagination.css'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]
const MAX_VISIBLE_PAGES = 5

/**
 * Reusable pagination component.
 * @param {number} totalItems - Total number of items
 * @param {number} currentPage - Current page (1-based)
 * @param {number} pageSize - Items per page
 * @param {function} onPageChange - (page) => void
 * @param {function} onPageSizeChange - optional (pageSize) => void
 * @param {boolean} showPageSizeSelect - Show page size dropdown
 * @param {string} label - Optional label e.g. "products", "orders"
 * @param {number[]} pageSizeOptions - Options for page size dropdown (default [5,10,20,50])
 */
const Pagination = ({
  totalItems = 0,
  currentPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelect = false,
  label = 'items',
  pageSizeOptions = PAGE_SIZE_OPTIONS
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const page = Math.max(1, Math.min(currentPage, totalPages))
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, totalItems)

  const goTo = (p) => {
    const next = Math.max(1, Math.min(p, totalPages))
    if (next !== page && onPageChange) onPageChange(next)
  }

  const pageNumbers = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const left = Math.max(1, page - 1)
    const right = Math.min(totalPages, page + 1)
    const pages = new Set([1, left, page, right, totalPages])
    for (let i = left; i <= right; i++) pages.add(i)
    return Array.from(pages).sort((a, b) => a - b)
  }

  const pages = pageNumbers()
  const showPrev = page > 1
  const showNext = page < totalPages

  if (totalItems <= 0 && !showPageSizeSelect) return null

  return (
    <div className="pagination-wrap">
      <div className="pagination-info">
        <span className="pagination-summary">
          Showing {startIndex}–{endIndex} of {totalItems} {label}
        </span>
        {showPageSizeSelect && onPageSizeChange && (
          <span className="pagination-size-select">
            <label htmlFor="pagination-size">Per page</label>
            <select
              id="pagination-size"
              className="form-select form-select-sm"
              value={pageSize}
              onChange={(e) => {
                const val = Number(e.target.value)
                if (val > 0) {
                  onPageSizeChange(val)
                  onPageChange(1)
                }
              }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </span>
        )}
      </div>
      {(totalPages > 1 || showPageSizeSelect) && (
        <nav className="pagination-nav" aria-label="Pagination">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${!showPrev ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => goTo(page - 1)}
                disabled={!showPrev}
                aria-label="Previous"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
            </li>
            {pages.map((p, i) => {
              const prev = pages[i - 1]
              const showEllipsis = prev != null && p - prev > 1
              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <li className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  )}
                  <li className={`page-item ${p === page ? 'active' : ''}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => goTo(p)}
                    >
                      {p}
                    </button>
                  </li>
                </React.Fragment>
              )
            })}
            <li className={`page-item ${!showNext ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => goTo(page + 1)}
                disabled={!showNext}
                aria-label="Next"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}

export default Pagination
export { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS }
