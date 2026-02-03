import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLogin, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from "../redux/slices/authSlice";
import { showNotification } from "../redux/slices/uiSlice";
// import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation logic
  const validate = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = "Identifier is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)
    ) {
      newErrors.identifier = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        dispatch(clearError());

        // Dispatch Redux action
        await dispatch(loginUser(formData)).unwrap();

        // Show success notification
        dispatch(showNotification({
          type: 'success',
          message: 'Login successful!',
        }));

        // Navigate to dashboard
        navigate("/dashboard");
      } catch (err) {
        // Error is handled by Redux slice
        dispatch(showNotification({
          type: 'error',
          message: err || 'Login failed',
        }));
      }
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      dispatch(clearError());

      // Dispatch Google login action
      await dispatch(googleLogin(credentialResponse.credential)).unwrap();

      // Show success notification
      dispatch(showNotification({
        type: 'success',
        message: 'Google login successful!',
      }));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      dispatch(showNotification({
        type: 'error',
        message: err || 'Google login failed',
      }));
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    dispatch(showNotification({
      type: 'error',
      message: 'Google login failed. Please try again.',
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-3xl p-10 w-full max-w-md">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Login to continue learning with Fornix
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${errors.identifier
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-orange-500"
                }`}
              placeholder="you@example.com"
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${errors.password
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-orange-500"
                }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}

            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <p className="text-red-600 text-sm text-center">{apiError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        {/* <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div> */}

        {/* Google Sign-In */}
        {/* <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

        </div> */}

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-500 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

