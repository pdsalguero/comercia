'use client'

import type { WeeklyViewPoint } from '@/app/(dashboard)/dashboard/actions'

interface Props {
  data: WeeklyViewPoint[]
}

export function WeeklyChart({ data }: Props) {
  const W = 560
  const H = 160
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxViews = Math.max(...data.map(d => d.views), 1)
  const totalViews = data.reduce((s, d) => s + d.views, 0)

  // Map data to SVG coordinates
  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + chartH - (d.views / maxViews) * chartH,
    ...d,
  }))

  // Build smooth SVG path with cubic bezier
  function buildPath(points: typeof pts): string {
    if (points.length < 2) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }

  // Area fill path (closes below the line)
  function buildArea(points: typeof pts): string {
    if (points.length < 2) return ''
    const linePath = buildPath(points)
    const last = points[points.length - 1]
    const first = points[0]
    return `${linePath} L ${last.x} ${PAD.top + chartH} L ${first.x} ${PAD.top + chartH} Z`
  }

  const linePath = buildPath(pts)
  const areaPath = buildArea(pts)

  // Y-axis gridlines (3 lines at 0%, 50%, 100%)
  const gridValues = [0, Math.round(maxViews / 2), maxViews]

  if (totalViews === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
        <p style={{ fontSize: '13px' }}>Tus vistas aparecerán aquí cuando tengas datos</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="Gráfico de vistas semanales"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E5BA8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1E5BA8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridValues.map((val, i) => {
          const y = PAD.top + chartH - (val / maxViews) * chartH
          return (
            <g key={i}>
              <line
                x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 6} y={y + 4}
                textAnchor="end" fontSize="10" fill="#94a3b8"
              >
                {val}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#1E5BA8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points + labels */}
        {pts.map((pt) => (
          <g key={pt.date}>
            <circle cx={pt.x} cy={pt.y} r={4} fill="#1E5BA8" />
            {pt.views > 0 && (
              <text
                x={pt.x} y={pt.y - 8}
                textAnchor="middle" fontSize="10" fontWeight="600" fill="#1E5BA8"
              >
                {pt.views}
              </text>
            )}
            {/* X axis label */}
            <text
              x={pt.x} y={H - 6}
              textAnchor="middle" fontSize="11" fill="#64748b"
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
