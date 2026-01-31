import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUserWithPlan, registerFreeUser, clearError, selectAuthLoading, selectAuthError } from "../redux/slices/authSlice";
import { fetchCoursesWithPlans, selectCourses, selectPlans } from "../redux/slices/coursesSlice";
import { showNotification } from "../redux/slices/uiSlice";
import API from "../api/api";
import RazorpayCheckout from "../Components/RazorpayCheckout";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);
  const courses = useSelector(selectCourses);
  const plans = useSelector(selectPlans);

  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [availableColleges, setAvailableColleges] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);

  // Generate a unique session ID for guest payment
  // This ensures valid UUID format for backend validation without hardcoded mocks
  const guestUserId = useMemo(() => {
    if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
      return self.crypto.randomUUID();
    }
    // Fallback for older browsers (though unlikely needed for modern React apps)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "", // mobile
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    country_id: "",
    college_name: "",
    gender: "male",
    course_id: "",
    plan_id: "",
    amount: 0,
  });

  const [errors, setErrors] = useState({});

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Fetch initial data (Countries, Courses)
  useEffect(() => {
    dispatch(fetchCoursesWithPlans());

    const fetchCountries = async () => {
      try {
        const res = await API.get('/mobile/countries');
        if (res.data && res.data.success) {
          setCountries(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, [dispatch]);

  // Handle Country Change -> Populate Colleges and set country_id
  useEffect(() => {
    if (formData.country) {
      const countryObj = countries.find(c => c.name === formData.country);
      if (countryObj) {
        setAvailableColleges(countryObj.colleges || []);
        setFormData(prev => ({ ...prev, country_id: countryObj.id }));
      } else {
        setAvailableColleges([]);
        setFormData(prev => ({ ...prev, country_id: "" }));
      }
    } else {
      setAvailableColleges([]);
      setFormData(prev => ({ ...prev, country_id: "" }));
    }
  }, [formData.country, countries]);


  // Handle Course Change -> Populate Plans
  useEffect(() => {
    if (formData.course_id) {
      const coursePlans = plans.filter(p => p.course_id === formData.course_id);
      const selectedCourse = courses.find(c => c.id === formData.course_id);
      const displayPlans = coursePlans.length > 0 ? coursePlans : (selectedCourse?.plans || []);
      setAvailablePlans(displayPlans);
    } else {
      setAvailablePlans([]);
    }
  }, [formData.course_id, plans, courses]);

  // Handle Plan Change -> Set Amount (Still needed if we want to pre-select, but Step 2 handles selection now)
  useEffect(() => {
    if (formData.plan_id) {
      const plan = availablePlans.find(p => p.id === formData.plan_id);
      if (plan) {
        setFormData(prev => ({ ...prev, amount: plan.price }));
      }
    }
  }, [formData.plan_id, availablePlans]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for that field
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validateStep1 = () => {
    let err = {};

    if (!formData.name.trim()) err.name = "Name required";
    if (!formData.email) err.email = "Email required";
    if (!formData.phone) err.phone = "Phone number required";
    if (!formData.password) err.password = "Password required";
    if (formData.password !== formData.confirmPassword) err.confirmPassword = "Passwords do not match";

    if (!formData.country) err.country_id = "Country required";
    if (!formData.college_name) err.college_name = "College required";
    if (!formData.course_id) err.course_id = "Course required";

    // Plan is not required for Step 1 completion, it's selected in Step 2

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePaymentSuccess = async (paymentResult, planId, planAmount) => {
    try {
      // Construct payload matching the user's requirement
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        country_id: formData.country_id,
        college_name: formData.college_name,
        gender: formData.gender,
        mobile: formData.phone, // "mobile" key as per request

        // Course and Plan
        course_id: formData.course_id,
        plan_id: planId || formData.plan_id,
        amount: planAmount || formData.amount,

        // Payment Data
        payment_id: paymentResult.razorpay_payment_id || paymentResult.transaction_id,
        transaction_mode: "upi", // User requested this specific value match or similar. We can default to 'upi' or 'razorpay'
        transaction_status: "success",
        payment_date: new Date().toISOString()
      };

      console.log("Registering with payload:", payload);

      // Call register-with-plan API
      const response = await dispatch(registerUserWithPlan(payload)).unwrap();

      console.log("Registration Response:", response);

      // "Store the enrolled course" - Since we are redirecting to login and don't have a token yet,
      // we essentially rely on the backend. We can log it or store in local state if needed for a "success" page,
      // but the request asks to "jump to login page".
      if (response && response.enrolled_course) {
        console.log("Enrolled Course Stored:", response.enrolled_course);
        // Potential place to dispatch a Redux action if we were staying logged in
      }

      dispatch(showNotification({
        type: 'success',
        message: 'Registered and enrolled successfully! Please login.',
      }));

      // Jump to login page
      navigate("/login");

    } catch (err) {
      console.error("Registration error:", err);
      dispatch(showNotification({
        type: 'error',
        message: typeof err === 'string' ? err : 'Registration failed after payment',
      }));
    }
  };

  const handlePaymentFailure = (error) => {
    console.error("Payment failed", error);
  };

  const handleFreeRegistration = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        country_id: formData.country_id,
        college_name: formData.college_name,
        gender: formData.gender,
        mobile: formData.phone,
        course_id: formData.course_id
      };

      console.log("Registering free user with payload:", payload);

      const response = await dispatch(registerFreeUser(payload)).unwrap();
      console.log("Free Registration Response:", response);

      dispatch(showNotification({
        type: 'success',
        message: 'Registered successfully! Please login.',
      }));

      // Jump to login page
      navigate("/login");

    } catch (err) {
      console.error("Free registration error:", err);
      dispatch(showNotification({
        type: 'error',
        message: typeof err === 'string' ? err : 'Free registration failed',
      }));
    }
  };

  return (
    <div className="pt-32 min-h-screen flex items-center justify-center bg-gray-50 px-4 pb-20">
      <div className={`bg-white shadow-xl rounded-3xl p-10 w-full ${step === 2 ? 'max-w-[90rem]' : 'max-w-2xl'}`}>
        <h2 className="text-3xl font-bold text-center mb-6">
          {step === 1 ? "Create Account" : "Select Plan & Pay"}
        </h2>

        {/* Step 1: User Details */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}

            {/* Gender Selection */}
            <div className="flex gap-4 items-center">
              <span className="text-gray-600 font-medium mr-2">Gender:</span>
              {['male', 'female', 'other'].map((g) => (
                <label key={g} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>

            {/* Country Selection */}
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl bg-white"
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {errors.country_id && <p className="text-red-500 text-sm">{errors.country_id}</p>}

            {/* College Selection */}
            <select
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl bg-white"
              disabled={!formData.country}
            >
              <option value="">Select College/Institute</option>
              {availableColleges.map((col, idx) => (
                <option key={col.id || idx} value={col.name}>{col.name}</option>
              ))}
            </select>
            {errors.college_name && <p className="text-red-500 text-sm">{errors.college_name}</p>}


            {/* Course Selection */}
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl bg-white"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.course_id && <p className="text-red-500 text-sm">{errors.course_id}</p>}

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-full hover:bg-orange-600 transition font-bold text-lg shadow-lg shadow-orange-200 mt-6"
            >
              Next Step →
            </button>
          </form>
        )}

        {/* Step 2: Pricing Plans */}
        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-6 flex items-center text-gray-500 hover:text-orange-500 transition"
            >
              ← Back to Details
            </button>

            {availablePlans.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No plans available for this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(availablePlans.length > 0 ? [...availablePlans].sort((a, b) => {
                  const getDuration = (p) => {
                    // Try to use duration_months if valid
                    if (p.duration_months) return parseInt(p.duration_months);
                    // Fallback to parsing name
                    const match = (p.name || '').match(/(\d+)\s*(Month|Year)/i);
                    if (match) {
                      const val = parseInt(match[1]);
                      if (match[2].toLowerCase().startsWith('year')) return val * 12;
                      return val;
                    }
                    // Fallback to price (lower price usually means lower duration)
                    return p.price || 999;
                  };
                  return getDuration(a) - getDuration(b);
                }) : []).map((plan, idx) => {
                  const styles = [
                    {
                      color: 'blue',
                      bgHeader: 'bg-blue-500',
                      textHeader: '1 Month Plan',
                      subtext: 'Ideal for quick revision & practice',
                      priceColor: 'text-blue-600',
                      btnColor: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200',

                    },
                    {
                      color: 'purple',
                      bgHeader: 'bg-purple-600',
                      textHeader: '3 Months Plan',
                      subtext: 'Best for complete preparation',
                      priceColor: 'text-purple-600',
                      btnColor: 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-200'
                    },
                    {
                      color: 'orange',
                      bgHeader: 'bg-orange-500',
                      textHeader: '6 Months Plan',
                      subtext: 'Ideal for thorough and smart preparation',
                      priceColor: 'text-orange-600',
                      badge: 'Best Value',
                      btnColor: 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-orange-200'
                    },
                    {
                      color: 'teal',
                      bgHeader: 'bg-teal-600',
                      textHeader: '1 Year Plan',
                      subtext: 'Best value for long term learning',
                      priceColor: 'text-teal-600',
                      badge: 'Premium',
                      btnColor: 'bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-200'
                    }
                  ];

                  const style = styles[idx % styles.length];

                  return (
                    <div key={plan.id} className="relative group bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col h-full max-w-sm mx-auto w-full">
                      {/* Badge */}
                      {style.badge && (
                        <div className={`absolute top-0 right-0 ${style.bgHeader} text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-md`}>
                          {style.badge}
                        </div>
                      )}

                      {/* Header */}
                      <div className={`${style.bgHeader} p-3 text-center text-white relative overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 skew-y-6 transform origin-bottom-left"></div>
                        <h3 className="text-xl font-bold relative z-10">{plan.name || style.textHeader}</h3>
                      </div>

                      {/* Subheader */}
                      <div className={`bg-${style.color}-50 p-1.5 text-center border-b border-${style.color}-100`}>
                        <p className={`text-${style.color}-800 text-[10px] font-semibold`}>{style.subtext}</p>
                      </div>

                      {/* Features */}
                      <div className="p-4 flex-1">
                        <ul className="space-y-2 text-xs text-gray-600">
                          {[
                            "Q Bank (7000+ Clinical Questions)",
                            "Mock Tests",
                            "AI Doubt Solver (24/7)",
                            "High Yield Notes",
                            "Advanced Analytics",
                            "FREE Updates During Validity"
                          ].map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <svg className={`w-4 h-4 ${style.priceColor} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price */}
                      <div className="px-4 py-3 text-center bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-gray-400 line-through text-xs">₹{plan.original_price || Math.round(plan.price * 1.5)}</span>
                          <span className={`text-2xl font-extrabold ${style.priceColor}`}>₹{plan.price}</span>
                        </div>
                        {plan.price > 0 && (
                          <p className="text-[10px] text-orange-500 font-bold mb-2">(Limited Offer)</p>
                        )}
                        {/* Validty */}
                        <p className="text-[10px] text-gray-500 mb-3">Validity: {(() => {
                          if (plan.duration_months) return plan.duration_months;
                          const match = (plan.name || '').match(/(\d+)\s*(Month|Year)/i);
                          if (match) {
                            const val = parseInt(match[1]);
                            if (match[2].toLowerCase().startsWith('year')) return val * 12;
                            return val;
                          }
                          return '?';
                        })()} Months</p>

                        <RazorpayCheckout
                          amount={plan.price}
                          currency="INR"
                          courseId={formData.course_id}
                          planId={plan.id}
                          planName={plan.name}
                          userId={guestUserId} // Use dynamic session ID
                          userEmail={formData.email}
                          userPhone={formData.phone}
                          userName={formData.name}
                          onSuccess={(result) => handlePaymentSuccess(result, plan.id, plan.price)}
                          onFailure={handlePaymentFailure}
                          buttonText={plan.price === 0 ? "Enroll Free" : "Buy Now"}
                          buttonClassName={`w-full ${style.btnColor} text-white font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm`}
                          skipVerification={true} // Skip internal verification, use register-with-plan instead
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Free/Guest Registration Option */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-4 font-medium">
                  Want to explore before committing?
                </p>
                <button
                  onClick={handleFreeRegistration}
                  disabled={loading}
                  className="group relative px-10 py-3 overflow-hidden rounded-xl bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-orange-500 hover:text-white hover:border-orange-500"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Processing...' : 'Continue as Free User'}
                    {!loading && (
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {apiError && (
          <p className="text-red-600 text-sm text-center mt-4">{apiError}</p>
        )}

        {step === 1 && (
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 font-semibold">
              Login
            </Link>
          </p>
        )}

      </div>
    </div>
  );

}

export default Signup;


