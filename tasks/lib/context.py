from core.lib.context import projectContext
from core.helpers.data import mergeDictionaries
from core.helpers.misc import activeAppBasedOnRequest


def appContext(request):
    """
        Allows for project-wide context-vars to be set, usable by any template.
    """

    context = projectContext(request)
    activeModule = activeAppBasedOnRequest(request)

    if activeModule != 'tasks':
        # Do not block other context processors: pass-through existing context
        return {}
    
    appContext = {
        'moduleName': 'Project Management Suite',
        'activeModule': activeModule,
    }

    return mergeDictionaries(context, appContext)
    