import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import UserProfile from './components/UserProfile';
import { isAuthenticated } from './utils';

// PrivateRoute for protecting authenticated routes
const PrivateRoute = ({ element, ...rest }) => {
  return isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/login" />
  );
};

// AuthRoute for redirecting authenticated users from login/signup
const AuthRoute = ({ element, ...rest }) => {
  return !isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/" />
  );
};

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          {/* Regular route for Home */}
          <Route path="/" element={<Home />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<AuthRoute element={<Login />} />} />
          <Route path="/signup" element={<AuthRoute element={<Signup />} />} />
          
          {/* Private routes */}
          <Route path="/create" element={<PrivateRoute element={<CreatePost />} />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/users/:id" element={<PrivateRoute element={<UserProfile />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
