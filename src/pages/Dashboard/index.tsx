import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchInvoices } from '@/redux/slices/invoiceSlice';
import { fetchDCs } from '@/redux/slices/dcSlice';
import { useAuthenticatedEffect } from '@/hooks/useAuthenticatedEffect';
import { ROUTES } from '@/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', invoices: 8, dc: 5 },
  { month: 'Feb', invoices: 14, dc: 9 },
  { month: 'Mar', invoices: 11, dc: 7 },
  { month: 'Apr', invoices: 19, dc: 13 },
  { month: 'May', invoices: 16, dc: 10 },
  { month: 'Jun', invoices: 24, dc: 18 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices } = useAppSelector((state) => state.invoices);
  const { data: dcs } = useAppSelector((state) => state.dcs);

  useAuthenticatedEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchDCs());
  });

  return (
    <div className="dash-root">

      {/* ── Page Header ── */}
      <div className="dash-header">
        <h1 className="dash-title">Dashboard</h1>
      </div>

      {/* ── 4-column top row ── */}
      <div className="dash-top-grid">

        {/* Total Invoices */}
        <div className="dash-count-card dash-blue">
          <div className="dash-count-body">
            <span className="dash-count-label">Total Invoices</span>
            <span className="dash-count-value">{invoices.length}</span>
            <span className="dash-count-sub">All time invoices created</span>
          </div>
          <div className="dash-count-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        {/* Total DC */}
        <div className="dash-count-card dash-green">
          <div className="dash-count-body">
            <span className="dash-count-label">Total DC</span>
            <span className="dash-count-value">{dcs.length}</span>
            <span className="dash-count-sub">Delivery challans issued</span>
          </div>
          <div className="dash-count-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
        </div>

        {/* Create Invoice */}
        <div
          className="dash-action-card dash-action-blue"
          onClick={() => navigate(ROUTES.INVOICES_CREATE)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.INVOICES_CREATE)}
        >
          <div className="dash-action-icon-wrap dash-action-icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <span className="dash-action-label dash-label-blue">Create Invoice</span>
          <span className="dash-action-sub">Generate a new GST invoice</span>
        </div>

        {/* Create DC */}
        <div
          className="dash-action-card dash-action-green"
          onClick={() => navigate(ROUTES.DC_CREATE)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.DC_CREATE)}
        >
          <div className="dash-action-icon-wrap dash-action-icon-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <span className="dash-action-label dash-label-green">Create DC</span>
          <span className="dash-action-sub">New delivery challan</span>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="dash-chart-card">
        <div className="dash-chart-header">
          <div>
            <div className="dash-chart-title">Monthly Activity Overview</div>
            <div className="dash-chart-sub">Invoices &amp; DCs created per month</div>
          </div>
          <div className="dash-chart-legend">
            <span className="dash-legend-dot" style={{ background: '#3B82F6' }} />
            <span className="dash-legend-text">Invoices</span>
            <span className="dash-legend-dot dash-legend-gap" style={{ background: '#10B981' }} />
            <span className="dash-legend-text">DCs</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradInvoice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="invoices" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gradInvoice)" name="Invoices" dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Area type="monotone" dataKey="dc" stroke="#10B981" strokeWidth={2.5} fill="url(#gradDC)" name="DCs" dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Developer Credit ── */}
      <div className="dash-credit">
        <span className="dash-credit-by">Developed by</span>
        <span className="dash-credit-name">
          Sharath <span className="dash-credit-vadivelu">Vadivelu</span>
        </span>
      </div>

      {/* ════ STYLES ════ */}
      <style>{`
        .dash-root {
          display: flex;
          flex-direction: column;
          gap: 26px;
          font-family: 'Inter', sans-serif;
          padding-bottom: 8px;
        }

        /* ── Header ── */
        .dash-header { margin-bottom: -8px; }
        .dash-title {
          margin: 0 0 4px;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
        }
        .dash-subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* ── Top Grid ── */
        .dash-top-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* ── Count Cards ── */
        .dash-count-card {
          border-radius: 16px;
          padding: 24px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          position: relative;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .dash-count-card:hover { transform: translateY(-5px); }

        .dash-blue  {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          box-shadow: 0 8px 26px rgba(59,130,246,0.32);
        }
        .dash-blue:hover  { box-shadow: 0 16px 36px rgba(59,130,246,0.44); }
        .dash-green {
          background: linear-gradient(135deg, #10B981, #047857);
          box-shadow: 0 8px 26px rgba(16,185,129,0.32);
        }
        .dash-green:hover { box-shadow: 0 16px 36px rgba(16,185,129,0.44); }

        .dash-count-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .dash-count-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(255,255,255,0.78);
        }
        .dash-count-value {
          font-size: clamp(2.2rem, 4vw, 3rem);
          font-weight: 900;
          line-height: 1;
          color: #fff;
        }
        .dash-count-sub {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.62);
        }
        .dash-count-icon {
          width: 52px;
          height: 52px;
          background: rgba(255,255,255,0.16);
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-left: 14px;
        }
        .dash-count-icon svg {
          width: 26px;
          height: 26px;
          color: rgba(255,255,255,0.95);
          stroke: rgba(255,255,255,0.95);
        }

        /* ── Action Cards ── */
        .dash-action-card {
          border-radius: 16px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          user-select: none;
          outline: none;
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.18s;
        }
        .dash-action-card:focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }

        .dash-action-blue {
          background: #fff;
          border: 2px dashed #93C5FD;
          box-shadow: 0 2px 10px rgba(59,130,246,0.07);
        }
        .dash-action-blue:hover {
          background: #EFF6FF;
          border-color: #3B82F6;
          transform: translateY(-5px);
          box-shadow: 0 10px 28px rgba(59,130,246,0.16);
        }
        .dash-action-green {
          background: #fff;
          border: 2px dashed #6EE7B7;
          box-shadow: 0 2px 10px rgba(16,185,129,0.07);
        }
        .dash-action-green:hover {
          background: #ECFDF5;
          border-color: #10B981;
          transform: translateY(-5px);
          box-shadow: 0 10px 28px rgba(16,185,129,0.16);
        }

        .dash-action-icon-wrap {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .dash-action-icon-wrap svg { width: 28px; height: 28px; }
        .dash-action-icon-blue  { background: #EFF6FF; color: #3B82F6; stroke: #3B82F6; }
        .dash-action-icon-green { background: #ECFDF5; color: #10B981; stroke: #10B981; }

        .dash-action-label {
          font-size: 1rem;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
        }
        .dash-label-blue  { color: #1D4ED8; }
        .dash-label-green { color: #047857; }
        .dash-action-sub {
          font-size: 0.72rem;
          color: #9CA3AF;
        }

        /* ── Chart Card ── */
        .dash-chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 26px 26px 20px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        }
        .dash-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .dash-chart-title {
          font-size: 1.02rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 3px;
        }
        .dash-chart-sub { font-size: 0.78rem; color: #9CA3AF; }
        .dash-chart-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .dash-legend-dot {
          display: inline-block;
          width: 10px; height: 10px;
          border-radius: 50%;
        }
        .dash-legend-gap { margin-left: 14px; }
        .dash-legend-text { font-size: 0.78rem; color: #6B7280; font-weight: 500; }

        /* ── Credit ── */
        .dash-credit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding-top: 10px;
          border-top: 1px solid #F3F4F6;
        }
        .dash-credit-by   { font-size: 0.72rem; color: #9CA3AF; letter-spacing: 0.4px; }
        .dash-credit-name { font-size: 0.88rem; font-weight: 700; color: #374151; }
        .dash-credit-vadivelu {
          color: #e53935;
          font-weight: 900;
          letter-spacing: 0.6px;
        }

        /* ── Tablet ≤ 1024px ── */
        @media (max-width: 1024px) {
          .dash-top-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── Mobile ≤ 600px ── */
        @media (max-width: 600px) {
          .dash-root { gap: 16px; }
          .dash-top-grid { grid-template-columns: 1fr; gap: 12px; }
          .dash-count-card { padding: 18px 16px; }
          .dash-chart-card { padding: 18px 14px 14px; }
          .dash-chart-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
