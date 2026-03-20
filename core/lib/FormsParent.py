from django import forms
from django.utils.safestring import mark_safe

class Forms(forms.Form):
    """
        Form Template with framework of feteching custom choice field values 
        based on parameters set through self.setParams().
    """
    _paramMatrix = {}  # holds any params passed to 'setParms.()' method 
    _querysets = {}  # # holds any params passed to 'setQuerySet.()' method 

    def __init__(self, *args, **kwargs):
        """
            Enabled performSetup(matrix) in Init()
        """
        matrix = kwargs.pop('param_matrix', None)  # 'param_matrix' is a custom kwargs we use to pass parameters for ModelChoiceField poplation
        super().__init__(*args, **kwargs)

        if matrix:
            self.setParams(matrix['params'])
            self.setQuerySet(matrix['querysets'])

        for field_name, field in self.fields.items():
            # Add 'form-control' class to all fields
            field.widget.attrs['class'] = 'form-control some-other-field-class' 
            original = field.help_text
            field.help_text = mark_safe(f'<span class="form-text">{original}</span>') 
            
        self.performSetup()


    def performSetup(self):
        """
            Should be used in all child classes to perform init() tasks.
        """
        pass


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
