from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} # no one can read the password
        
    def create(self, validated_data): # class meta makes sure that data is valid and its named validated_data
        user = User.objects.create_user(**validated_data) # ** unpacks the dictionary into keyword arguments
        return user
    
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}