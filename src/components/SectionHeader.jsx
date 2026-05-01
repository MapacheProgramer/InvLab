function SectionHeader({ title, count, search, setSearch, searchPlaceholder }) {
  return (
    <div className="table-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {count !== undefined && (
          <p className="small-text">{count} registro(s) encontrado(s)</p>
        )}
      </div>

      {setSearch && (
        <input
          className="search-input"
          placeholder={searchPlaceholder || 'Buscar...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
    </div>
  )
}

export default SectionHeader