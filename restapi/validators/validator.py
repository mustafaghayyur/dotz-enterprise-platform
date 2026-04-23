from rest_framework.serializers import Serializer, IntegerField, ChoiceField, CharField
from restapi.validators.generic import *
from tasks.models import *
from django.db import models

class O2ORecordSerializerGeneric(Serializer):
    """
        Generic Serializer for O2O records
    """
    pass

def generate_dynamic_serializer(model_class, class_name=None):
    """
    Dynamically generates a serializer class from a Django model.
    Usage: TaskSerializer = generate_dynamic_serializer(Task)
    """
    if not class_name:
        class_name = f"{model_class.__name__}DynamicSerializer"
        
    fields_dict = {}
    
    field_mapping = {
        models.CharField: CharField,
        models.TextField: CharField,
        models.IntegerField: IntegerField,
        models.ForeignKey: IntegerField,
        models.DateTimeField: DateTimeFieldForJS,
    }
    
    for field in model_class._meta.fields:
        drf_field_class = field_mapping.get(type(field), CharField)
        name = f"{field.name}_id" if isinstance(field, models.ForeignKey) else field.name
        
        kwargs = {'required': not field.blank and not field.null}
        if field.null: kwargs['allow_null'] = True
            
        fields_dict[name] = drf_field_class(**kwargs)
        
    # Dynamically create and return a new class inheriting from O2ORecordSerializerGeneric
    return type(class_name, (O2ORecordSerializerGeneric,), fields_dict)
    
