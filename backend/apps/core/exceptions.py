from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'message': 'An error occurred',
            'errors': response.data,
            'status_code': response.status_code,
        }

        if response.status_code == 400:
            error_data['message'] = 'Validation error'
        elif response.status_code == 401:
            error_data['message'] = 'Authentication required'
        elif response.status_code == 403:
            error_data['message'] = 'Permission denied'
        elif response.status_code == 404:
            error_data['message'] = 'Resource not found'
        elif response.status_code == 429:
            error_data['message'] = 'Too many requests'

        response.data = error_data

    return response
