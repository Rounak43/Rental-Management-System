import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [accountType, setAccountType] = useState(
        new URLSearchParams(location.search).get("type") === "vendor"
            ? "vendor"
            : "customer"
    );

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = "Please enter your full name";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone =
                "Please enter a valid 10-digit phone number";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password =
                "Password must contain at least 8 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password";
        } else if (
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match";
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms =
                "Please accept the Terms and Privacy Policy";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        /*
          BACKEND INTEGRATION
    
          Later connect this form to your Node.js/Express API.
    
          Example:
    
          const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: accountType,
              }),
            }
          );
    
          const data = await response.json();
        */

        // Temporary demo delay
        setTimeout(() => {
            setIsLoading(false);

            navigate("/login");
        }, 900);
    };

    const handleAccountTypeChange = (type) => {
        setAccountType(type);
        setErrors({});
    };

    return (
        <div className="signup-page">

            {/* ── LEFT VISUAL PANEL ── */}
            <div className="signup-visual">

                {/* Brand */}
                <Link to="/" className="signup-visual-brand">
                    <span className="signup-visual-brand-icon">R</span>
                    RentSphere
                </Link>

                {/* Body copy */}
                <div className="signup-visual-body">

                    <h2>
                        Join the<br />
                        <span>marketplace.</span>
                    </h2>

                    <p>
                        Create your RentSphere account and start renting
                        products or earn income by listing your own items.
                    </p>

                    <div className="signup-visual-features">

                        <div className="signup-visual-feature">
                            <span className="signup-visual-feature-dot"></span>
                            Rent from 850+ verified products
                        </div>

                        <div className="signup-visual-feature">
                            <span className="signup-visual-feature-dot"></span>
                            List your items and earn income
                        </div>

                        <div className="signup-visual-feature">
                            <span className="signup-visual-feature-dot"></span>
                            Secure payments & 24/7 support
                        </div>

                        <div className="signup-visual-feature">
                            <span className="signup-visual-feature-dot"></span>
                            Trusted by 10,000+ customers
                        </div>

                    </div>

                </div>

                {/* Floating cards */}
                <div className="signup-float-card signup-float-one">
                    <div className="signup-float-card-icon">🚀</div>
                    <div className="signup-float-card-text">
                        <strong>Get Started Free</strong>
                        <span>No credit card needed</span>
                    </div>
                </div>

                <div className="signup-float-card signup-float-two">
                    <div className="signup-float-card-icon">🛡️</div>
                    <div className="signup-float-card-text">
                        <strong>Secure & Private</strong>
                        <span>Your data stays safe</span>
                    </div>
                </div>

            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div className="signup-form-panel">

                <div className="signup-card">

                    {/* Brand (mobile only) */}
                    <div className="signup-brand">

                        <Link to="/" className="signup-brand-link">

                            <span className="signup-brand-icon">R</span>

                            <span>RentSphere</span>

                        </Link>

                    </div>

                    {/* Header */}
                    <div className="signup-header">

                        <h1>Create Your Account</h1>

                        <p>Join RentSphere and start renting today</p>

                    </div>

                    {/* Account Type Tabs */}
                    <div className="signup-tabs">

                        <button
                            type="button"
                            className={`signup-tab ${accountType === "customer" ? "active" : ""
                                }`}
                            onClick={() =>
                                handleAccountTypeChange("customer")
                            }
                        >
                            Customer Account
                        </button>

                        <button
                            type="button"
                            className={`signup-tab ${accountType === "vendor" ? "active" : ""
                                }`}
                            onClick={() =>
                                handleAccountTypeChange("vendor")
                            }
                        >
                            Vendor Account
                        </button>

                    </div>

                    {/* Form */}
                    <form
                        className="signup-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* FULL NAME */}
                        <div className="signup-form-group">

                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                className={
                                    errors.fullName ? "signup-input-error" : ""
                                }
                            />

                            {errors.fullName && (
                                <span className="signup-field-error">
                                    {errors.fullName}
                                </span>
                            )}

                        </div>

                        {/* EMAIL */}
                        <div className="signup-form-group">

                            <label htmlFor="signupEmail">
                                Email Address
                            </label>

                            <input
                                id="signupEmail"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className={
                                    errors.email ? "signup-input-error" : ""
                                }
                            />

                            {errors.email && (
                                <span className="signup-field-error">
                                    {errors.email}
                                </span>
                            )}

                        </div>

                        {/* PHONE */}
                        <div className="signup-form-group">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <div className="phone-input-wrapper">

                                <span className="phone-prefix">
                                    +91
                                </span>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                    autoComplete="tel"
                                    className={
                                        errors.phone ? "signup-input-error" : ""
                                    }
                                />

                            </div>

                            {errors.phone && (
                                <span className="signup-field-error">
                                    {errors.phone}
                                </span>
                            )}

                        </div>

                        {/* PASSWORD */}
                        <div className="signup-form-group">

                            <label htmlFor="signupPassword">
                                Password
                            </label>

                            <div className="signup-password-wrapper">

                                <input
                                    id="signupPassword"
                                    type={
                                        showPassword ? "text" : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    className={
                                        errors.password
                                            ? "signup-input-error"
                                            : ""
                                    }
                                />

                                <button
                                    type="button"
                                    className="signup-password-toggle"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                            <span className="password-hint">
                                Use at least 8 characters
                            </span>

                            {errors.password && (
                                <span className="signup-field-error">
                                    {errors.password}
                                </span>
                            )}

                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="signup-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="signup-password-wrapper">

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    className={
                                        errors.confirmPassword
                                            ? "signup-input-error"
                                            : ""
                                    }
                                />

                                <button
                                    type="button"
                                    className="signup-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (prev) => !prev
                                        )
                                    }
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                            {errors.confirmPassword && (
                                <span className="signup-field-error">
                                    {errors.confirmPassword}
                                </span>
                            )}

                        </div>

                        {/* TERMS */}
                        <label className="terms-label">

                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                            />

                            <span className="terms-checkbox"></span>

                            <span className="terms-text">
                                I agree to the{" "}
                                <Link to="/terms">
                                    Terms of Use
                                </Link>{" "}
                                and{" "}
                                <Link to="/privacy">
                                    Privacy Policy
                                </Link>
                            </span>

                        </label>

                        {errors.agreeTerms && (
                            <span className="signup-field-error terms-error">
                                {errors.agreeTerms}
                            </span>
                        )}

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="signup-submit"
                            disabled={isLoading}
                        >

                            {isLoading ? (
                                <span className="signup-loader">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            ) : (
                                "Create Account"
                            )}

                        </button>

                    </form>

                    {/* LOGIN */}
                    <div className="signup-login">

                        <span>Already have an account?</span>

                        <Link
                            to={`/login?type=${accountType}`}
                        >
                            Sign In
                        </Link>

                    </div>

                    {/* BACK */}
                    <Link to="/" className="signup-back-home">
                        ← Back to home
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default Signup;