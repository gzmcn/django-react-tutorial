from django.urls import path
from .views import NoteListCreate, CommentCreate, like_note, NoteDelete, NoteUpdate, trending_hashtags, user_profile, get_current_user
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("notes/", NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", NoteDelete.as_view(), name="delete-note"),
    path('comments/', CommentCreate.as_view()),
    path('notes/like/', like_note),
    path("notes/update/<int:pk>/", NoteUpdate.as_view(), name="update-note"),
    path('hashtags/', trending_hashtags, name='trending-hashtags'),
    path("users/<str:username>/", user_profile),
    path("me/", get_current_user),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
