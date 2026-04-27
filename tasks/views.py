from django.shortcuts import render
from core.helpers import misc, data

def dashboard(request):
    """
    This view launches the Single Page Application for the Tasks App.
    JS app can be found in static/tasks/js/
    """
    formsContext = misc.makeFormsContext(request)
    context = {}
    return render(request, 'tasks/index.html', data.mergeDictionaries(context, formsContext))

