function ErrorBanner({ message, onRetry }) {
  return (
    <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">📡</div>
      <p className="text-red-600 font-semibold mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-500 text-white px-6 py-2 rounded-full font-bold hover:bg-red-600"
        >
          Qayta urinish
        </button>
      )}
    </div>
  )
}

export default ErrorBanner