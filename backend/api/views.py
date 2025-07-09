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
from rest_framework import status

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Note.objects.all()  # get all notes

        hashtag = self.request.query_params.get('hashtag')
        if hashtag:
            hashtag = f"#{hashtag.lower()}"
            queryset = queryset.filter(content__icontains=hashtag)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print("Serializer errors:", serializer.errors)  # <<<<< This line to debug
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
            
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
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
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