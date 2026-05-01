function StatCard({ title, value, warning }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h3 className={warning ? 'stat-value stat-warning' : 'stat-value'}>
        {value}
      </h3>
    </div>
  )
}

export default StatCard