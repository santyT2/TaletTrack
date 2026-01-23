import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HRLayout from './modules/hr/HRLayout';
import HRRoutes from './modules/hr/HRRoutes';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirigir root a /hr */}
                <Route path="/" element={<Navigate to="/hr" replace />} />
                
                {/* Rutas del módulo HR */}
                <Route path="/hr/*" element={<HRLayout />}>
                    <Route path="*" element={<HRRoutes />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
