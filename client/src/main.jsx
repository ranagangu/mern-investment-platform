import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  CircleDollarSign,
  GitBranch,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value || 0);
}

async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed');
  return body;
}

function AuthPanel({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload =
        mode === 'register'
          ? form
          : {
              email: form.email,
              password: form.password
            };
      const data = await api(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      onAuthed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand-row">
          <ShieldCheck size={28} />
          <div>
            <h1>Investment Console</h1>
            <p>Secure ROI and referral tracking</p>
          </div>
        </div>

        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {mode === 'register' && (
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              minLength={2}
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength={mode === 'register' ? 8 : 1}
            required
          />
        </label>

        {mode === 'register' && (
          <label>
            Referral Code
            <input
              value={form.referralCode}
              onChange={(event) => setForm({ ...form, referralCode: event.target.value })}
            />
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button className="primary" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : null}
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <section className="metric">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function ReferralNode({ node }) {
  return (
    <li>
      <div className="tree-node">
        <strong>{node.name}</strong>
        <span>{node.referralCode}</span>
      </div>
      {node.children?.length ? (
        <ul>
          {node.children.map((child) => (
            <ReferralNode key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Dashboard({ token, initialUser, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [tree, setTree] = useState(null);
  const [plans, setPlans] = useState({});
  const [investment, setInvestment] = useState({ amount: 5000, plan: 'starter' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, treeData, planData] = await Promise.all([
        api('/api/dashboard', { token }),
        api('/api/referrals/tree', { token }),
        api('/api/investments/plans', { token })
      ]);
      setDashboard(dashboardData);
      setTree(treeData.tree);
      setPlans(planData.plans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createInvestment(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/api/investments', {
        token,
        method: 'POST',
        body: JSON.stringify({ amount: Number(investment.amount), plan: investment.plan })
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const chartData = useMemo(() => {
    const grouped = new Map();
    for (const row of dashboard?.roiHistory || []) {
      grouped.set(row.dateKey, (grouped.get(row.dateKey) || 0) + row.amount);
    }
    return [...grouped.entries()].reverse().map(([date, amount]) => ({ date, amount }));
  }, [dashboard]);

  if (loading) {
    return (
      <main className="loading">
        <Loader2 className="spin" size={30} />
        <span>Loading dashboard</span>
      </main>
    );
  }

  const user = dashboard?.user || initialUser;

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <h1>Investment Dashboard</h1>
          <p>
            {user.name} · Referral code <strong>{user.referralCode}</strong>
          </p>
        </div>
        <button className="icon-button" type="button" title="Logout" onClick={onLogout}>
          <LogOut size={20} />
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="metrics-grid">
        <Metric icon={CircleDollarSign} label="Total Investments" value={money(dashboard.metrics.totalInvestments)} />
        <Metric icon={Activity} label="Daily ROI" value={money(dashboard.metrics.dailyRoi)} />
        <Metric icon={GitBranch} label="Level Income" value={money(dashboard.metrics.totalLevelIncome)} />
        <Metric icon={Wallet} label="Wallet Balance" value={money(dashboard.metrics.walletBalance)} />
      </section>

      <section className="content-grid">
        <section className="panel">
          <div className="panel-title">
            <h2>ROI Trend</h2>
            <span>Last 30 entries</span>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => money(value)} />
                <Bar dataKey="amount" fill="#2f7d68" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <h2>Create Investment</h2>
          </div>
          <form className="investment-form" onSubmit={createInvestment}>
            <label>
              Amount
              <input
                type="number"
                min="1"
                value={investment.amount}
                onChange={(event) => setInvestment({ ...investment, amount: event.target.value })}
                required
              />
            </label>
            <label>
              Plan
              <select
                value={investment.plan}
                onChange={(event) => setInvestment({ ...investment, plan: event.target.value })}
              >
                {Object.entries(plans).map(([key, plan]) => (
                  <option key={key} value={key}>
                    {key} · {plan.dailyRoiPercent}% · {plan.durationDays} days
                  </option>
                ))}
              </select>
            </label>
            <button className="primary" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
              Add investment
            </button>
          </form>
        </section>
      </section>

      <section className="content-grid">
        <section className="panel">
          <div className="panel-title">
            <h2>Investments</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>ROI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.investments.map((row) => (
                  <tr key={row._id}>
                    <td>{row.plan}</td>
                    <td>{money(row.amount)}</td>
                    <td>{row.dailyRoiPercent}%</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <h2>Referral Tree</h2>
          </div>
          <ul className="tree">{tree ? <ReferralNode node={tree} /> : null}</ul>
        </section>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h2>Recent Level Income</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Level</th>
                <th>Percent</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.levelIncome.map((row) => (
                <tr key={row._id}>
                  <td>{row.dateKey}</td>
                  <td>{row.fromUser?.name || 'User'}</td>
                  <td>{row.level}</td>
                  <td>{row.percent}%</td>
                  <td>{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('investment-session');
    return raw ? JSON.parse(raw) : null;
  });

  function onAuthed(data) {
    localStorage.setItem('investment-session', JSON.stringify(data));
    setSession(data);
  }

  function logout() {
    localStorage.removeItem('investment-session');
    setSession(null);
  }

  return session?.token ? (
    <Dashboard token={session.token} initialUser={session.user} onLogout={logout} />
  ) : (
    <AuthPanel onAuthed={onAuthed} />
  );
}

createRoot(document.getElementById('root')).render(<App />);
