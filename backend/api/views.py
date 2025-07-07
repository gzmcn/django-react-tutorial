from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
from .serializers import NoteSerializer

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # only authenticated users can access this view
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)  # filter notes by the authenticated user
    
    def perform_create(self, serializer):
       serializer.save(author=self.request.user)
        
            
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # only authenticated users can delete notes
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() # when creating user look for all users, to not create duplicates
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # allow any user to create a new user