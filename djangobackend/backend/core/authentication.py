# Custom authentication that doesn't trigger browser popup
import base64
from django.contrib.auth import authenticate
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class BasicAuthenticationNoBrowserPopup(BaseAuthentication):
    """
    HTTP Basic authentication without WWW-Authenticate header.
    This prevents the browser from showing its native auth popup.
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Basic '):
            return None
        
        try:
            encoded_credentials = auth_header.split(' ', 1)[1]
            decoded_credentials = base64.b64decode(encoded_credentials).decode('utf-8')
            username, password = decoded_credentials.split(':', 1)
        except (ValueError, UnicodeDecodeError, IndexError):
            raise AuthenticationFailed('Invalid basic auth credentials')
        
        user = authenticate(request=request, username=username, password=password)
        
        if user is None:
            raise AuthenticationFailed('Invalid username or password')
        
        return (user, None)

    def authenticate_header(self, request):
        # Return None to prevent WWW-Authenticate header
        # which would trigger the browser's native auth popup
        return None
