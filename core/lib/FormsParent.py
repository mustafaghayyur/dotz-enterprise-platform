from django import forms

class Forms(forms.Form):
    """
        Form Template with framework of feteching custom choice field values 
        based on parameters set through self.setParams().
    """
    _paramMatrix = {}  # holds any params passed to 'setParms.()' method 
    _querysets = {}  # # holds any params passed to 'setQuerySet.()' method 

    def __init__(self, *args, **kwargs):
        """
        Setup custom init tasks for our forms.
        """
        matrix = kwargs.pop('param_matrix', None)  # 'param_matrix' is a custom kwargs we use to pass parameters for ModelChoiceField poplation
        super().__init__(*args, **kwargs)
        self.performSetup(matrix)


    def setParams(self, params: dict):
        """
        Takes a defined dictionary of key=>value pairs and saves it into 
        self._paramMatrix property.
        """
        for key, value in params.items():
            self._paramMarix[key] = value

    def getParam(self, key: str):
        """
        grab single key if it exists from ParameterMatrix
        """
        if key in self._paramMatrix:
            return self._paramMatrix[key]
        return None

    def setQuerySet(self, key: str, queryset: dict):
        """
        Sets a queryset resultset in memory
        """
        self._querysets[key] = queryset

    def getQuerySet(self, key: str):
        """
        Gets a queryset stored in mem 
        """
        if self._querysets[key] is None:
            return self._querysets[key]
        return None
