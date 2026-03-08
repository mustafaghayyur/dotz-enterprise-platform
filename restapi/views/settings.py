"""
    Any nodes sendiing back settings/confirgurations can be defined here.
"""
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from restapi.lib.helpers import *
from core.helpers import crud, misc
from core.DRMcore.mappers.schema.main import schema
from core.DRMcore.mappers.RelationshipMappers import RelationshipMappers

@api_view(['GET'])
@permission_classes([AllowAny])
def retrieveAppSettings(request, format=None):
    """
    Retrieve API settings based on authentication status.
    - Accessible to both authenticated and anonymous users
    - Returns userSettings if valid JWT token is present
    - Returns anonymousSettings if no valid token or anonymous user
    """
    try:
        # Try to authenticate user from JWT cookie
        user = isUserAuthenticated(request)

        # User is authenticated - return user settings
        userSettings = {
            'is_authenticated': True,
            'username': user.username,
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'user_level': user.user_level,
            'allowed_routes': {
                'api': {
                    'auth': {
                        'login': '/accounts/rest/token/',
                        'refresh': '/accounts/rest/token/refresh/',  
                        'logout': '/accounts/rest/logout/',
                        'change_password': '/accounts/rest/change-password/',
                    },
                    'settings': {
                        'general': '/rest/settings-general/',
                        'mappers': '/rest/settings-mapper/{input1}',
                    },
                    'terminal': {
                        'crud': '/rest/all/crud/',
                        'list': '/rest/all/',
                    },
                },
                'ui': {
                    'auth': {
                        'login': '/accounts/login/',
                        'register': '/accounts/register/',
                    },
                    'apps': {
                        'tasks': '/tasks/',
                    }
                }
            }
        }
        
        return Response(crud.generateResponse(userSettings))
        
    except (InvalidToken, Exception) as e:  
        # User is not authenticated or token is invalid - return anonymous settings
        return Response(crud.generateResponse({
            'messages': "Authentication failed. If this seems to be an error, please contact support.",
            'errors': str(e),  # @todo make ui notification for this error msg, should be non-invasive
            'is_authenticated': False,
            'allowed_routes': {
                'api': {
                    'auth': {
                        'login': '/accounts/rest/token/',
                        'refresh': '/accounts/rest/token/refresh/',
                    },
                    'settings': {
                        'general': '/rest/settings-general/',
                        'mappers': '/rest/settings-mapper/{input1}',
                    },
                },
                'ui': {
                    'auth': {
                        'login': '/accounts/login/',
                        'register': '/accounts/register/'
                    },
                    'apps': {
                        'tasks': '/tasks/',
                    }
                }
            }
        }))




@api_view(['GET'])
@permission_classes([AllowAny])
def retrieveMapperSettings(request, tbl: str, format=None):
    """
        Authenticated users are supplied relevent Mapper settings.
        Unauthenticated users TBD @ todo
        
        :params
        :request: Request obj
        :tbl: table key as identified by DRM
    """
    try:
        # Try to authenticate user from JWT cookie
        user = isUserAuthenticated(request)
        definition = schema.get(tbl, None)

        if not isinstance(definition, dict):
            raise Exception('Error 11970: Provided Table key does not exist.')
        
        Model = misc.importModule(definition.get('model'), definition.get('path'))
        mapper = Model.objects.getMapper()
        
        if not isinstance(mapper, RelationshipMappers):
            raise Exception('Error 11971: Table key could not fetch valid Mapper.')

        context = {
            'o2oFields': list(mapper.generateO2OFields().keys()),
            'allFields': list(mapper.generateAllFields().keys()),
        }

        return Response(crud.generateResponse(context))
    
    except (InvalidToken, Exception) as e:
        context = {}
        return Response(crud.generateResponse(context))
    