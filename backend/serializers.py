from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
User = get_user_model()
from .models import *
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password',]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(
            username=username,
            password=password
        )
        if  user is None:
            raise serializers.ValidationError(
                "Username yoki password noto'g'ri."
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "Bu account faol emas."
            )
        refresh = RefreshToken.for_user(user)
        return{
            'user':{
                'user':user.id,
                'username':user.username,
                'email':user.email,
            },
            'refresh': str(refresh),
            "access": str(refresh.access_token),
        }

class ProfileSerializer(serializers.ModelSerializer):
    images_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'images_count', 'followers_count', 'following_count', 'is_followed']

    def get_images_count(self, obj):
        return Image.objects.filter(user=obj).count()

    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj).count()

    def get_is_followed(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user, following=obj).exists()
    
class ImageSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)
    author_id = serializers.IntegerField(source='user.id', read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    saves_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = [
            'id', 'title', 'description', 'image',
            'comments_enabled', 'created_at',
            'author', 'author_id',
            'likes_count', 'is_liked',
            'saves_count', 'is_saved',
            'comments_count',
        ]
        read_only_fields = ['id', 'created_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Like.objects.filter(user=request.user, image=obj).exists()

    def get_saves_count(self, obj):
        return obj.saves.count()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Save.objects.filter(user=request.user, image=obj).exists()

    def get_comments_count(self, obj):
        return obj.comments.count()

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ['id','author','text','created_at']
        read_only_fields = ['id','created_at']

