from django.urls import path
from .views import (
    UserListCreateView, UserRetrieveUpdateDestroyView, RegisterView, CustomLoginView,
    CompanyListCreateView, CompanyRetrieveUpdateDestroyView, JobCategoryListCreateView, JobCategoryRetrieveUpdateDestroyView,
    JobListingListCreateView, JobListingRetrieveUpdateDestroyView,
    SkillListCreateView, SkillRetrieveUpdateDestroyView,
    ResumeListCreateView, ResumeRetrieveUpdateDestroyView, my_resume, ResumeSkillListCreateView, ResumeSkillRetrieveUpdateDestroyView,
    ApplicationListCreateView, ApplicationRetrieveUpdateDestroyView,
    CustomAuthToken, recommended_jobs,
    CurrentUserView, CustomUserUpdateView, PasswordResetRequestView,
    PasswordResetConfirmView, my_company,
    ChatbotMessageAPIView,
    ChatbotQueryListCreateAPIView,
    ChatbotQueryRetrieveUpdateDestroyAPIView, JobSeekerListView, CandidateSearchView, JobListingSearchView, UserProfileView,
    upload_certificates, delete_certificate, resume_by_user, CandidateDetailView,    JobOfferCreateView, JobOfferListView, JobOfferRetrieveView, JobOfferRespondView, GlobalSearchView,  CandidateListView, NotificationListView, NotificationUpdateView
)

urlpatterns = [
    #  User Routes
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/me/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('custom-user/', CurrentUserView.as_view(), name='custom-user'),
    path('custom-user/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='custom-user-detail'),
    # ✅ Auth Routes
    path('register/', RegisterView.as_view(), name='register'),
    path('custom-login/', CustomLoginView.as_view(), name='custom_login'),
    path('update-profile/', CustomUserUpdateView.as_view(), name='update-user'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    #Candidate 
     path('candidates/', CandidateListView.as_view(), name='candidate-list'),

    #  Company Routes
    path('companies/', CompanyListCreateView.as_view(), name='company-list'),
    path('companies/<int:pk>/', CompanyRetrieveUpdateDestroyView.as_view(), name='company-detail'),
    path('companies/my-company/', my_company, name='my-company'),

    #  Job Category Routes
    path('job-categories/', JobCategoryListCreateView.as_view(), name='job-category-list'),
    path('job-categories/<int:pk>/', JobCategoryRetrieveUpdateDestroyView.as_view(), name='job-category-detail'),

    #  Job Listing Routes
    path('job-listings/', JobListingListCreateView.as_view(), name='job-listing-list'),
    path('job-listings/<int:pk>/', JobListingRetrieveUpdateDestroyView.as_view(), name='job-listing-detail'),

    #  Skill Routes
    path('skills/', SkillListCreateView.as_view(), name='skill-list'),
    path('skills/<int:pk>/', SkillRetrieveUpdateDestroyView.as_view(), name='skill-detail'),

    #  Resume Routes
    path('resumes/', ResumeListCreateView.as_view(), name='resume-list'),
    path('resumes/<int:pk>/', ResumeRetrieveUpdateDestroyView.as_view(), name='resume-detail'),
    path('resumes/my/', my_resume, name='my-resume'),
    

    #  Resume Skill Routes
    path('resume-skills/', ResumeSkillListCreateView.as_view(), name='resume-skill-list'),
    path('resume-skills/<int:pk>/', ResumeSkillRetrieveUpdateDestroyView.as_view(), name='resume-skill-detail'),

    #  Application Routes
    path('applications/', ApplicationListCreateView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationRetrieveUpdateDestroyView.as_view(), name='application-detail'),


    #  Chatbot Routes
    path('chatbot/message/', ChatbotMessageAPIView.as_view(), name='chatbot-message'),
    path('chatbot/history/', ChatbotQueryListCreateAPIView.as_view(), name='chatbot-history'),
    path('chatbot/history/<int:pk>/', ChatbotQueryRetrieveUpdateDestroyAPIView.as_view(), name='chatbot-detail'),

    #  Token Auth
    path('api-token-auth/', CustomAuthToken.as_view(), name='api-token-auth'),

    #  Recommendations
    path('recommended-jobs/', recommended_jobs, name='recommended-jobs'),

    #  Profile
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('candidates/', JobSeekerListView.as_view(), name='jobseeker-list'),
    path('candidates/search/', CandidateSearchView.as_view(), name='candidate-search'),
    path('job-listings/search/', JobListingSearchView.as_view(), name='job-search'),

    #  Certificates (Function-based views - no as_view())
    path('resumes/my/certificates/', upload_certificates, name='upload_certificates'),
    path('resumes/certificates/<int:pk>/', delete_certificate, name='delete_certificate'),
 #CandidateProfiel&resume
path('candidates/<int:pk>/', CandidateDetailView.as_view(), name='candidate-detail'),
path('resumes/by-user/<int:user_id>/', resume_by_user, name='resume-by-user'),

   #Offer Job
    path('offer-job/', JobOfferCreateView.as_view(), name='offer-job'),
    path('offers/', JobOfferListView.as_view(), name='offers-list'),
   path('offers/<int:pk>/', JobOfferRetrieveView.as_view(), name='offer-detail'),

    path('offers/<int:pk>/respond/', JobOfferRespondView.as_view(), name='offer-respond'),

    # Search
    path('global-search/', GlobalSearchView.as_view(), name='global-search'),
    #Notification
 path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<int:pk>/', NotificationUpdateView.as_view(), name='notification-update'),
    
]
