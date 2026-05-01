function EmptyState({ text, detail }) {
  return (
    <div className="empty">
      <p>{text}</p>
      {detail && <span>{detail}</span>}
    </div>
  )
}

export default EmptyState