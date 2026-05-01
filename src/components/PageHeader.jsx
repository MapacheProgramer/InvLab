function PageHeader({ label, title, subtitle }) {
  return (
    <div className="page-header">
      {label && <p className="page-label">{label}</p>}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  )
}

export default PageHeader