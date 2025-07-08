from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, CommentSerializer, LikeSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
from .serializers import NoteSerializer
from rest_framework import generics, permissions
from .models import Note, Comment, Like
from .serializers import NoteSerializer, CommentSerializer, LikeSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # only authenticated users can access this view
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects  # filter notes by the authenticated user
    
    def perform_create(self, serializer):
       serializer.save(author=self.request.user)
        
            
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # only authenticated users can delete notes
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
class NoteUpdate(generics.UpdateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # only authenticated users can update notes
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
class CommentCreate(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        note_id = self.request.data.get("note")
        note = Note.objects.get(id=note_id)
        serializer.save(author=self.request.user, note=note)
    
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() # when creating user look for all users, to not create duplicates
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # allow any user to create a new user
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_note(request):
    note_id = request.data.get("note")
    note = Note.objects.get(id=note_id)
    like, created = Like.objects.get_or_create(note=note, user=request.user)
    if not created:
        # like zaten varsa, sil
        like.delete()
        return Response({"liked": False})
    return Response({"liked": True})