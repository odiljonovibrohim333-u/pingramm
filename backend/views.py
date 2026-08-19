from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework.permissions import IsAuthenticated,  AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

User = get_user_model()

class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "User successfully created"
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginAPIView(APIView):
    permission_classes = [AllowAny]   # 🆕 MANA SHU KALIT!

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=200)
        return Response(serializer.errors, status=400)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

class ImagePagination(PageNumberPagination):
    page_size = 10

class ImageUpLoadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        images = Image.objects.all().order_by("-created_at")
        search = request.query_params.get("search", "")
        if search:
            images = images.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(user__username__icontains=search)
            )
        paginator = ImagePagination()
        page = paginator.paginate_queryset(images, request)
        serializer = ImageSerializer(page, many=True, context={"request":request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = ImageSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request, image_id):
        image = get_object_or_404(Image, id=image_id)
        like = Like.objects.filter(user=request.user, image=image).first()

        if like:
            like.delete()
            liked = False
        else:
            Like.objects.create(user=request.user, image=image)
            liked = True 

        return Response({
            'liked':liked,
            "likes_count":image.likes.count(),
        })

class SaveToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, image_id):
        image = get_object_or_404(Image, id=image_id)
        save = Save.objects.filter(user=request.user, image=image).first()

        if save:
            save.delete()
            saved = False

        else:
            Save.objects.create(user=request.user, image=image)
            saved = True
        return Response({
            "saved":saved,
            'saves_count':image.saves.count(),

        })

class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, image_id):
        image = get_object_or_404(Image, id=image_id)
        comments = image.comments.all().order_by("created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, image_id):
        image = get_object_or_404(Image, id=image_id)

        if not image.comments_enabled:
            return Response(
                {"detail":"Bu rasmda kommentlar o'chirilgan."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, image=image)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FollowToggleView(APIView):
   permission_classes = [IsAuthenticated]

   def post(self, request, user_id):
       if request.user.id == user_id:
            return Response(
                {"detail": "O'zingizga o'zingiz obuna bola olmaysiz."},
                status=status.HTTP_400_BAD_REQUEST
            )

       target_user = get_object_or_404(User, id=user_id)
       follow = Follow.objects.filter(follower=request.user, following=target_user).first()

       if follow:
           follow.delete()
           followed = False
       else:
           Follow.objects.create(follower=request.user, following=target_user)
           followed = True

       return Response({
            "followed":followed,
            "followers_count":target_user.followers.count(),
        })
    
class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)

        if comment.user !=request.user:
            return Response(
                {"detail": "faqat o'z kommentingizni o'chira olasiz!"},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()
        return Response({"detail": "Komment o'chirildi."})

class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        is_followed = False
        if request.user.is_authenticated:
            is_followed = Follow.objects.filter(follower=request.user, following=user).exists()

        # 🖼️ Avatar: bor bo'lsa to'liq URL, yo'q bo'lsa None
        avatar = None
        if user.avatar:
            avatar = request.build_absolute_uri(user.avatar.url)

        return Response({
            "id": user.id,
            "username": user.username,
            "avatar": avatar,
            "followers_count": user.followers.count(),
            "following_count": user.following.count(),
            "images_count": user.images.count(),
            "is_followed": is_followed,   # ✅ endi to'g'ri — qo'shtirnoqda!
        })

class UserImagesView(APIView):
    def get(self, request, user_id):
        images = Image.objects.filter(user_id=user_id).order_by("-created_at")

        paginator = ImagePagination()
        page = paginator.paginate_queryset(images, request)
        serializer = ImageSerializer(page, many=True, context={"request":request})
        return paginator.get_paginated_response(serializer.data)

class SavedImagesview(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        images = Image.objects.filter(saves__user=request.user).order_by("-created_at")

        paginator = ImagePagination()
        page = paginator.paginate_queryset(images, request)
        serializer = ImageSerializer(page, many=True, context={"request":request})
        return paginator.get_paginated_response(serializer.data)

class ImageDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, image_id):
        image = get_object_or_404(Image, id=image_id)
        serializer = ImageSerializer(image, context={"request": request})
        return Response(serializer.data)

    def delete(self, request, image_id):
        image = get_object_or_404(Image, id=image_id)

        if image.user != request.user:
            return Response({"detail": "Faqat muallif o'chira oladi!"}, status=403)

        if image.image:
            image.image.delete(save=False)

        image.delete()   # 👈 endi HAR DOIM o'chiriladi!
        return Response(status=204)

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        if "avatar" in request.FILES:
            if user.avatar:
                user.avatar.delete(save=False)
            user.avatar = request.FILES['avatar']
            user.save()
        serializer = ProfileSerializer(user, context={'request':request})
        return Response(serializer.data)
