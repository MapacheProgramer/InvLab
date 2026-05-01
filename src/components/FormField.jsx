function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  as = 'input',
  children,
}) {
  return (
    <div className="field">
      {label && <label className="input-label">{label}</label>}

      {as === 'select' ? (
        <select className="input" value={value} onChange={onChange}>
          {children}
        </select>
      ) : (
        <input
          className="input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  )
}

export default FormField