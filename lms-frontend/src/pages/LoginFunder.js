import React from "react";
import '../styles.css';


const LoginFunder = () => (
  <div className="container">
    <div className="card">
      <img
        src="/logo.png"
        alt="G.A.S Logo"
        className="h-12 mx-auto mb-4"
      />

      <h2 className="fas fa-chalkboard-teacher icon">Funder / Investor Login</h2>
      
      <form>
        <div className="mb-4">
          <label htmlFor="username">  Username </label>
          <input
            className="input"
            id="username"
            type="text"
            placeholder="Username"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password"> Password </label>
          <input
            className="input"
            id="password"
            type="password"
            placeholder="Password"
          />
        </div>

        <button className="button"  type="button">
          Login
        </button>

        <button
          className="text-blue-500 hover:text-blue-700 text-sm mt-4 block mx-auto"
          type="button"
          onClick={() => console.log("Forgot password clicked")}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  </div>
);

export default LoginFunder;
