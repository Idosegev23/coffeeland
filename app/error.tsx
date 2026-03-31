'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-background px-4"
    >
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-4">
          אופס! משהו השתבש
        </h1>
        <p className="text-text-light mb-8">
          אירעה שגיאה בלתי צפויה. נסו לרענן את העמוד.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          נסו שוב
        </button>
      </div>
    </div>
  )
}
