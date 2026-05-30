import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfile from './pages/UserProfile';
import Dashboard from './pages/Dashboard';
import JobRecommendationPage from './pages/JobRecommendationPage';
import FeedbackPage from './pages/FeedbackPage';
import ChatbotQueryPage from './pages/ChatbotQueryPage';
import RecommendationDetailPage from './pages/RecommendationDetailPage';
import ApplicationHistoryPage from './pages/ApplicationHistoryPage';
import PostJobPage from './pages/PostJobPage';
import JobListingsPage from './pages/JobListingsPage';
import CreateResumePage from './pages/CreateResumePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CompanyPage from './pages/CompanyPage';
import ProtectedRoute from './components/ProtectedRoute';
import JobDetailPage from './pages/JobDetailPage';
import ApplyPage from './pages/ApplyPage';
import AlreadyAppliedPage from './pages/AlreadyAppliedPage';
import EmployerCandidatesPage from './pages/EmployerCandidatesPage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import CandidateProfileAndResumePage from "./pages/CandidateProfileAndResumePage";
import LandingPage from "./pages/LandingPage";
import CandidateOffersPage from "./pages/CandidateOffersPage";
import EmployerOffersPage from "./pages/EmployerOffersPage";
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id"
          element={
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <JobRecommendationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendation-detail/:id"
          element={
            <ProtectedRoute>
              <RecommendationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotQueryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application-history"
          element={
            <ProtectedRoute>
              <ApplicationHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-listings"
          element={
            <ProtectedRoute>
              <JobListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-resume"
          element={
            <ProtectedRoute>
              <CreateResumePage />
            </ProtectedRoute>
          }
        />

        <Route path="/apply/:id" element={<ApplyPage />} />
        <Route
          path="/job/:id"
          element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/already-applied" element={<AlreadyAppliedPage />} />

        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <EmployerCandidatesPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile/:id" 
          element={
            <ProtectedRoute>
              <ProfileDetailPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
  path="/candidates/:id"
  element={
    <ProtectedRoute>
      <CandidateProfileAndResumePage />
    </ProtectedRoute>
  }
/>


        <Route path="/employer/candidates" element={<EmployerCandidatesPage />} />
        
        <Route path="/candidate-offers" element={<CandidateOffersPage />} />

        <Route path="/offers" element={<CandidateOffersPage />} />
        
        <Route path="/employer/offers" element={<EmployerOffersPage />} />
        
       <Route path="/search" element={<SearchPage />} />
       
      </Routes>
    </Router>
  );
}

export default App;
