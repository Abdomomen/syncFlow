'use client';

import { useTokenSync } from '@/app/store/context';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import fetching from '@/app/store/fetchMiddleware';


export default function DashboardPage() {
  let [allTasks, setAllTasks] = useState([])
  let [allSubs, setAllSubs] = useState([])
  const [hoveredIndex, setHoveredIndex] = useState(null)

  let token = useTokenSync(s => s.token)
  let setToken = useTokenSync(s => s.setToken)

  useEffect(() => {
    let fetchReq = async () => {
      try {
        let req1 = await fetching("/api/users/tasks?limit=1000", "GET", null, token)
        if (req1.newToken) {
          setToken(req1.newToken)
        }
        if (req1.tasks) {
          setAllTasks(req1.tasks)
        }

        let req2 = await fetching("/api/users/subs?limit=1000", "GET", null, token)
        if (req2.newToken) {
          setToken(req2.newToken)
        }
        if (req2.subs) {
          setAllSubs(req2.subs)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    }
    fetchReq()
  }, [])

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === true).length;
  const pendingTasks = totalTasks - completedTasks;
  const activeSubs = allSubs.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: totalTasks.toString(), badge: 'All', badgeColor: '#10b981', href: '/dashboard/tasks' },
    { label: 'Completed', value: completedTasks.toString(), badge: `${completionRate}% RATE`, badgeColor: '#8b5cf6', badgeBg: 'rgba(139,92,246,0.1)', href: '/dashboard/tasks' },
    { label: 'Pending', value: pendingTasks.toString(), badge: 'Active', badgeColor: '#f59e0b', href: '/dashboard/tasks' },
    { label: 'Active Subs', value: activeSubs.toString(), badge: 'Active', badgeColor: '#71717a', href: '/dashboard/subscriptions' },
  ];

  const recentTask = allTasks.slice(0, 5);
  const recentSubs = allSubs.slice(0, 5);

  return (
    <main className="p-6 space-y-8 max-w-[1440px] mx-auto w-full">

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="border rounded-xl flex flex-col gap-1 p-8 transition-all duration-200 cursor-pointer block"
            style={{ backgroundColor: '#0e0e10', borderColor: '#27272a' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#71717a', fontFamily: 'Geist, sans-serif' }}>{stat.label}</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-semibold" style={{ color: '#fafafa', letterSpacing: '-0.02em' }}>{stat.value}</h2>
              <span className="text-xs font-semibold rounded-full px-2 py-0.5"
                style={{
                  color: stat.badgeColor,
                  backgroundColor: stat.badgeBg || 'transparent',
                  border: stat.badgeBg ? `1px solid ${stat.badgeColor}33` : 'none'
                }}>
                {stat.badge}
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Task Completion Trend */}
        <div className="col-span-12 lg:col-span-8 border rounded-xl flex flex-col gap-6 p-6 relative"
          style={{ backgroundColor: '#0e0e10', borderColor: '#27272a' }}>
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #27272a' }}>
            <h3 className="font-semibold text-lg" style={{ color: '#fafafa', letterSpacing: '-0.01em' }}>Task Completion Trend</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded text-[10px] font-bold cursor-pointer" style={{ backgroundColor: '#2a2a2c', color: '#fafafa' }}>7D</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold cursor-pointer" style={{ color: '#71717a' }}>30D</span>
            </div>
          </div>
          
          {/* SVG Chart Wrapper */}
          <div className="h-64 relative w-full select-none">
            {/* Grid and Area Line Chart */}
            <svg viewBox="0 0 600 220" className="w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00"/>
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 5, 10, 15, 20].map((val, idx) => {
                const y = 180 - (val / 20) * 150;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="580" y2={y} stroke="#1f1f23" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="25" y={y + 3} fill="#71717a" fontSize="10" textAnchor="end" style={{ fontFamily: 'Geist, sans-serif' }}>{val}</text>
                  </g>
                );
              })}

              {/* Area Under the Line */}
              <path
                d={`M 40 180 
                    L 40 ${180 - (4 / 20) * 150} 
                    L 130 ${180 - (8 / 20) * 150} 
                    L 220 ${180 - (6 / 20) * 150} 
                    L 310 ${180 - (12 / 20) * 150} 
                    L 400 ${180 - (9 / 20) * 150} 
                    L 490 ${180 - (15 / 20) * 150} 
                    L 580 ${180 - (18 / 20) * 150} 
                    L 580 180 Z`}
                fill="url(#areaGradient)"
              />

              {/* Chart Line */}
              <path
                d={`M 40 ${180 - (4 / 20) * 150} 
                    L 130 ${180 - (8 / 20) * 150} 
                    L 220 ${180 - (6 / 20) * 150} 
                    L 310 ${180 - (12 / 20) * 150} 
                    L 400 ${180 - (9 / 20) * 150} 
                    L 490 ${180 - (15 / 20) * 150} 
                    L 580 ${180 - (18 / 20) * 150}`}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X Axis Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const x = 40 + idx * 90;
                return (
                  <text key={day} x={x} y="205" fill="#71717a" fontSize="10" textAnchor="middle" style={{ fontFamily: 'Geist, sans-serif' }}>
                    {day}
                  </text>
                );
              })}

              {/* Interactive Dots */}
              {[4, 8, 6, 12, 9, 15, 18].map((val, idx) => {
                const x = 40 + idx * 90;
                const y = 180 - (val / 20) * 150;
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Invisible larger hover target */}
                    <circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {/* Glowing highlight */}
                    {isHovered && (
                      <circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="#8b5cf6"
                        fillOpacity="0.4"
                        style={{ pointerEvents: 'none' }}
                        filter="url(#glow)"
                      />
                    )}
                    {/* Core Point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? "6" : "4"}
                      fill={isHovered ? "#fafafa" : "#8b5cf6"}
                      stroke="#8b5cf6"
                      strokeWidth={isHovered ? "2" : "0"}
                      style={{ pointerEvents: 'none', transition: 'all 0.15s ease' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Custom Interactive Tooltip */}
            {hoveredIndex !== null && (
              <div className="absolute px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-lg transition-all duration-150 pointer-events-none flex flex-col items-center gap-0.5"
                style={{
                  left: `${((40 + hoveredIndex * 90) / 600) * 100}%`,
                  top: `${((180 - ([4, 8, 6, 12, 9, 15, 18][hoveredIndex] / 20) * 150) / 220) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  color: '#fafafa',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                <span style={{ color: '#71717a', fontSize: '9px', textTransform: 'uppercase' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][hoveredIndex]}
                </span>
                <span style={{ color: '#a78bfa' }}>
                  {[4, 8, 6, 12, 9, 15, 18][hoveredIndex]} Tasks Completed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="col-span-12 lg:col-span-4 border rounded-xl flex flex-col gap-6 p-6"
          style={{ backgroundColor: '#0e0e10', borderColor: '#27272a' }}>
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #27272a' }}>
            <h3 className="font-semibold text-lg" style={{ color: '#fafafa', letterSpacing: '-0.01em' }}>Upcoming Renewals</h3>
            <Link href="/dashboard/subscriptions">
              <span className="material-symbols-outlined cursor-pointer transition-colors"
                style={{ color: '#71717a', fontSize: '18px' }}
                onMouseOver={e => e.currentTarget.style.color = '#fafafa'}
                onMouseOut={e => e.currentTarget.style.color = '#71717a'}>
                more_horiz
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubs.length === 0 ? (
              <div className="text-center py-8 text-xs" style={{ color: '#71717a' }}>
                No upcoming subscriptions.
              </div>
            ) : (
              recentSubs.map((sub) => {
                const formattedDate = new Date(sub.next).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const isOverdue = new Date(sub.next) < new Date();
                const icon = 'subscriptions';
                const iconColor = isOverdue ? '#ef4444' : '#8b5cf6';
                const iconBg = isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)';

                return (
                  <Link key={sub._id} href="/dashboard/subscriptions"
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors block"
                    style={{ backgroundColor: 'rgba(42,42,44,0.3)', borderColor: '#27272a' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#2a2a2c'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(42,42,44,0.3)'}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: iconBg }}>
                        <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '16px' }}>{icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#fafafa' }}>{sub.title}</p>
                        <p className="text-[11px]" style={{ color: isOverdue ? '#ef4444' : '#71717a' }}>
                          {isOverdue ? 'Overdue - ' : ''}{formattedDate}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-medium" style={{ color: '#fafafa' }}>${sub.price}</p>
                  </Link>
                )
              })
            )}
          </div>
          <Link href="/dashboard/subscriptions"
            className="w-full mt-auto py-2 text-xs text-center border border-dashed rounded-lg transition-colors block"
            style={{ borderColor: '#27272a', color: '#71717a' }}
            onMouseOver={e => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.borderColor = '#71717a'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#27272a'; }}>
            View All Subscriptions
          </Link>
        </div>
 
        {/* Recent Tasks Table */}
        <div className="col-span-12 border rounded-xl overflow-hidden" style={{ backgroundColor: '#0e0e10', borderColor: '#27272a' }}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid #27272a' }}>
            <h3 className="font-semibold text-lg" style={{ color: '#fafafa', letterSpacing: '-0.01em' }}>Recent Tasks</h3>
            <Link href="/dashboard/tasks" className="text-xs hover:underline underline-offset-4" style={{ color: '#8b5cf6' }}>View All Tasks →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid #27272a', backgroundColor: 'rgba(42,42,44,0.2)' }}>
                  {['Title', 'Status', 'Assigned To', 'Due Date', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#71717a', fontFamily: 'Geist, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTask.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-sm" style={{ color: '#71717a' }}>
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  recentTask.map((task) => {
                    const isCompleted = task.status;
                    const statusText = isCompleted ? 'Completed' : 'Pending';
                    const statusColor = isCompleted ? '#10b981' : '#f59e0b';
                    const statusBg = isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
                    const statusBorder = isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)';
                    const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <tr key={task._id} className="group transition-colors" style={{ borderBottom: '1px solid #27272a', cursor: 'pointer' }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = 'rgba(42,42,44,0.3)';
                          const icon = e.currentTarget.querySelector('.action-icon');
                          if (icon) icon.style.opacity = '1';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          const icon = e.currentTarget.querySelector('.action-icon');
                          if (icon) icon.style.opacity = '0';
                        }}
                        onClick={() => window.location.href = '/dashboard/tasks'}>
                        <td className="px-6 py-4 font-medium text-sm" style={{ color: '#fafafa' }}>{task.title}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded uppercase tracking-tight border"
                            style={{ color: statusColor, backgroundColor: statusBg, borderColor: statusBorder }}>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px]"
                              style={{ borderColor: '#131315', backgroundColor: 'rgba(113,113,122,0.2)' }}></div>
                            <div className="w-6 h-6 rounded-full border-2"
                              style={{ borderColor: '#131315', backgroundColor: 'rgba(139,92,246,0.4)' }}></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#71717a' }}>{formattedDate}</td>
                        <td className="px-6 py-4">
                          <span className="material-symbols-outlined action-icon transition-all"
                            style={{ color: '#8b5cf6', fontSize: '18px', opacity: 0 }}>
                            open_in_new
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
