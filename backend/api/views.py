from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() # when creating user look for all users, to not create duplicates
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # allow any user to create a new user