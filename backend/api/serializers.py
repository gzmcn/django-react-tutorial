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
    author_username = serializers.ReadOnlyField(source='author.username')
    image = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = Note
        fields = ["id", "title", "content","image", "created_at", "author", "author_username", "comments", "likes_count"]
        extra_kwargs = {
            "author": {"read_only": True},
            "title": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_null": True},
        }
    def get_likes_count(self, obj):
        return obj.likes.count()
    def validate(self, data):
        content = data.get("content", "").strip()
        if not content:
            raise serializers.ValidationError("Content cannot be empty")
        return data