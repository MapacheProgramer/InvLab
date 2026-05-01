import { useNavigate, useLocation } from 'react-router-dom'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap');

  :root {
    --purple: #7C3AED;
    --purple-dark: #6D28D9;
    --purple-light: #8B5CF6;
    --purple-glow: rgba(124,58,237,0.15);
    --purple-border: rgba(124,58,237,0.25);
    --gold: #F59E0B;
    --dark: #0A0A0F;
    --dark-2: #111118;
    --dark-3: #18181F;
    --dark-4: #1F1F28;
    --gray: #7070A0;
    --gray-2: #454565;
    --light: #E8E8FF;
    --white: #F4F4FF;
    --success: #22c55e;
    --danger: #ef4444;
    --warning: #F59E0B;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  .layout {
    font-family: 'Barlow', sans-serif;
    background: var(--dark);
    color: var(--white);
    min-height: 100vh;
    display: grid;
    grid-template-columns: 230px 1fr;
  }

  /* SIDEBAR */
  .sidebar {
    background: var(--dark-2);
    border-right: 1px solid rgba(124,58,237,0.12);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .sidebar-logo {
    padding: 1.6rem 1.5rem 1.4rem;
    border-bottom: 1px solid rgba(124,58,237,0.12);
  }
  .logo-mark {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.7rem;
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
    line-height: 1;
  }
  .logo-mark .inv { color: var(--white); }
  .logo-mark .lab { color: var(--purple-light); }
  .logo-sub {
    font-size: 0.62rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gray);
    font-weight: 600;
    margin-top: 4px;
    display: block;
  }

  .sidebar-nav { padding: 1rem 0; flex: 1; overflow-y: auto; }
  .nav-section-label {
    font-size: 0.6rem;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--gray-2);
    font-weight: 700;
    padding: 0.8rem 1.5rem 0.3rem;
    display: block;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 1.5rem;
    color: var(--gray);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.88rem;
    font-weight: 500;
    border-left: 2px solid transparent;
    user-select: none;
  }
  .nav-item:hover { color: var(--white); background: rgba(124,58,237,0.06); }
  .nav-item.active {
    color: var(--white);
    background: var(--purple-glow);
    border-left-color: var(--purple-light);
  }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-divider { height: 1px; background: rgba(124,58,237,0.1); margin: 0.5rem 1.5rem; }

  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(124,58,237,0.1);
  }
  .version-badge {
    font-size: 0.68rem;
    color: var(--gray-2);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* MAIN */
  .main { overflow-y: auto; min-width: 0; }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 2rem;
    border-bottom: 1px solid rgba(124,58,237,0.1);
    background: var(--dark-2);
    position: sticky;
    top: 0;
    z-index: 10;
    gap: 1rem;
  }
  .topbar-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.3rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    white-space: nowrap;
  }
  .topbar-title span { color: var(--purple-light); }
  .topbar-right { display: flex; align-items: center; gap: 0.8rem; }

  .btn-primary {
    background: var(--purple);
    color: white;
    border: none;
    padding: 0.55rem 1.2rem;
    border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: var(--purple-dark); transform: translateY(-1px); }

  .btn-cancel {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--gray);
    padding: 0.55rem 1.1rem;
    border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: var(--white); }

  .btn-save {
    background: var(--purple);
    color: white;
    border: none;
    padding: 0.55rem 1.4rem;
    border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-save:hover:not(:disabled) { background: var(--purple-dark); }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-danger {
    background: transparent;
    border: 1px solid rgba(239,68,68,0.3);
    color: var(--danger);
    padding: 0.55rem 1.1rem;
    border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.1); border-color: var(--danger); }

  /* CONTENT */
  .page-content { padding: 2rem; }

  /* STATS GRID */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: rgba(124,58,237,0.08);
    border-bottom: 1px solid rgba(124,58,237,0.1);
  }
  .stat-card {
    background: var(--dark);
    padding: 1.4rem 1.8rem;
    transition: background 0.2s;
  }
  .stat-card:hover { background: var(--dark-2); }
  .stat-label {
    font-size: 0.68rem;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--gray);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .stat-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.9rem;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 0.2rem;
  }
  .stat-sub { font-size: 0.75rem; color: var(--gray); }
  .stat-card.purple .stat-value { color: var(--purple-light); }
  .stat-card.gold .stat-value { color: var(--gold); }
  .stat-card.success .stat-value { color: var(--success); }
  .stat-card.danger .stat-value { color: var(--danger); }

  /* TABLE */
  .table-toolbar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray);
    font-size: 0.9rem;
  }
  .search-input {
    width: 100%;
    background: var(--dark-2);
    border: 1px solid rgba(124,58,237,0.15);
    border-radius: 4px;
    padding: 0.6rem 1rem 0.6rem 2.2rem;
    color: var(--white);
    font-family: 'Barlow', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .search-input::placeholder { color: var(--gray-2); }
  .search-input:focus { border-color: rgba(124,58,237,0.5); }

  .filter-select {
    background: var(--dark-2);
    border: 1px solid rgba(124,58,237,0.15);
    border-radius: 4px;
    padding: 0.6rem 0.9rem;
    color: var(--white);
    font-family: 'Barlow', sans-serif;
    font-size: 0.9rem;
    outline: none;
    cursor: pointer;
  }
  .filter-select option { background: var(--dark-2); }

  .table-wrap {
    background: var(--dark-2);
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  table { width: 100%; border-collapse: collapse; }
  thead { background: var(--dark-3); }
  th {
    padding: 0.8rem 1rem;
    text-align: left;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gray);
    border-bottom: 1px solid rgba(124,58,237,0.1);
    white-space: nowrap;
  }
  td {
    padding: 0.8rem 1rem;
    font-size: 0.87rem;
    border-bottom: 1px solid rgba(124,58,237,0.05);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(124,58,237,0.04); }

  .td-name { font-weight: 600; color: var(--white); }
  .td-price {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--purple-light);
  }
  .td-cat {
    font-size: 0.72rem;
    color: var(--purple-light);
    background: rgba(124,58,237,0.12);
    border: 1px solid var(--purple-border);
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    white-space: nowrap;
  }
  .td-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .action-btn {
    background: var(--dark-3);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--gray);
    padding: 0.3rem 0.65rem;
    border-radius: 4px;
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Barlow', sans-serif;
    white-space: nowrap;
  }
  .action-btn:hover { color: var(--white); }
  .action-btn.edit:hover { color: var(--gold); border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }
  .action-btn.delete:hover { color: var(--danger); border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.06); }
  .action-btn.pay:hover { color: var(--success); border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.06); }

  /* BADGES */
  .badge {
    font-size: 0.7rem;
    font-weight: 700;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    border-radius: 3px;
  }
  .badge-ok { background: rgba(34,197,94,0.12); color: var(--success); border: 1px solid rgba(34,197,94,0.2); }
  .badge-low { background: rgba(245,158,11,0.12); color: var(--warning); border: 1px solid rgba(245,158,11,0.2); }
  .badge-out { background: rgba(239,68,68,0.12); color: var(--danger); border: 1px solid rgba(239,68,68,0.2); }
  .badge-contado { background: rgba(124,58,237,0.12); color: var(--purple-light); border: 1px solid var(--purple-border); }
  .badge-credito { background: rgba(245,158,11,0.12); color: var(--gold); border: 1px solid rgba(245,158,11,0.2); }
  .badge-pendiente { background: rgba(245,158,11,0.12); color: var(--gold); border: 1px solid rgba(245,158,11,0.2); }
  .badge-pagado { background: rgba(34,197,94,0.12); color: var(--success); border: 1px solid rgba(34,197,94,0.2); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal-backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(6px);
  }
  .modal {
    position: relative; z-index: 1;
    background: var(--dark-2);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 10px;
    width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto;
    animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(124,58,237,0.08);
  }
  .modal.sm { max-width: 400px; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.4rem 1.5rem;
    border-bottom: 1px solid rgba(124,58,237,0.12);
    position: sticky; top: 0; background: var(--dark-2); z-index: 2;
  }
  .modal-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.15rem; font-weight: 900;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .modal-close {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--gray); width: 30px; height: 30px;
    border-radius: 50%; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .modal-close:hover { color: var(--danger); border-color: rgba(239,68,68,0.4); }
  .modal-body { padding: 1.4rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(124,58,237,0.1);
    display: flex; gap: 0.7rem; justify-content: flex-end;
  }

  /* FORM */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .form-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--gray);
  }
  .form-input, .form-select, .form-textarea {
    background: var(--dark-3);
    border: 1px solid rgba(124,58,237,0.15);
    border-radius: 5px;
    padding: 0.62rem 0.9rem;
    color: var(--white);
    font-family: 'Barlow', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .form-input::placeholder { color: var(--gray-2); }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: rgba(124,58,237,0.5); }
  .form-select option { background: var(--dark-3); }
  .form-textarea { resize: vertical; min-height: 80px; }

  /* TOAST */
  .toast {
    position: fixed; bottom: 2rem; right: 2rem;
    padding: 0.9rem 1.4rem; border-radius: 6px;
    font-size: 0.87rem; font-weight: 500; z-index: 999;
    animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    display: flex; align-items: center; gap: 0.5rem;
  }
  .toast.success { background: var(--dark-2); border: 1px solid rgba(34,197,94,0.3); border-left: 3px solid var(--success); }
  .toast.error { background: var(--dark-2); border: 1px solid rgba(239,68,68,0.3); border-left: 3px solid var(--danger); }
  @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 0.4rem;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* EMPTY STATE */
  .empty-state {
    text-align: center; padding: 4rem 2rem;
    color: var(--gray);
  }
  .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; }
  .empty-text { font-size: 0.9rem; }
`

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '◈', path: '/dashboard', section: 'GENERAL' },
  { label: 'Inventario', icon: '▦', path: '/inventario', section: 'GESTIÓN' },
  { label: 'Ventas', icon: '↑', path: '/ventas', section: 'GESTIÓN' },
  { label: 'Compras', icon: '↓', path: '/compras', section: 'GESTIÓN' },
  { label: 'Créditos', icon: '◷', path: '/creditos', section: 'GESTIÓN' },
  { label: 'Caja', icon: '⊟', path: '/caja', section: 'FINANZAS' },
]

export default function Layout({ children, title, titleAccent, action }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <style>{STYLES}</style>
      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <span className="inv">INV</span><span className="lab">LAB</span>
            </div>
            <span className="logo-sub">Control de Negocio</span>
          </div>

          <nav className="sidebar-nav">
            {['GENERAL', 'GESTIÓN', 'FINANZAS'].map(section => {
              const items = NAV_ITEMS.filter(i => i.section === section)
              if (!items.length) return null
              return (
                <div key={section}>
                  <span className="nav-section-label">{section}</span>
                  {items.map(item => (
                    <div
                      key={item.path}
                      className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                      onClick={() => navigate(item.path)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                  <div className="nav-divider" />
                </div>
              )
            })}
          </nav>

          <div className="sidebar-footer">
            <span className="version-badge">InvLab v1.0</span>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">
              {title}{titleAccent && <> <span>{titleAccent}</span></>}
            </div>
            <div className="topbar-right">
              {action}
            </div>
          </div>
          {children}
        </main>
      </div>
    </>
  )
}