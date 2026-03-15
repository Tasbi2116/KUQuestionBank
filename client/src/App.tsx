import { Routes, Route } from "react-router-dom";

/**
 * Root application router.
 * Routes will be expanded in Phase 4.
 */
function App(): JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="card text-center space-y-3">
              <h1 className="text-2xl font-bold text-primary-400">
                🎓 KU Question Bank
              </h1>
              <p className="text-gray-400">
                Khulna University · Phase 1 Setup Complete
              </p>
              <p className="text-xs text-gray-600">
                Frontend is running. More coming in Phase 4.
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;