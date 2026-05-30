from django.contrib import admin
from .models import (
    CustomUser, Company, Skill, Resume, ResumeSkill,
    JobCategory, JobListing, Application,
     Recommendation, ChatbotQuery,  JobOffer
)

admin.site.register(CustomUser)
admin.site.register(Company)
admin.site.register(Skill)
admin.site.register(Resume)
admin.site.register(ResumeSkill)
admin.site.register(JobCategory)
admin.site.register(JobListing)
admin.site.register(Application)
admin.site.register(Recommendation)
admin.site.register(ChatbotQuery)
admin.site.register(JobOffer)