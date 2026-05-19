from .base import *  # noqa

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
]
