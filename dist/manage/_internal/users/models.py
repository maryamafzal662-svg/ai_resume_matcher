from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.conf import settings


CustomUser = settings.AUTH_USER_MODEL
# -------- Custom User Manager --------   
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, username=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')

        email = self.normalize_email(email)

        # Agar username nahi diya, to email ka prefix use karo
        if not username:
            username = email.split('@')[0]

        user = self.model(
            email=email,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, username=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        return self.create_user(email, password=password, username=username, **extra_fields)


# -------- USER MODEL --------
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('jobseeker', 'Job Seeker'),
        ('employer', 'Employer'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)  # optional username
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'       # Login by email
    REQUIRED_FIELDS = []           # No extra required field

    def __str__(self):
        return self.email

    class Meta:
        swappable = 'AUTH_USER_MODEL'

# -------- COMPANY MODEL --------
class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    website = models.URLField()
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='companies')

    def __str__(self):
        return self.name

# -------- SKILL MODEL --------
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# -------- RESUME MODEL --------
class Resume(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='resumes')
    profession = models.CharField(max_length=255, blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    skills = models.ManyToManyField(Skill, through='ResumeSkill')
    
    def __str__(self):
        return f"{self.user.username}'s Resume"

class ResumeSkill(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('resume', 'skill')

    #  Certificate models

class Certificate(models.Model):
    resume = models.ForeignKey('Resume', related_name='certificates', on_delete=models.CASCADE)
    file = models.FileField(upload_to='certificates/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cert {self.id} for {self.resume.user.username}"
    

# -------- JOB CATEGORY MODEL --------

class JobCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# -------- JOB LISTING MODEL --------

class JobListing(models.Model):
    JOB_TYPE_CHOICES = [
        ('On-site', 'On-site'),
        ('Remote', 'Remote'),
        ('Hybrid', 'Hybrid'),
    ]

    company = models.ForeignKey(
        'Company',
        on_delete=models.CASCADE,
        related_name='job_listings'
    )
    category = models.ForeignKey(
        'JobCategory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_listings'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    salary = models.CharField(max_length=255, default="Negotiable", blank=True, null=True)
    expiry_date = models.DateField(null=True, blank=True)
    skills = models.ManyToManyField('Skill', related_name='job_listings', blank=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='On-site')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


# -------- APPLICATION MODEL --------

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.job.title} ({self.status})"


#---------------- Offer job MODEL------------------

class JobOffer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    employer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_offers')
    candidate = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_offers')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=255, default='Negotiable', blank=True, null=True)
    expiry_date = models.DateField(null=True, blank=True)
    skills = models.ManyToManyField(Skill, related_name='offer_skills', blank=True)
    job_type = models.CharField(max_length=20, choices=JobListing.JOB_TYPE_CHOICES, default='On-site')
    message = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Offer: {self.title} → {self.candidate.username} ({self.status})"




# -------- RECOMMENDATION MODEL --------

class Recommendation(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='recommendations')
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='recommendations')
    reason = models.TextField()
    match_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.job.title} ({self.match_score}%)"


# -------- CHATBOT QUERY MODEL --------

class ChatbotQuery(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chatbot_queries', null=True, blank=True)
    question = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question[:50]
    


# ----------Notification MODEL----------

NOTIFICATION_TYPES = [
    ('profile_incomplete', 'Profile Incomplete'),
    ('resume_missing', 'Resume Missing'),
    ('job_offer', 'Job Offer'),
    ('job_offer_accepted', 'Job Offer Accepted'),
    ('job_offer_rejected', 'Job Offer Rejected'),
    ('recommendation_available', 'Recommendation Available'),
    ('company_profile_incomplete', 'Company Profile Incomplete'),
    ('new_application', 'New Application'),
]

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    jobseeker_name = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type}"
