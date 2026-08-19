from django.urls import path
from .views import *

urlpatterns = [
    path('api/signup/', SignupAPIView.as_view(), name='signup'),
    path('api/login/', LoginAPIView.as_view(), name='login'),
    path('api/profile/', ProfileView.as_view(), name="profile"),
    path('api/images/', ImageUpLoadView.as_view(), name="image_upload"),
    path("api/images/<int:image_id>/like/", LikeToggleView.as_view(), name="like_toggle"),
    path("api/images/<int:image_id>/save/", SaveToggleView.as_view(), name="Save_toggle"),
    path("api/images/<int:image_id>/comments/", CommentListCreateView.as_view(), name="comments"),
    path("api/users/<int:user_id>/follow/", FollowToggleView.as_view(), name="follow_toggle"),
    path("api/comments/<int:comment_id>/", CommentDeleteView.as_view(), name="comment_delete"),
    path("api/users/<int:user_id>/", UserProfileView.as_view(), name="user_profile"),
    path("api/users/<int:user_id>/images/", UserImagesView.as_view(), name="user_images"),
    path('api/saved/', SavedImagesview.as_view(), name="saved_images"),
    path('api/images/<int:image_id>/', ImageDetailView.as_view(), name="image_detail"),
    path("api/profile/update/", UpdateProfileView.as_view(), name="profile_update")


]
