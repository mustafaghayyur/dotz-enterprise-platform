"""
Similar to generateSerializers, generateFormTemplates will:
 - create a {app}/lib/forms/templates.py file for each app WE OWN.
 - the templates file will essentially hold boilerplate code for ALL fields that a Mapper Entity holds.
 - In other words, each form with revolve around a O2O Mapper Entity, or its RLC/M2M Child Table 'Enitity'.
 - So the logical flow of how we loop through the models, and group their fields should be exactly like the generateSerializers command.
 - Each template Form class should be defined as: 
    - "class Entity{s}EditForm(Forms):" <- we add the 's' to end of O2O Entity name + we inherit from Forms. 
    - "class ChildEntity{s}ditForm(Forms):" <- where "ChildEntity" is the M2M or RLC Child Model name with a 's' suffixed to it. + we inherit from Forms.
    'Forms' parent class can be inherited from: from core.lib.FormsParent import Forms
 - The most important part of this command will be:
    - it allows auto inclusion of all model-id fields "{tbl}_id" as hidden fields
    - all "parent_id" fields will be forms.ModelChoiceField(queryset={Model}.objects.none()...) fields where Model will be replaced with the Model in question
    - all ForeignKey Ids (which are NOT the "{tbl}_id" mentioned above) will have: forms.ModelChoiceField(queryset={Model}.objects.none(), ...) <- where Model is the class reference to Model the FK belongs to.
    - all CharFields with a max_length set in their models > 1999 chars will have the field definition of: forms.CharField(widget=forms.Textarea,...)

I have attempted to set up some boilerplate code for you to better understand the directioon I want you to take...
"""

import importlib
import os
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models
from core.helpers import strings
from core.DRMcore.mappers.schema import schema

class Command(BaseCommand):
    """
        to run command: 
         > python3 ./manage.py generateFormTemplates
    """
    help = 'Generates basic form fields for a Mapper entity/child-entity (o2o, m2m, rlc) - for all apps and their models.'

    # Fix to match forms.{field-type} below...
    fieldMapping = {
        models.CharField: 'CharField',
        models.TextField: 'CharField',
        models.IntegerField: 'IntegerField',
        models.PositiveIntegerField: 'IntegerField',
        models.DateTimeField: 'DateTimeFieldForJS', # using your custom field!
        models.DateField: 'DateField',
        models.BooleanField: 'BooleanField',
        models.ForeignKey: 'IntegerField', # Foreign keys are usually validated as IDs
        models.EmailField: 'EmailField',
        models.SmallIntegerField: 'IntegerField',
        models.PositiveSmallIntegerField: 'IntegerField',
        models.FloatField: 'FloatField',
        models.DecimalField: 'DecimalField',
        models.JSONField: 'JSONField',
        models.UUIDField: 'UUIDField',
    }

    # string references to lists should be replaced with actual list that match forms.{field-type}'s args
    # no need to be too acurate, just make them reasonable, I will fix afterwards...
    argsMapping = {
        models.CharField: 'charNullableOpts',
        models.TextField: 'charNullableOpts',
        models.IntegerField: 'intNullableOpts',
        models.PositiveIntegerField: 'intNullableOpts',
        models.DateTimeField: 'datetimeNullableOpts', 
        models.DateField: 'datetimeNullableOpts',
        models.BooleanField: 'booleanNullableOpts',
        models.ForeignKey: 'intNullableOpts', 
        models.EmailField: 'charNullableOpts',
        models.SmallIntegerField: 'intNullableOpts',
        models.PositiveSmallIntegerField: 'intNullableOpts',
        models.FloatField: 'intNullableOpts', #todo: fix for floats
        models.DecimalField: 'intNullableOpts', #todo: fix for decimals
        models.JSONField: 'intNullableOpts', # fixed for jsons (no allow_blank)
        models.UUIDField: 'intNullableOpts', # fixed for uuids (no allow_blank)
    }

    dictionary = {}

    def handle(self, *args, **kwargs):
        try:
            appList = apps.get_app_configs()
            imports = ['from rest_framework import serializers', 'from restapi.validators.generic import *']
        
            for app in appList:
                if app.label not in ['tasks', 'users', 'tickets', 'documents', 'customers', 'core', 'restapi']: 
                    self.stderr.write(f" - skipping {app.label}")
                    continue
                
                content = strings.concatenate(imports, "\n") + "\n\n"
                content += self.processApp(appLabel=app.label)

                formsDir = os.path.join(app.path, 'lib', 'forms') # fix as needed to confirm lib/forms exists...
                if not os.path.exists(formsDir):
                    os.makedirs(formsDir)

                with open(os.path.join(formsDir, 'templates.py'), "wt") as f:
                    f.write(content)

                self.stderr.write(self.style.SUCCESS(f"=================\nCompleted {app.label} serializer generation.\n=================\n"))
        
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Serializers Generation Process Interrupted: " + str(e)))

        
    def processApp(self, **kwargs):
        appLabel = kwargs['appLabel']
        serializerClass = ""
        self.dictionary = {}

        try:
            modelsList = apps.get_app_config(appLabel).get_models()
        except LookupError:
            self.stderr.write(self.style.ERROR(f"Models for {appLabel} not found."))
            return serializerClass

        for model in modelsList:    
            self.generateFormFields(model)
            
        # once we have mapped all models...
        for entity in self.dictionary:
            for serType in self.dictionary[entity]:
                if serType == 'o2o':
                    if self.dictionary[entity][serType]:
                        serializerClass += self.generateFormClass(entity, serType, self.dictionary[entity][serType])
                        self.stderr.write(self.style.SUCCESS(f" - Added {entity}.{serType} serializer.\n"))
                else:
                    for name in self.dictionary[entity][serType]:
                        serializerClass += self.generateFormClass(name, serType, self.dictionary[entity][serType][name])
                        self.stderr.write(self.style.SUCCESS(f" - Added {entity}.{serType}.{name} serializer.\n"))

        return serializerClass


    def generateFormClass(self, entity, serType, arrayOfSerializer):
        name = f"\nclass {entity}s{serType}RecordSerializerTemplate(serializers.Serializer):"
        return strings.concatenate([name, *arrayOfSerializer], "\n") + "\n\n#======================================\n\n"



    def generateFormFields(self, model):
        array = []
        
        # Handle recursive call where model is actually o2oFieldsList
        if isinstance(model, list):
            for field in model:
                if isinstance(field, str):
                    array.append(f"    {field} = serializers.CharField(**charNullableOpts)")
            return array

        # Safely skip standard Django models that don't use DRM
        if not hasattr(model, 'objects') or not hasattr(model.objects, 'getMapper'):
            return None

        mapper = model.objects.getMapper()
        mt = mapper.master('abbreviation')
        masterTableKey = mapper.master('foreignKeyName')
        if mt not in schema:
            return None

        mtEntry = schema[mt]

        tbl = mapper.tableAbbreviation(model._meta.db_table)
        if tbl not in schema:
            return None

        tblEntry = schema[tbl]
        tmp = f"{mtEntry['model']}"
        entity = tmp[0].upper() + tmp[1:]
        serType = tblEntry['type']

        o2oFieldsList = None

        if entity not in self.dictionary:
            self.dictionary[entity] = { 'o2o': [], 'm2m': {}, 'rlc': {} }
            
        
        for field in model._meta.fields:
            pass
    
    # please complete the rest of the logic...
