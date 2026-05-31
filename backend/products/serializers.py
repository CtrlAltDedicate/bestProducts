from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        # create_user hashes the password — never store plain text (OWASP A02)
        user = User.objects.create_user(**validated_data)
        return user


class ProductSerializer(serializers.ModelSerializer):
    # Return username string instead of FK integer for readability
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'category',
            'image_url', 'stock', 'created_by', 'created_at',
            'updated_at', 'fakestore_id',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'category',
            'image_url', 'stock', 'fakestore_id',
        ]

    def create(self, validated_data):
        # Automatically assign the logged-in user as creator
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
