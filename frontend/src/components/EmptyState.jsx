function EmptyState({ emoji = '📷', title, text, button }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-6xl mb-4">{emoji}</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{text}</p>
      {button}
    </div>
  )
}

export default EmptyState