// src/pages/AlreadyAppliedPage.js

import React from 'react';
import Navbar from '../components/Navbar';

const AlreadyAppliedPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="alert alert-warning shadow">
          <h4>⚠️ You’ve Already Applied</h4>
          <p>Our system shows you have already applied for this job. Please wait for the employer to review your application.</p>
        </div>
      </div>
    </>
  );
};

export default AlreadyAppliedPage;
