import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Filter,
  Download,
  CreditCard,
  Briefcase
} from "lucide-react";
import { getPayments } from "../../api/payments";
import Price from "../components/Currency/Price";
import "./Reports.css";

export default function Reports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("monthly"); // weekly, monthly, yearly
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getPayments({ page: 1, limit: 100 });
      if (res.success) {
        setTransactions(res.data.transactions || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    // Filter transactions by period (this is simplified logic)
    const now = new Date();
    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      if (period === "weekly") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      } else if (period === "monthly") {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (period === "yearly") {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const totalEarned = filtered
      .filter(tx => tx.type === "escrow_release")
      .reduce((acc, tx) => acc + Number(tx.metadata?.gross_amount || tx.amount), 0);

    const netIncome = filtered
      .filter(tx => tx.type === "escrow_release")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const platformFees = totalEarned - netIncome;

    return { totalEarned, platformFees, netIncome, list: filtered };
  }, [transactions, period]);

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    if (period === "weekly") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
        const dayTotal = transactions
          .filter(tx => tx.type === 'escrow_release' && new Date(tx.created_at).toDateString() === d.toDateString())
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
        data.push({ label: dayLabel, value: dayTotal });
      }
    } else if (period === "monthly") {
      for (let i = 1; i <= 4; i++) {
        const weekTotal = transactions
          .filter(tx => {
            const txDate = new Date(tx.created_at);
            const isEscrow = tx.type === 'escrow_release';
            const isSameMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            const weekNum = Math.ceil(txDate.getDate() / 7);
            return isEscrow && isSameMonth && (weekNum === i || (i === 4 && weekNum > 4));
          })
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
        data.push({ label: `${t("reports.weekly").charAt(0)}${i}`, value: weekTotal });
      }
    } else if (period === "yearly") {
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        const monthLabel = d.toLocaleDateString(undefined, { month: 'short' });
        const monthTotal = transactions
          .filter(tx => {
            const txDate = new Date(tx.created_at);
            return tx.type === 'escrow_release' && txDate.getMonth() === i && txDate.getFullYear() === now.getFullYear();
          })
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
        data.push({ label: monthLabel, value: monthTotal });
      }
    }
    
    const maxVal = Math.max(...data.map(d => d.value), 0) || 1;
    return data.map(d => ({
      ...d,
      height: (d.value / maxVal) * 100
    }));
  }, [transactions, period, t]);

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="reports-container soft-fade-in">
      <header className="reports-header">
        <div className="header-left">
          <h1>{t("reports.title")}</h1>
          <p>{t("reports.subtitle")}</p>
        </div>
        <div className="header-actions">
          <div className="period-tabs glass-card">
            {["weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                className={period === p ? "active" : ""}
                onClick={() => setPeriod(p)}
              >
                {t(`reports.${p}`)}
              </button>
            ))}
          </div>
          <button className="icon-btn-secondary glass-card" title="Download Report">
            <Download size={18} />
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stats-card glass-card luxury-gradient-1">
          <div className="stats-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">{t("reports.totalEarned")}</span>
            <h2 className="stats-value">
              <Price amount={stats.totalEarned} currency="UZS" />
            </h2>
            <div className="stats-trend pos">
              <ArrowUpRight size={14} />
              <span>+12.5%</span>
            </div>
          </div>
        </div>

        <div className="stats-card glass-card luxury-gradient-2">
          <div className="stats-icon">
            <CreditCard size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">{t("reports.platformFees")}</span>
            <h2 className="stats-value">
              <Price amount={stats.platformFees} currency="UZS" />
            </h2>
            <div className="stats-trend neg">
              <ArrowDownRight size={14} />
              <span>-10%</span>
            </div>
          </div>
        </div>

        <div className="stats-card glass-card luxury-gradient-3">
          <div className="stats-icon">
            <DollarSign size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">{t("reports.netIncome")}</span>
            <h2 className="stats-value">
              <Price amount={stats.netIncome} currency="UZS" />
            </h2>
            <div className="stats-trend pos">
              <ArrowUpRight size={14} />
              <span>+8.2%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="reports-content-grid">
        <div className="chart-preview glass-card">
          <div className="card-header">
            <h3><BarChart3 size={20} /> {t("reports.periodEarnings")}</h3>
            <span className="badge">{t(`reports.${period}`)}</span>
          </div>
          <div className="mock-chart">
            <div className="bars-container">
              {chartData.map((d, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar" style={{ height: `${d.height}%` }}>
                    <div className="bar-tooltip">{d.value.toLocaleString()}</div>
                  </div>
                  <span className="bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="recent-activity glass-card">
          <div className="card-header">
            <h3><Calendar size={20} /> {t("reports.recentActivity")}</h3>
          </div>
          <div className="activity-list">
            {stats.list.length > 0 ? (
              stats.list.slice(0, 5).map((tx) => (
                <div key={tx.id} className="activity-item">
                  <div className="item-icon">
                    <Briefcase size={16} />
                  </div>
                  <div className="item-info">
                    <p className="item-title">{tx.job_title || t(`wallet.types.${tx.type}`)}</p>
                    <span className="item-date">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`item-amount ${tx.type === 'escrow_release' ? 'pos' : 'neg'}`}>
                    {tx.type === 'escrow_release' ? '+' : '-'}
                    <Price amount={tx.amount} currency="UZS" />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>{t("reports.noData")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
