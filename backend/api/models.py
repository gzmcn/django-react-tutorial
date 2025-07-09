from django.db import models
from django.contrib.auth.models import User
from .validators import validate_file_size

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    image = models.ImageField(upload_to='tweet_images/', blank=True, null=True)
    validators = [validate_file_size]  # 4mb limit
    
class Comment(models.Model):
    note = models.ForeignKey(Note, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
class Like(models.Model):
    note = models.ForeignKey(Note, related_name="likes", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ("note", "user")  # Her kullanıcı sadece bir kere like atabilir
    
    def __str__(self):
        return self.title