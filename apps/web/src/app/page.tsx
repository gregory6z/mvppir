export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MVPPIR Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Monorepo successfully configured! 🎉
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 text-left">
          <h2 className="text-2xl font-semibold mb-4">Features to implement:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ User management</li>
            <li>✅ Deposit monitoring</li>
            <li>✅ Withdrawal approval system</li>
            <li>✅ MLM network visualization</li>
            <li>✅ Commission management</li>
            <li>✅ Analytics dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
