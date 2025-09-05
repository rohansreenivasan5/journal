export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Webapp Template
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A clean, minimal Next.js template ready for development and deployment
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Next.js 15 with App Router</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>TypeScript</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Tailwind CSS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>ESLint</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Ready to deploy to Vercel • Start building your next webapp
          </div>
        </div>
      </div>
    </main>
  );
}
