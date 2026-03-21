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
            # Add appropriate Bootstrap classes based on field type
            if isinstance(field.widget, forms.RadioSelect):
                field.widget.attrs['class'] = 'form-check form-check-inline'
            elif isinstance(field.widget, forms.SelectMultiple):
                field.widget.attrs['class'] = 'form-select some-other-field-class'
            elif isinstance(field.widget, forms.Select):
                field.widget.attrs['class'] = 'form-select some-other-field-class'
            else:
                field.widget.attrs['class'] = 'form-control some-other-field-class'
            # Store original help text in widget data attribute and clear help_text to prevent <br/> insertion
            
            if field.help_text:
                field.widget.attrs['data-bs-toggle'] = 'tooltip'
                field.widget.attrs['data-bs-placement'] = 'left'
                field.widget.attrs['data-bs-title'] = field.help_text
            field.help_text = ''  # Clear help_text to prevent Django from adding <br/> 
            
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
