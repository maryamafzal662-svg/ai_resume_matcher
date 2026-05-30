from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db.models import Q, Prefetch 
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import JsonResponse




from .models import (
     Company, Skill, Resume, ResumeSkill,
    JobCategory, JobListing, Application, 
    Recommendation, ChatbotQuery, CustomUser, Certificate, JobOffer,  Notification
)

from .serializers import (
    UserSerializer, CompanySerializer, SkillSerializer, ResumeSerializer, ResumeSkillSerializer,
    JobCategorySerializer, JobListingSerializer, ApplicationSerializer, 
    RecommendationSerializer, ChatbotQuerySerializer, CustomUserSerializer, JobOfferSerializer, CandidateSerializer, NotificationSerializer
)

from .permissions import (
    IsJobSeekerOrReadOnly, IsJobSeekerAuthenticated, IsOwnerOrAdminOrReadOnly,
    IsAdminOrReadOnly, IsEmployer, IsAdminOrEmployerOwner,
    IsJobSeekerForResumeSkill, IsResumeOwnerOrAdmin,
    IsAdminOrEmployerOwnerOrReadOnly, IsEmployerOrAdmin
)

User = get_user_model()

# ------------------ User Views ------------------
class CustomUserUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) 

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


# ✅ User list and registration
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()


# ✅ Retrieve / Update / Delete current user
class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ✅ Registration View (CSRF exempted for testing or APIs)
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = (MultiPartParser, FormParser, JSONParser)  # <-- JSONParser add

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)



# ✅  CustomLoginView 
@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)

        user = authenticate(request, email=email, password=password)



        if user is None:
            return Response({'error': 'Wrong email or password'}, status=401)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                
            }
        })
    
    
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Reset Your Password",
            message=f"Click the link below to reset your password:\n{reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return Response({"message": "Reset link sent to your email."})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid link'}, status=400)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'})
        else:
            return Response({'error': 'Invalid token'}, status=400)



class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    def patch(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# ------------------ User Profile View ------------------
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] 

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.get_full_name(),
            "role": getattr(user, 'role', None),  
            "profile_image": request.build_absolute_uri(user.profile_image.url) if user.profile_image else None
        })

    def patch(self, request):
        user = request.user
        if "profile_image" in request.FILES:
            user.profile_image = request.FILES["profile_image"]
            user.save()
            return Response({
                "message": "Profile image updated successfully",
                "profile_image": request.build_absolute_uri(user.profile_image.url)
            })
        return Response({"error": "No image provided"}, status=400)


# CandidateListView here
class CandidateListView(generics.ListAPIView):
    queryset = CustomUser.objects.filter(role='jobseeker')
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]


# ✅ View for employer to see all jobseekers
class JobSeekerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Optionally ensure only employers can access
        if request.user.role != 'employer':
            return Response({'error': 'Only employers can view this list'}, status=403)

        job_seekers = CustomUser.objects.filter(role='jobseeker')
        serializer = CustomUserSerializer(job_seekers, many=True)
        return Response(serializer.data)



# For Employers: Search Candidates
class CandidateSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'employer':
            return Response({"error": "Only employers can search candidates"}, status=403)

        query = request.GET.get('search', '').strip()
        candidates = CustomUser.objects.filter(role='jobseeker')

        if query:
            candidates = candidates.filter(
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(location__icontains=query) |
                Q(bio__icontains=query) |
                Q(resumes__profession__icontains=query) |
                Q(resumes__skills__name__icontains=query)
            ).distinct()

        serializer = CustomUserSerializer(candidates[:10], many=True)  # limit 10 suggestions
        return Response(serializer.data)


# For Jobseekers: Search Jobs
class JobListingSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('search', '').strip()
        jobs = JobListing.objects.all()

        if query:
            jobs = jobs.filter(
                Q(title__icontains=query) |
                Q(company__name__icontains=query) |
                Q(description__icontains=query) |
                Q(requirements__icontains=query) |
                Q(location__icontains=query) |
                Q(skills__name__icontains=query)
            ).distinct()

        serializer = JobListingSerializer(jobs[:10], many=True)  # limit 10 suggestions
        return Response(serializer.data)


# Global Search (Jobseeker ↔ Employer)
class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('search', '').strip()
        results = []
        user = request.user

        if user.role == 'employer':
            # Employer searches candidates
            resumes_prefetch = Prefetch('resumes', queryset=Resume.objects.prefetch_related('skills'))
            candidates = CustomUser.objects.filter(role='jobseeker').prefetch_related(resumes_prefetch)

            if query:
                candidates = candidates.filter(
                    Q(username__icontains=query) |
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(location__icontains=query) |
                    Q(bio__icontains=query) |
                    Q(resumes__profession__icontains=query) |
                    Q(resumes__skills__name__icontains=query)
                ).distinct()

            for c in candidates[:30]:
                resume = c.resumes.first() if c.resumes.exists() else None
                skills_list = [s.name for s in resume.skills.all()] if resume else []
                results.append({
                    "id": c.id,
                    "name": c.get_full_name() or c.username,
                    "location": c.location or "",
                    "type": "candidate",
                    "extra": f"{(resume.profession if resume else '')}{' | ' + ', '.join(skills_list) if skills_list else ''}"
                })

        elif user.role == 'jobseeker':
            # Jobseeker searches jobs
            jobs = JobListing.objects.select_related('company').prefetch_related('skills').all()
            if query:
                jobs = jobs.filter(
                    Q(title__icontains=query) |
                    Q(company__name__icontains=query) |
                    Q(description__icontains=query) |
                    Q(location__icontains=query) |
                    Q(skills__name__icontains=query)
                ).distinct()
            for j in jobs[:30]:
                results.append({
                    "id": j.id,
                    "name": j.title,
                    "location": j.location or "",
                    "type": "job",
                    "extra": j.company.name if j.company else ""
                })

            # Jobseeker searches companies
            companies = Company.objects.all()
            if query:
                companies = companies.filter(
                    Q(name__icontains=query) |
                    Q(description__icontains=query) |
                    Q(location__icontains=query)
                ).distinct()
            for comp in companies[:20]:
                results.append({
                    "id": comp.id,
                    "name": comp.name,
                    "location": comp.location or "",
                    "type": "company",
                    "extra": ""
                })

        return Response(results)



#--------------Candidate Profile for ApplicationHistory----------

class CandidateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            candidate = CustomUser.objects.get(pk=pk, role='jobseeker')
        except CustomUser.DoesNotExist:
            return Response({"error": "Candidate not found"}, status=404)

        serializer = CustomUserSerializer(candidate)
        return Response(serializer.data)


#---------------Candidate Resume for Application Hisotry
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resume_by_user(request, user_id):
    try:
        resume = Resume.objects.get(user_id=user_id)
    except Resume.DoesNotExist:
        return Response({"detail": "Resume not found"}, status=404)

    serializer = ResumeSerializer(resume, context={'request': request})
    return Response(serializer.data)

    
# ------------------ Company Views ------------------
class CompanyListCreateView(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsEmployer]

class CompanyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsAdminOrEmployerOwner]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_company(request):
    try:
        company = Company.objects.get(owner=request.user)
        serializer = CompanySerializer(company)
        return Response(serializer.data)
    except Company.DoesNotExist:
        # Change: send empty data with 200 instead of 404
        return Response(None, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=500)



# ------------------ JobCategory Views ------------------
class JobCategoryListCreateView(generics.ListCreateAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class JobCategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

# ------------------ JobListing Views ------------------
class JobListingListCreateView(generics.ListCreateAPIView):
    serializer_class = JobListingSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEmployerOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        
        # ✅ Superuser ko sab show
        if user.is_superuser:
            return JobListing.objects.all()

        # ✅ Jobseeker ko sari jobs show
        if hasattr(user, 'role') and str(user.role).lower() == 'jobseeker':
            return JobListing.objects.all()

        # ✅ Employer ko sirf unki jobs show
        return JobListing.objects.filter(company__owner=user)

    def perform_create(self, serializer):
        serializer.save()


class JobListingRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobListing.objects.all()
    serializer_class = JobListingSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEmployerOwnerOrReadOnly]




#---------------Recommended Jobs View------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_jobs(request):
    user = request.user

    # 1. Latest resume
    resume = Resume.objects.filter(user=user).prefetch_related('skills').order_by('-uploaded_at').first()
    if not resume:
        return Response([], status=200)

    # 2. User skills
    user_skills = set(resume.skills.values_list('id', flat=True))
    if not user_skills:
        return Response([], status=200)

    # 3. All jobs
    jobs = JobListing.objects.all().select_related('company').prefetch_related('skills')
    recommendations = []

    for job in jobs:
        job_skills = set(job.skills.values_list('id', flat=True))
        if not job_skills:
            continue

        matched_skills = user_skills.intersection(job_skills)
        if matched_skills:
            score = int((len(matched_skills) / len(job_skills)) * 100)
            matched_names = list(Skill.objects.filter(id__in=matched_skills).values_list('name', flat=True))

            # ✅ Check if user has applied to this job
            has_applied = Application.objects.filter(user=user, job=job).exists()

            recommendations.append({
                "id": job.id,
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "company_name": job.company.name if job.company else "N/A",
                    "location": job.location or "Not specified",
                    "has_applied": has_applied,  # ✅ Added here
                },
                "match_score": score,
                "reason": f"Matched {len(matched_skills)} of {len(job_skills)} required skills: {', '.join(matched_names)}",
            })

    # 4. Sort (highest match first)
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)

    return Response(recommendations, status=200)

 
# ------------------ Skill Views ------------------

class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated, IsJobSeekerOrReadOnly]

class SkillRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated, IsJobSeekerOrReadOnly]


#--------Certificate View---------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_certificates(request):
    try:
        resume = Resume.objects.get(user=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=404)

    files = request.FILES.getlist('certificates')
    if not files:
        return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    created_certs = []
    for f in files:
        cert = Certificate.objects.create(resume=resume, file=f)
        created_certs.append({
            "id": cert.id,
            "file": cert.file.url,
            "uploaded_at": cert.uploaded_at.isoformat(),
        })

    return Response(created_certs, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_certificate(request, pk):
    try:
        cert = Certificate.objects.get(id=pk, resume__user=request.user)
    except Certificate.DoesNotExist:
        return Response({"detail": "Certificate not found."}, status=status.HTTP_404_NOT_FOUND)

    cert.delete()
    return Response({"detail": "Certificate deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# ------------------ Resume Views ------------------

class ResumeListCreateView(generics.ListCreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsJobSeekerAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def my_resume(request):
    try:
        resume = Resume.objects.filter(user=request.user).first()
        if not resume:
            return Response({"detail": "Resume not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"detail": f"Server error: {str(e)}"}, status=500)

    if request.method == 'GET':
        try:
            serializer = ResumeSerializer(resume, context={'request': request})
            return Response(serializer.data, status=200)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"detail": f"Serialization error: {str(e)}"}, status=500)

    elif request.method == 'PATCH':
        serializer = ResumeSerializer(resume, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        resume.delete()
        return Response(status=204)



class ResumeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdminOrReadOnly]

    def get_serializer_context(self):
        return {'request': self.request}

# ------------------ ResumeSkill Views ------------------

class ResumeSkillListCreateView(generics.ListCreateAPIView):
    queryset = ResumeSkill.objects.all()
    serializer_class = ResumeSkillSerializer
    permission_classes = [IsAuthenticated, IsJobSeekerForResumeSkill]

class ResumeSkillRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ResumeSkill.objects.all()
    serializer_class = ResumeSkillSerializer
    permission_classes = [IsAuthenticated, IsResumeOwnerOrAdmin]


# ------------------ Application Views ------------------

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'role') and str(user.role).lower() == 'employer':
            return Application.objects.filter(
                job__company__owner=user
            ).select_related('job', 'resume', 'user', 'job__company__owner')

        if hasattr(user, 'role') and str(user.role).lower() == 'jobseeker':
            return Application.objects.filter(
                user=user
            ).select_related('job', 'resume', 'user', 'job__company__owner')

        return Application.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        job = serializer.validated_data['job']

        if Application.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("You have already applied for this job.")

        try:
            resume = Resume.objects.get(user=user)
        except Resume.DoesNotExist:
            raise ValidationError({"detail": "Resume not found for this user."})

        application = serializer.save(user=user, resume=resume, status='pending')

        resume_skills = set(resume.skills.values_list('id', flat=True))
        job_skills = set(application.job.skills.values_list('id', flat=True))
        matched_skills = resume_skills.intersection(job_skills)
        score = (len(matched_skills) / len(job_skills) * 100) if job_skills else 0
        # store score if needed


class ApplicationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsEmployerOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ Only job owner or admin can update
        if request.user != instance.job.company.owner and not request.user.is_superuser:
            return Response({"error": "You don't have permission to update this application."}, status=403)

        status_value = request.data.get('status')
        if status_value not in ['pending', 'accepted', 'rejected']:
            return Response({"error": "Invalid status value."}, status=400)

        # ✅ Smooth status update
        instance.status = status_value
        instance.save(update_fields=['status'])

        return Response({"id": instance.id, "status": instance.status}, status=200)

    

   
   # ------------- Offer Job View -------------

# ✅ Create offer (employer -> candidate)
class JobOfferCreateView(generics.CreateAPIView):
    serializer_class = JobOfferSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if getattr(request.user, 'role', '').lower() != 'employer' and not request.user.is_superuser:
            return Response({"error": "Only employers can send job offers."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# ✅ List offers (employer -> sent, candidate -> received)
class JobOfferListView(generics.ListAPIView):
    serializer_class = JobOfferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '').lower() == 'employer':
            return JobOffer.objects.filter(employer=user).select_related(
                'candidate', 'employer'
            ).prefetch_related(
                'skills'
            ).order_by('-created_at')
        else:
            return JobOffer.objects.filter(candidate=user).select_related(
                'candidate', 'employer'
            ).prefetch_related(
                'skills'
            ).order_by('-created_at')


# ✅ Offer detail
class JobOfferRetrieveView(generics.RetrieveAPIView):
    queryset = JobOffer.objects.all()
    serializer_class = JobOfferSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        offer = self.get_object()
        if request.user != offer.candidate and request.user != offer.employer and not request.user.is_superuser:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(offer, context={'request': request})
        return Response(serializer.data)


# ✅ Candidate responds (accept/reject)
class JobOfferRespondView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            offer = JobOffer.objects.get(pk=pk)
        except JobOffer.DoesNotExist:
            return Response({"error": "Offer not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != offer.candidate:
            return Response({"error": "Only candidate can respond."}, status=status.HTTP_403_FORBIDDEN)

        status_value = request.data.get('status')
        if status_value not in ['accepted', 'rejected']:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        offer.status = status_value
        offer.responded_at = timezone.now()
        offer.save()
        serializer = JobOfferSerializer(offer, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)





# ------------------ ChatbotQuery Views ------------------

class ChatbotMessageAPIView(APIView):
    authentication_classes = []  # Public
    permission_classes = []      # No auth required

    def post(self, request):
        # Get user message & role
        user_message = request.data.get('message', '').strip()
        role = request.data.get('role', '').strip().lower()  # "jobseeker" or "employer"

        if not user_message:
            return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # ---------------- JOBSEEKER RULES (with synonyms) ----------------
        rules_jobseeker = {
            # --- Website Intro ---
            ("website", "site", "platform", "about", "introduction", "intro", "how website works",
            "what is this website", "tell me about website", "guide", "help", "how to use", "how it works",
            "explain portal", "explain system", "tell me site intro", "help", "how to use"):
                "Welcome to the AI Job Matching Portal! As a jobseeker, you can create your resume, get smart job recommendations, browse jobs, apply with a cover letter, and track your application status directly from the Application.",

            # --- Profile ---
            ("profile", "my profile", "show profile", "view profile", "check profile", "profile info", 
             "account details", "account info", "see my details", "profile section"):
                "Your profile shows your basic details such as username, email, phone, role, and join date. You can edit it anytime by clicking 'Edit Profile'.",

            ("edit profile", "update profile", "change profile", "modify profile", "update account", "change info", 
             "edit account", "modify account details"):
                "To edit your profile, go to Dashboard → Profile → Click 'Edit Profile' button.",

            # --- Resume ---
            ("resume", "cv", "my resume", "show resume", "view resume", "display resume", "my cv", "cv info"):
                "You can create, edit, or delete your resume in the 'My Resume' section of your dashboard.",

            ("create resume", "add resume", "make resume", "build resume", "create cv", "add cv", "make cv", "build cv"):
                "Go to My Resume → Click 'Create Resume' → Fill in Education, Experience, and Skills → Click 'Save'.",

            ("update resume", "edit resume", "change resume", "modify resume", "update cv", "edit cv", "change cv", "modify cv"):
                "Go to My Resume → Click 'Edit' → Make changes → Click 'Update Resume'.",

            ("delete resume", "remove resume", "erase resume", "delete cv", "remove cv", "erase cv"):
                "Go to My Resume → Click 'Delete' to remove your existing resume.",

            # --- Jobs ---
            ("jobs", "browse jobs", "job listings", "find jobs", "job search", "explore jobs", "available jobs", "job list"):
                "Go to 'Jobs' in the navbar or click 'View Job Listings' on your dashboard to browse all jobs.",

            ("apply", "apply job", "apply now", "job apply", "submit application", "how to apply", "send application"):
                "Go to Job Listings → Click 'View Details' → Then click 'Apply Now' → Add cover letter → Submit Application.",

            # --- Recommendations ---
            ("recommendations", "recommended jobs", "suggested jobs", "job recommendations", "matching jobs", "smart jobs"):
                "Smart job suggestions are shown in the 'Recommendations' section based on your resume and skills.",

            # --- Applications ---
            ("applications", "my applications", "submitted jobs", "applied jobs", "job applications", "applications list"):
                "Go to the Applications section to see all jobs you have applied for.",

            ("application status", "status", "check status", "job status", "application result"):
                "In the Applications section, you can check whether your job application is accepted or rejected.",

            # --- Navigation ---
            ("dashboard", "home", "main page", "control panel", "user dashboard"):
                "Your dashboard shows your profile, resume, recommendations, and recent applications at a glance.",

            ("logout", "sign out", "log out", "exit", "end session"):
                "Click 'Logout' in the navbar to safely log out of your account.",
        }

        # ---------------- EMPLOYER RULES (with synonyms) ----------------
        rules_employer = {
            # --- Website Intro ---
            ("website", "site", "platform", "about", "introduction", "intro", "how website works", 
             "what is this website", "tell me about website", "guide", "help", "how to use", "employer intro", "employer guide"):
                "Welcome to the AI Job Matching Portal for Employers! Here, you can create your company profile, post jobs, "
                "view applicants, check resumes, and accept or reject applications. The dashboard gives you a summary of "
                "your profile, company, job postings, and applications.",

            # --- Profile ---
            ("profile", "my profile", "show profile", "view profile", "check profile", "profile info", 
             "account details", "account info", "see my details", "profile section"):
                "Your profile shows your username, email, phone, role, and joined date. You can edit it by clicking 'Edit Profile'.",

            ("edit profile", "update profile", "change profile", "modify profile", "update account", "change info", 
             "edit account", "modify account details"):
                "To edit your profile, go to Dashboard → Profile → Click 'Edit Profile' button.",

            ("delete company", "remove company", "erase company", "delete organization", "remove organization"):
             "Go to My Company → Click 'Delete' to remove your company profile. You can create a new one later if needed.",


        # --- Job Posting ---
        ("post job", "add job", "create job", "job posting", "post new job", "make job", "submit job"):
        "Go to Post Job → Fill in job title, description, location, salary, expiry date, category, and skills → Click 'Submit Job'.",
 
      ("job management", "manage jobs", "job list", "view jobs", "posted jobs", "job board",
      "my jobs", "employer jobs"):
       "In Job Management, you can view all your posted jobs with details such as title, location, salary, and expiry date.",

       ("edit job", "update job", "modify job", "change job posting", "update vacancy"):
     "Go to Job Management → Select the job → Edit details → Save Changes.",


      ("delete job", "remove job", "erase job", "cancel job posting", "delete vacancy"):
      "Go to Job Management → Select the job → Click 'Delete' to remove it.",


      # --- Applications & Candidates ---
     ("applications", "view applications", "job applications", "candidates", "applicants",
      "submitted applications", "job seekers", "applied candidates"):
      "Go to the Applications section to see all candidates who applied for your jobs.",


    ("accept application", "approve application", "hire", "accept candidate", "select candidate",
    "application approve"):
    "In Applications → Review the candidate's resume → Click 'Accept' to approve the application.",


    ("reject application", "decline application", "reject candidate", "not hire", "reject job seeker",
    "application reject"):
    "In Applications → Review the candidate's resume → Click 'Reject' to decline the application.",


     ("candidate resume", "view resume", "check resume", "applicant cv", "review resume", "see cv",
     "candidate cv"):
     "In Applications → Select a candidate to view their resume and profile details.",


     # --- Hiring ---
    ("hiring", "hire", "recruit", "recruitment", "recruit candidates", "start hiring",
    "select candidates", "hiring process"):
     "To hire: Create your company profile → Post jobs → Review applications → Accept suitable candidates.",


     # --- Notifications ---
    ("notifications", "alerts", "updates", "messages", "my notifications"):
    "Click the bell icon on the navbar to see all your employer notifications, including new applications.",


    # --- Navigation ---
       ("dashboard", "home", "main page", "control panel", "employer dashboard"):
      "Your dashboard shows your profile, company details, job postings, and applications summary.",


      ("logout", "sign out", "log out", "exit", "end session", "leave account"):
     "Click 'Logout' in the navbar to safely sign out of your employer account.",
      }
        # Select rules based on role
        rules = rules_employer if role == "employer" else rules_jobseeker

        # Normalize user message
        user_message_lower = user_message.lower()

        # Find matching response
        reply = "Sorry, I didn’t understand that. Please try again."
        for keywords, response in rules.items():
            for keyword in keywords:
                if keyword in user_message_lower:
                    reply = response
                    break
            if reply != "Sorry, I didn’t understand that. Please try again.":
                break

        return Response({'user': user_message, 'bot': reply}, status=status.HTTP_200_OK)



class ChatbotQueryListCreateAPIView(generics.ListCreateAPIView):
    queryset = ChatbotQuery.objects.all().order_by('-id')
    serializer_class = ChatbotQuerySerializer


class ChatbotQueryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatbotQuery.objects.all()
    serializer_class = ChatbotQuerySerializer




# ------------------ Custom Token Auth ------------------

class CustomAuthToken(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email aur password dono required hain"}, status=400)

        user = authenticate(username=email, password=password)  # Works only if email is username

        if not user:
            return Response({"error": "Invalid email or password"}, status=401)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': getattr(user, 'role', None)  # optional
            }
        })
    


    
# -------------Notification View----------
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


#  Update notification read/unread status
class NotificationUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = request.data.get('is_read', notification.is_read)
        notification.save()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)