import React, { useState, useContext } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Step 1: basic signup data
    if (currState === "Sign Up" && !isDataSubmitted) {
      if (fullName && email && password) {
        setIsDataSubmitted(true); // move to Bio step
        return;
      }
    }

    // Step 2: Final Sign Up or Login
    const state = currState === "Sign Up" ? "signup" : "login";

    login(state, {
      fullName,
      email,
      password,
      bio,
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* Left logo */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />

      {/* Right form */}
      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
              onClick={() => setIsDataSubmitted(false)}
              title="Back to signup"
            />
          )}
        </h2>

        {/* Full Name for Sign Up */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        {/* Email & Password */}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <input
              type="password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </>
        )}

        {/* Bio field after Step 1 of Sign Up */}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            rows={4}
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Provide a Short Bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          ></textarea>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign Up"
            ? isDataSubmitted
              ? "Finish Sign Up"
              : "Create Account"
            : "Login Now"}
        </button>

        {/* Checkbox */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        {/* Switch between Sign Up / Login */}
        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already Have An Account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login Here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create An Account{" "}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click Here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
