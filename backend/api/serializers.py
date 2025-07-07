from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Comment, Like

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} # no one can read the password
        
    def create(self, validated_data): # class meta makes sure that data is valid and its named validated_data
        user = User.objects.create_user(**validated_data) # ** unpacks the dictionary into keyword arguments
        return user
    
    
class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author_username', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user']
    
class NoteSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author", "comments", "likes_count"]
        extra_kwargs = {"author": {"read_only": True}}

    def get_likes_count(self, obj):
        return obj.likes.count()