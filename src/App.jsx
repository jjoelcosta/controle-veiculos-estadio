import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import VehicleRegistry from './components/VehicleRegistry';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <VehicleRegistry />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;