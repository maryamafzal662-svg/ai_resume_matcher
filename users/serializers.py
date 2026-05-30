from rest_framework import serializers
from .models import (
    CustomUser, Company, Skill, Resume, ResumeSkill,
    JobCategory, JobListing, Application,
    Recommendation, ChatbotQuery, Certificate,  JobOffer, Notification
)
import re


#  CustomUserSerializer 
class CustomUserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role','password','phone', 'location', 'profile_image', 'bio', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)
        if password:
            user.set_password(password)  
        user.save()
        return user


class UserSerializer(CustomUserSerializer):
    pass


#  Candidate Serializer
class CandidateSerializer(serializers.ModelSerializer):
    resume_data = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser 
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'location',
            'resume_data',
            'skills'
        ]

    def get_resume_data(self, obj):
        resume = Resume.objects.filter(user=obj).first()
        if resume:
            return {
                "profession": resume.profession,
                "experience": resume.experience,
                "education": resume.education
            }
        return None

    def get_skills(self, obj):
        return list(
            ResumeSkill.objects.filter(resume__user=obj).values_list('skill__name', flat=True)
        )



#-------------Search Serializer------

class SearchResultSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()      # Common display name/title
    location = serializers.CharField(allow_blank=True)
    type = serializers.CharField()      # "job", "company", "candidate"

class JobSearchSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='title')
    location = serializers.CharField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = JobListing
        fields = ['id', 'name', 'location', 'type']

    def get_type(self, obj):
        return "job"

class CompanySearchSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='name')
    location = serializers.CharField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'name', 'location', 'type']

    def get_type(self, obj):
        return "company"

class CandidateSearchSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    location = serializers.CharField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'location', 'type']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_type(self, obj):
        return "candidate"


#  Company Serializer
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['owner']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)



#  Skill Serializer
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


# Certificate Serializer
class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ['id', 'file', 'uploaded_at']  




#  Resume Serializer
class ResumeSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )
    skills_list = serializers.SerializerMethodField(read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'profession', 'education', 'experience', 'skills', 'skills_list', 'certificates', 'uploaded_at']
        read_only_fields = ['user']

    def get_skills_list(self, obj):
        return [s.name for s in obj.skills.all()]

    def create(self, validated_data):
        skill_names = validated_data.pop('skills', [])
        resume = Resume.objects.create(**validated_data)
        for name in skill_names:
            if name.strip():
                skill_obj, _ = Skill.objects.get_or_create(name=name.strip())
                ResumeSkill.objects.get_or_create(resume=resume, skill=skill_obj)
        return resume

    def update(self, instance, validated_data):
        try:
            skill_names = validated_data.pop('skills', None)
            certificate = validated_data.pop('certificate', None)

            # Update normal fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            # Update certificate if provided
            if certificate is not None:
                instance.certificate = certificate

            instance.save()

            # Update skills
            if skill_names is not None:
                instance.skills.clear()
                for name in skill_names:
                    if name.strip():
                        skill_obj, _ = Skill.objects.get_or_create(name=name.strip())
                        ResumeSkill.objects.get_or_create(resume=instance, skill=skill_obj)

            return instance
        except Exception as e:
            print("❌ Resume Update Error:", e)
            raise serializers.ValidationError({"detail": str(e)})

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['skills'] = rep.pop('skills_list', [])
        return rep



#  ResumeSkill Serializer
class ResumeSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSkill
        fields = '__all__'





#  Job Category Serializer
class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = '__all__'


#  Job Listing Serializer
class JobListingSerializer(serializers.ModelSerializer):
    salary = serializers.CharField()
    skills = serializers.ListField(child=serializers.CharField(), write_only=True)
    skill_names = serializers.SerializerMethodField(read_only=True)

    company = CompanySerializer(read_only=True)
    category = JobCategorySerializer(read_only=True)
    category_input = serializers.CharField(write_only=True)

    class Meta:
        model = JobListing
        fields = [
            'id', 'title', 'description', 'location', 'salary', 'expiry_date',
            'category', 'category_input', 'skills', 'skill_names', 'company',  'job_type'
        ]
        read_only_fields = ['company', 'category', 'skill_names']

    def get_skill_names(self, obj):
        return [skill.name for skill in obj.skills.all()]

    def clean_salary(self, value):
        """
        Keep salary exactly as user writes (just trim spaces).
        If blank, set to 'Negotiable'.
        """
        if not value or str(value).strip() == "":
            return "Negotiable"
        return str(value).strip()  # No formatting, keep as user input

    def create(self, validated_data):
        skill_names = validated_data.pop('skills', [])
        category_name = validated_data.pop('category_input')
        user = self.context['request'].user

        validated_data['salary'] = self.clean_salary(validated_data.get('salary'))
        company = Company.objects.get(owner=user)
        category_obj, _ = JobCategory.objects.get_or_create(name=category_name)

        job = JobListing.objects.create(
            company=company,
            category=category_obj,
            **validated_data
        )

        for name in skill_names:
            name = name.strip()
            if name:
                skill_obj, _ = Skill.objects.get_or_create(name=name)
                job.skills.add(skill_obj)

        return JobListing.objects.select_related('category', 'company').prefetch_related('skills').get(id=job.id)

    def update(self, instance, validated_data):
        skill_names = validated_data.pop('skills', None)
        category_name = validated_data.pop('category_input', None)

        if 'salary' in validated_data:
            validated_data['salary'] = self.clean_salary(validated_data['salary'])

        if category_name:
            category_obj, _ = JobCategory.objects.get_or_create(name=category_name)
            instance.category = category_obj

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if skill_names is not None:
            instance.skills.clear()
            for name in skill_names:
                name = name.strip()
                if name:
                    skill_obj, _ = Skill.objects.get_or_create(name=name)
                    instance.skills.add(skill_obj)

        instance.save()
        return JobListing.objects.select_related('category', 'company').prefetch_related('skills').get(id=instance.id)



#  ApplicationSerializer 
class ApplicationSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(queryset=JobListing.objects.all())

    # Job info
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    job_salary = serializers.CharField(source='job.salary', read_only=True)

    # Company info
    company_id = serializers.IntegerField(source='job.company.id', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    # Candidate info
    candidate_name = serializers.CharField(source='user.get_full_name', read_only=True)
    candidate_email = serializers.EmailField(source='user.email', read_only=True)
    candidate_phone = serializers.CharField(source='user.phone', read_only=True)

    # Resume info
    resume_data = serializers.SerializerMethodField()
    resume_created = serializers.SerializerMethodField()
    resume_link = serializers.SerializerMethodField()

    # Extra
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    created_at = serializers.DateTimeField(source='applied_at', read_only=True)
    cover_letter = serializers.CharField(source='message', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'status', 'job', 'created_at',
            'job_title', 'job_location', 'job_salary',
            'company_id', 'company_name',
            'candidate_name', 'candidate_email', 'candidate_phone',
            'resume_data', 'resume_created', 'resume_link',
            'user_id', 'cover_letter'
        ]
        read_only_fields = ['user', 'resume', 'applied_at']

    def get_resume_data(self, obj):
        if obj.resume:
            return {
                "profession": obj.resume.profession,
                "education": obj.resume.education,
                "experience": obj.resume.experience,
                "skills": [s.name for s in obj.resume.skills.all()]
            }
        return None

    def get_resume_created(self, obj):
        return obj.resume is not None

    def get_resume_link(self, obj):
        if obj.resume:
            return f"/profile/{obj.user.id}/"
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        role = getattr(request.user, 'role', None)
        role = str(role).lower() if role else None

        # Employer view
        if role == 'employer':
            return representation

        # Jobseeker view – limited fields
        return {
            'id': representation['id'],
            'status': representation['status'],
            'created_at': representation['created_at'],
            'job_title': representation['job_title'],
            'job_location': representation['job_location'],
            'job_salary': representation['job_salary'],
            'company_id': representation['company_id'],
            'company_name': representation['company_name'],
        }


#  Job Offer Serializer 
class JobOfferSerializer(serializers.ModelSerializer):
    candidate_resume = serializers.SerializerMethodField(read_only=True)
    skill_names = serializers.SerializerMethodField(read_only=True)
    resume_data = serializers.SerializerMethodField(read_only=True)
    company_name = serializers.SerializerMethodField(read_only=True)

    skills = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = JobOffer
        fields = [
            'id', 'employer', 'candidate', 'candidate_id',
            'title', 'description', 'location', 'salary', 'expiry_date',
            'skills', 'skill_names', 'job_type', 'message',
            'status', 'created_at', 'responded_at', 'candidate_resume',
            'resume_data', 'company_name'
        ]
        read_only_fields = [
            'employer', 'candidate', 'status',
            'created_at', 'responded_at'
        ]

    def get_company_name(self, obj):
        employer = getattr(obj, 'employer', None)
        if not employer:
            return "Not specified"
        if hasattr(employer, 'company') and employer.company and getattr(employer.company, 'name', None):
            return employer.company.name
        if hasattr(employer, 'companies') and employer.companies.exists():
            return employer.companies.first().name
        if getattr(employer, 'company_name', None):
            return employer.company_name
        return "Not specified"

    def get_candidate_resume(self, obj):
        if obj.candidate and getattr(obj.candidate, 'resume', None):
            try:
                return obj.candidate.resume.url
            except:
                return str(obj.candidate.resume)
        return None

    def get_skill_names(self, obj):
        return [s.name for s in obj.skills.all()]

    def get_resume_data(self, obj):
        resume = getattr(obj, 'candidate_resume', None)
        if not resume and hasattr(obj.candidate, 'resume_set'):
            resume = obj.candidate.resume_set.order_by('-uploaded_at').first()
        if resume:
            return {
                "profession": getattr(resume, 'profession', None),
                "education": getattr(resume, 'education', None),
                "experience": getattr(resume, 'experience', None),
                "skills": [s.name for s in resume.skills.all()]
            }
        return None

    def create(self, validated_data):
        skill_names = validated_data.pop('skills', [])
        candidate_id = validated_data.pop('candidate_id', None)
        request = self.context.get('request')

        if not candidate_id:
            raise serializers.ValidationError({"candidate_id": "This field is required."})

        try:
            candidate = CustomUser.objects.get(id=candidate_id, role='jobseeker')
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"candidate_id": "Candidate not found or not a jobseeker."})

        employer = request.user
        offer = JobOffer.objects.create(employer=employer, candidate=candidate, **validated_data)

        for name in skill_names:
            if name and name.strip():
                s, _ = Skill.objects.get_or_create(name=name.strip())
                offer.skills.add(s)

        return offer




# ------- Jobseeker Offer Job Serializer -------
class JobSerializer(serializers.ModelSerializer):
    skill_names = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = JobListing
        fields = [
            'id', 'title', 'description', 'location', 'expiry_date',
            'company_name', 'skill_names'
        ]

    def get_skill_names(self, obj):
        return [s.name for s in obj.skills.all()]

    def get_company_name(self, obj):
        if getattr(obj.employer, 'company', None) and getattr(obj.employer.company, 'name', None):
            return obj.employer.company.name
        if getattr(obj.employer, 'company_name', None):
            return obj.employer.company_name
        return "Not specified"


# -------- Job Offer Serializer --------
class JobOfferSerializer(serializers.ModelSerializer):
    candidate_id = serializers.IntegerField(write_only=True)
    candidate = CustomUserSerializer(read_only=True)
    employer = CustomUserSerializer(read_only=True)
    skills = serializers.ListField(child=serializers.CharField(), write_only=True)
    skill_names = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobOffer
        fields = [
            'id', 'employer', 'candidate', 'candidate_id',
            'title', 'description', 'location', 'salary',
            'expiry_date', 'skills', 'skill_names',
            'job_type', 'message', 'status',
            'created_at', 'responded_at'
        ]
        read_only_fields = ['employer', 'candidate', 'status', 'created_at', 'responded_at']

    def get_skill_names(self, obj):
        return [s.name for s in obj.skills.all()]

    def create(self, validated_data):
        skills = validated_data.pop('skills', [])
        candidate_id = validated_data.pop('candidate_id')
        employer = self.context['request'].user

        # get candidate
        try:
            candidate = CustomUser.objects.get(id=candidate_id)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"candidate_id": "Invalid candidate."})

        offer = JobOffer.objects.create(
            employer=employer,
            candidate=candidate,
            **validated_data
        )

        # assign skills
        for name in skills:
            name = name.strip()
            if name:
                skill_obj, _ = Skill.objects.get_or_create(name=name)
                offer.skills.add(skill_obj)

        return offer





#  Recommendation Serializer
class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = JobListing
        fields = ['id', 'title', 'description', 'location', 'expiry_date', 'company_name']


class RecommendationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'job', 'reason', 'match_score', 'created_at']


#  ChatbotQuery Serializer
class ChatbotQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatbotQuery
        fields = '__all__'
        read_only_fields = ['response', 'created_at']



# Notification Serializer
class NotificationSerializer(serializers.ModelSerializer):
    message = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'type', 'job_title', 'company_name', 'jobseeker_name', 'is_read', 'created_at', 'message']

    def get_message(self, obj):
        if obj.type == 'profile_incomplete':
            return "⚠️ Please upload your profile image to complete your profile."
        elif obj.type == 'resume_missing':
            return "📄 Your resume is missing. Please create your resume to apply for jobs."
        elif obj.type == 'job_offer':
            return f"🎉 You have received a job offer for '{obj.job_title}' from {obj.company_name}."
        elif obj.type == 'job_offer_accepted':
            return f"✅ {obj.jobseeker_name} has accepted your job offer for '{obj.job_title}'."
        elif obj.type == 'job_offer_rejected':
            return f"❌ {obj.jobseeker_name} has rejected your job offer for '{obj.job_title}'."
        elif obj.type == 'recommendation_available':
            return "💡 A new job recommendation is available for you."
        elif obj.type == 'company_profile_incomplete':
            return "⚠️ Please complete your company profile (logo/description missing)."
        elif obj.type == 'new_application':
            return f"📥 {obj.jobseeker_name} has applied for your job '{obj.job_title}'."
        return ""