from django.urls import path
from .views import NoteListCreate, CommentCreate, like_note, NoteDelete

urlpatterns = [
    path("notes/", NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", NoteDelete.as_view(), name="delete-note"),
    path('comments/', CommentCreate.as_view()),
    path('notes/like/', like_note),
]
