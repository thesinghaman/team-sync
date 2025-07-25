import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-4">
          The page you're looking for cannot be found.
        </p>
        <div className="bg-gray-100 p-3 rounded text-sm">
          <strong>Current path:</strong> {location.pathname}
          <br />
          <strong>Search:</strong> {location.search}
          <br />
          <strong>Hash:</strong> {location.hash}
        </div>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
