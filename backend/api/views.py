from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, CommentSerializer, LikeSerializer, UserProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Profile
from .serializers import NoteSerializer
from rest_framework import generics, permissions
from .models import Note, Comment, Like
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
import re
from collections import Counter
from rest_framework.views import APIView

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
        
        
class UserProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.custom_profile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
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


@api_view(['GET'])
def trending_hashtags(request):
    hashtag_pattern = re.compile(r"#\w+")
    all_notes = Note.objects.all()
    
    hashtags = []

    for note in all_notes:
        content = note.content or ""
        tags_in_note = hashtag_pattern.findall(content)
        hashtags.extend([tag.lower() for tag in tags_in_note])

    hashtag_counts = Counter(hashtags)
    sorted_tags = sorted(
        [{"tag": tag, "count": count} for tag, count in hashtag_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )

    return Response(sorted_tags)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request, username):
    try:
        user = User.objects.get(username=username)
        tweets = Note.objects.filter(author=user).order_by('-created_at')
        serializer = NoteSerializer(tweets, many=True)
        return Response({
            "user": {
                "username": user.username,
            },
            "tweets": serializer.data
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({ "username": user.username})