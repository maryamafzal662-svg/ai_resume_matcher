from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework import generics
from .models import Application
from .serializers import ApplicationSerializer


# -------- Admin or ReadOnly --------
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

# -------- Role Based --------
class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'jobseeker'

class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            hasattr(request.user, 'role') and
            request.user.is_authenticated and
            request.user.role == 'employer'
        )

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

# -------- Company Permission --------
class IsAdminOrEmployerOwner(BasePermission):
    # """
    # Admin har cheez kar sakta hai.
    # Employer sirf apni company create/update/delete kar sakta hai.
    # Job Seeker sirf read-only ho (agar chaho to).
    # """
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            # Admin sab kuch kar sakta hai
            if request.user.role == 'admin':
                return True
            # Employer sirf apni company access kar sakta hai
            if request.user.role == 'employer' and obj.owner == request.user:
                return True
            # Job seeker sirf GET access rakh sakta hai (optional)
            if request.method in SAFE_METHODS:
                return True
        return False

# -------- Skill + Application Permission --------
class IsJobSeekerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            # Admin full access
            if request.user.role == 'admin':
                return True
            # Job seeker can create, update, delete
            if request.user.role == 'jobseeker':
                return True
            # Employer can only GET (read)
            if request.user.role == 'employer' and request.method in SAFE_METHODS:
                return True
        return False

# -------- Resume Permissions --------
class IsOwnerOrAdminOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow safe methods (GET, HEAD, OPTIONS) for everyone
        if request.method in SAFE_METHODS:
            return True
        # Admin can do anything
        if request.user.is_authenticated and request.user.role == 'admin':
            return True
        # Jobseeker can update/delete only their own resume
        return obj.user == request.user

class IsJobSeekerAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'jobseeker'

# -------- Resume Skill --------
class IsResumeOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if request.user.role == 'admin':
                return True
            return obj.resume.user == request.user
        return False

class IsJobSeekerForResumeSkill(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'jobseeker'

# -------- JobListing Permission --------
class IsAdminOrEmployerOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.role == 'employer'
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role == 'admin':
            return True
        return obj.company.owner == request.user

# -------- Application Permission --------
class IsEmployerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.role == 'employer' or request.user.role == 'admin'
        )

# -------- JobScore Permission --------
class IsAdminOrReadOnlyForScore(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'
