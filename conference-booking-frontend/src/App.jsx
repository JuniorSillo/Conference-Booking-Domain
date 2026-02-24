import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BookingPage from './components/BookingPage.jsx'; // create this
import LoginForm from './components/LoginForm.jsx';

function App() {
  const isLoggedIn = !!localStorage.getItem("token"); // simple check

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/bookings"
          element={isLoggedIn ? <BookingPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/bookings" : "/login"} />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;