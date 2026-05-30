from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification, Application, JobListing, JobOffer, Resume, Company, CustomUser


#  Jab user create ya update hota hai → Profile / Resume / Company incomplete notifications
@receiver(post_save, sender=CustomUser)
def create_user_notifications(sender, instance, created, **kwargs):
    # Profile image check (sirf ek dafa notification create ho)
    if not getattr(instance, 'profile_image', None):
        Notification.objects.get_or_create(user=instance, type="profile_incomplete")

    # Resume check (sirf jobseeker ke liye)
    if getattr(instance, 'role', None) == "jobseeker" and not Resume.objects.filter(user=instance).exists():
        Notification.objects.get_or_create(user=instance, type="resume_missing")

    # Employer ke liye company profile check
    if getattr(instance, 'role', None) == "employer" and not Company.objects.filter(owner=instance).exists():
        Notification.objects.get_or_create(user=instance, type="company_profile_incomplete")


#  Jab new application submit hoti hai → Employer ko notify kare
@receiver(post_save, sender=Application)
def create_application_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.job.company.owner,
            type="new_application",
            job_title=instance.job.title,
            company_name=instance.job.company.name,
            jobseeker_name=instance.user.username,
        )


# Jab new job listing post hoti hai → Agar company profile incomplete ho to notify kare
@receiver(post_save, sender=JobListing)
def create_job_post_notification(sender, instance, created, **kwargs):
    if created and not instance.company.description:
        Notification.objects.create(
            user=instance.company.owner,
            type="company_profile_incomplete",
            job_title=instance.title,
            company_name=instance.company.name,
        )


#  Jab job offer create hoti hai → Candidate ko notify kare
@receiver(post_save, sender=JobOffer)
def create_job_offer_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.candidate,
            type="job_offer",
            job_title=instance.title,
            company_name=instance.employer.username,
        )
