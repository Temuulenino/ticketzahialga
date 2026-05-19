from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from apps.core.mixins import ResponseMixin
from apps.users.models import User
from apps.users.serializers import UserPublicSerializer
from .models import OTPCode
from .serializers import (
    RegisterSerializer, LoginSerializer, VerifyOTPSerializer,
    ResendOTPSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)
from .services import OTPService


class RegisterView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        can_request, msg = OTPService.can_request_otp(user.email, 'verify_email')
        otp = OTPService.create_otp(user.email, 'verify_email')
        OTPService.send_otp_email(user.email, otp)

        return self.success_response(
            data={'email': user.email, 'requires_verification': True},
            message='Account created. Please verify your email with the OTP sent.',
            status_code=status.HTTP_201_CREATED
        )


class LoginView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return self.error_response('Invalid email or password.')

        if not user.check_password(password):
            return self.error_response('Invalid email or password.')

        if not user.is_active:
            return self.error_response('Your account has been deactivated.')

        if not user.is_verified:
            otp = OTPService.create_otp(email, 'verify_email')
            OTPService.send_otp_email(email, otp)
            return self.error_response(
                'Email not verified. A new OTP has been sent.',
                errors={'requires_verification': True, 'email': email},
                status_code=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        user_data = UserPublicSerializer(user, context={'request': request}).data

        return self.success_response(data={
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
        }, message='Login successful')


class VerifyOTPView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        is_valid, message = OTPService.verify_otp(email, code, purpose)
        if not is_valid:
            return self.error_response(message)

        response_data = {}

        if purpose == 'verify_email':
            try:
                user = User.objects.get(email=email)
                user.is_verified = True
                user.save(update_fields=['is_verified'])

                refresh = RefreshToken.for_user(user)
                response_data = {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserPublicSerializer(user, context={'request': request}).data,
                }
            except User.DoesNotExist:
                return self.error_response('User not found.')

        return self.success_response(data=response_data, message=message)


class ResendOTPView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResendOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']

        can_request, msg = OTPService.can_request_otp(email, purpose)
        if not can_request:
            return self.error_response(msg, status_code=status.HTTP_429_TOO_MANY_REQUESTS)

        if purpose == 'verify_email':
            if not User.objects.filter(email=email).exists():
                return self.error_response('No account found with this email.')

        otp = OTPService.create_otp(email, purpose)
        OTPService.send_otp_email(email, otp)

        return self.success_response(message='OTP sent successfully. Please check your email.')


class ForgotPasswordView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # Always return success to prevent email enumeration
        if User.objects.filter(email=email, is_active=True).exists():
            can_request, msg = OTPService.can_request_otp(email, 'reset_password')
            if can_request:
                otp = OTPService.create_otp(email, 'reset_password')
                OTPService.send_otp_email(email, otp)

        return self.success_response(
            message='If an account exists with this email, an OTP has been sent.'
        )


class ResetPasswordView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        is_valid, message = OTPService.verify_otp(email, code, 'reset_password')
        if not is_valid:
            return self.error_response(message)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return self.success_response(message='Password reset successfully. You can now login.')
        except User.DoesNotExist:
            return self.error_response('User not found.')


class LogoutView(ResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return self.success_response(message='Logged out successfully.')
        except TokenError:
            return self.error_response('Invalid or expired token.')
