import React, { useEffect, useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  Filler,
  DoughnutController,
  PieController
} from 'chart.js'
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2'
import { reportService } from '../../../common/services'
import './Reports.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
  PieController,
  LineController,
  LineElement,
  PointElement,
  Filler
)

const CHART_COLORS = {
  primary: 'rgba(13, 110, 253, 0.8)',
  success: 'rgba(25, 135, 84, 0.8)',
  warning: 'rgba(255, 193, 7, 0.8)',
  info: 'rgba(13, 202, 240, 0.8)',
  secondary: 'rgba(108, 117, 125, 0.8)',
  danger: 'rgba(220, 53, 69, 0.8)'
}

const STATUS_COLORS = [
  CHART_COLORS.success,
  CHART_COLORS.primary,
  CHART_COLORS.info,
  CHART_COLORS.warning,
  CHART_COLORS.secondary
]

const AdminReportsDashboard = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: ''
  })
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to

      const [summaryRes, chartRes] = await Promise.all([
        reportService.getSummary(params),
        reportService.getChartData(params)
      ])
      setSummary(summaryRes.data)
      setChartData(chartRes.data)
    } catch (err) {
      console.error('Failed to load report data', err)
      setSummary(null)
      setChartData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Revenue by month'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => formatCurrency(ctx.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => (value / 1e6) + 'M'
        }
      }
    }
  }), [])

  const barChartData = useMemo(() => {
    if (!chartData?.revenueByMonth?.length) return null
    const data = chartData.revenueByMonth
    return {
      labels: data.map((d) => `${d.month} ${d.year}`),
      datasets: [
        {
          label: 'Revenue (VND)',
          data: data.map((d) => d.revenue),
          backgroundColor: CHART_COLORS.primary,
          borderRadius: 6
        }
      ]
    }
  }, [chartData])

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'Orders by status'
      }
    }
  }), [])

  const doughnutData = useMemo(() => {
    if (!chartData?.ordersByStatus?.length) return null
    const data = chartData.ordersByStatus
    return {
      labels: data.map((d) => d.status),
      datasets: [
        {
          data: data.map((d) => d.count),
          backgroundColor: data.map((_, i) => STATUS_COLORS[i % STATUS_COLORS.length]),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    }
  }, [chartData])

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Revenue trend'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => formatCurrency(ctx.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => (value / 1e6) + 'M'
        }
      }
    }
  }), [])

  const lineChartData = useMemo(() => {
    if (!chartData?.revenueByMonth?.length) return null
    const data = chartData.revenueByMonth
    return {
      labels: data.map((d) => `${d.month} ${d.year}`),
      datasets: [
        {
          label: 'Revenue (VND)',
          data: data.map((d) => d.revenue),
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: CHART_COLORS.primary
        }
      ]
    }
  }, [chartData])

  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'Revenue share by month'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
            const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0
            return `${ctx.label}: ${formatCurrency(ctx.raw)} (${pct}%)`
          }
        }
      }
    }
  }), [])

  const pieChartData = useMemo(() => {
    if (!chartData?.revenueByMonth?.length) return null
    const data = chartData.revenueByMonth
    const colors = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.secondary]
    return {
      labels: data.map((d) => `${d.month} ${d.year}`),
      datasets: [
        {
          data: data.map((d) => d.revenue),
          backgroundColor: data.map((_, i) => colors[i % colors.length]),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    }
  }, [chartData])

  return (
    <div className="admin-reports container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Sales Report
          </h1>
          <p className="text-muted mb-0">
            Overview of revenue, orders, and customers for the selected period.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small text-muted">From date</label>
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">To date</label>
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-dark w-100"
                onClick={loadData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    View report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 report-card-primary">
              <div className="card-body">
                <div className="text-muted small mb-1">Total revenue</div>
                <div className="h4 fw-bold mb-0">{formatCurrency(summary.totalRevenue)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Orders</div>
                <div className="h4 fw-bold mb-0">{summary.ordersCount}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Customers</div>
                <div className="h4 fw-bold mb-0">{summary.customersCount}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Average order value</div>
                <div className="h4 fw-bold mb-0">{formatCurrency(summary.averageOrderValue)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Paid orders</div>
                <div className="h4 fw-bold mb-0">{summary.paidOrdersCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(chartData?.revenueByMonth?.length > 0 || chartData?.ordersByStatus?.length > 0) && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="report-chart-container" style={{ height: 320 }}>
                  {barChartData ? (
                    <Bar data={barChartData} options={barChartOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 280 }}>
                      No revenue data for the selected period.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="report-chart-container" style={{ height: 320 }}>
                  {doughnutData ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 280 }}>
                      No order status data for the selected period.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="report-chart-container" style={{ height: 300 }}>
                  {lineChartData ? (
                    <Line data={lineChartData} options={lineChartOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 260 }}>
                      No revenue trend for the selected period.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="report-chart-container" style={{ height: 300 }}>
                  {pieChartData ? (
                    <Pie data={pieChartData} options={pieChartOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 260 }}>
                      No revenue share data for the selected period.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReportsDashboard
