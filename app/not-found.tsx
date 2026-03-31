import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-background px-4"
    >
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-primary mb-4">
          העמוד לא נמצא
        </h2>
        <p className="text-text-light mb-8">
          מצטערים, העמוד שחיפשתם לא קיים או שהוסר.
        </p>
        <Link
          href="/"
          className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
