from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from apps.users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), message='Энэ имэйл хаягтай бүртгэл аль хэдийн байна.')]
    )
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'password', 'confirm_password']

    def validate_email(self, value):
        return value.lower()

    def validate_password(self, value):
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError('Нууц үг томоор бичсэн үсэг агуулсан байх ёстой.')
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError('Нууц үг тоо агуулсан байх ёстой.')
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Нууц үг таарахгүй байна.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.is_verified = False
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=['verify_email', 'reset_password'], default='verify_email')

    def validate_email(self, value):
        return value.lower()

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('OTP тоон утга байх ёстой.')
        return value


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['verify_email', 'reset_password'], default='verify_email')

    def validate_email(self, value):
        return value.lower()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower()

    def validate_new_password(self, value):
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError('Нууц үг томоор бичсэн үсэг агуулсан байх ёстой.')
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError('Нууц үг тоо агуулсан байх ёстой.')
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Нууц үг таарахгүй байна.'})
        return data


class TokenRefreshResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
