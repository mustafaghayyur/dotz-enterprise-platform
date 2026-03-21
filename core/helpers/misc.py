import importlib
import pprint
import inspect
import traceback

from django.utils import timezone
from django.conf import settings
from .strings import isPrimitiveType
from core.dotzSettings import settings as configs


def getInfo(name = None, type = 'class', getDunders = True):
    """
        List out attributes of class.
        
        :param name: [str]
        :param type: [str]
        :param getDunders: [bool]
    """
    pref = '&*&' if getDunders else '__'

    if type == 'class':
        return [attr for attr in dir(name) if callable(getattr(name, attr)) and not attr.startswith(pref)]

    if type == 'instance':
        return [attr for attr in dir(name) if callable(getattr(name, attr)) and not attr.startswith('__')]


def mergeDictionaries(leftDictionary, rightDictionary):
        """
            Simply merges left dictionary with right dictionary.
            The right dictionary over-writes the left.
        """
        if isinstance(leftDictionary, dict) and isinstance(rightDictionary, dict):
            meerged = leftDictionary | rightDictionary  # merge provided conditions into the defaults        

            if isinstance(meerged, dict):
                return meerged
            
        return {}


def importModule(componentName: str, modulePath: str):
    """
        Import certain class/function/obj from module

        :param componentName: [str] name of class/function or obj found in module
        :param modulePath: [str] string path to module file, e.g. "tasks.drm.crud"
    """
    module = importlib.import_module(modulePath)
    return getattr(module, componentName)


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

