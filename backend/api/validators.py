from django.core.exceptions import ValidationError


def validate_file_size(value):
    limit = 4 * 1024 * 1024  # 4mb
    if value.size > limit:
        raise ValidationError("Image file too large. Size should not exceed 2 MB.")