import importlib
import pprint
import inspect
import traceback
import os
from django import forms
from django.apps import apps

from django.utils import timezone
from django.conf import settings
from .strings import isPrimitiveType
from core.dotzSettings import settings as configs


def importModule(componentName: str, modulePath: str):
    """
        Import certain class/function/obj from module

        :param componentName: [str] name of class/function or obj found in module
        :param modulePath: [str] string path to module file, e.g. "tasks.drm.crud"
    """
    module = importlib.import_module(modulePath)
    return getattr(module, componentName)


def activeAppBasedOnRequest(request):
    """
        Determine active module from Django resolver or URL path as fallback

        :param request: [HttpRequest]
   """
    active_module = None
    if hasattr(request, 'resolver_match') and request.resolver_match:
        active_module = request.resolver_match.app_name or request.resolver_match.namespace

    if not active_module and hasattr(request, 'path'):
        # path typically begins with /users/ or /tasks/
        path_parts = [p for p in request.path.strip('/').split('/') if p]
        if path_parts:
            active_module = path_parts[0]

    if not active_module:
        active_module = 'unknown'

    return active_module


def makeFormsContext(request):
    """
        We loop through all files in {app}/lib/forms/ (except for templates.py).
        Gather all classes, where are Django forms.Form instances.
        Then place them in a dictionary and return. Keys are class-names, and values are class-references.
    """
    app = activeAppBasedOnRequest(request) # get app name
    formsContext = {}

    if not app or app == 'unknown':
        return formsContext

    try:
        app_config = apps.get_app_config(app)
    except LookupError:
        return formsContext

    forms_dir = os.path.join(app_config.path, 'lib', 'forms')

    if not os.path.isdir(forms_dir):
        return formsContext

    for filename in os.listdir(forms_dir):
        if filename.endswith('.py') and filename not in ['__init__.py', 'templates.py']:
            module_name = filename[:-3]
            module_path = f"{app}.lib.forms.{module_name}"
            
            try:
                module = importlib.import_module(module_path)
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    if hasattr(obj, '__module__') and obj.__module__ == module_path and issubclass(obj, forms.Form):
                        formsContext[name] = obj()
            except (ImportError, ModuleNotFoundError) as e:
                log(f"Could not import form module {module_path}: {e}", "Form Context Error")
                continue
    return formsContext
    
def log(subject, log_message = 'SIMPLE TEST OF VALUES:', level = 1):
    """
        Simple logger. Use by importing core.helpers.misc

        Params:
            - subject: the variable you wish to log
            - log_message: additional meta data you wish to tack on
            - level [int]: 1 = simple parse of object. 2 = More introspection. 3 = trace from provided subject (error object)
    """
    if not settings.DEBUG:
        return None  # exit on prod
    
    varType = type(subject)
    now = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
    log = ''
    trace = ''
    logger_file = configs.get('project.debug_log_file')

    if isinstance(subject, str):
        log = subject
    else:
        if isinstance(subject, float) or isinstance(subject, int) or isinstance(subject, complex):
            log = str(subject)
        else:
            try:
                if level == 2:
                    log = pprint.pformat(inspect.getmembers(subject))
                else:
                    log = pprint.pformat(subject)
                
            except KeyError as e:
                log = "KeyError while converting subject to string. Log failed."
            
    if level == 3:
        try:
            trace = pprint.pformat(traceback.format_tb(subject.__traceback__))
        except Exception:
            trace = 'TraceError: attempted traceback of provided error subject, but failed.'

    
    msg = f"""
{now}
---------------
{log_message}
---------------
Variable type: {varType}
---------------
{log}
{trace}
---------------

"""
    with open(logger_file, "at") as f:
        f.write(msg)
