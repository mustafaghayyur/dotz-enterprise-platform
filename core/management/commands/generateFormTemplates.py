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

Notes: 
 - please see inline comments for furtherr clarity
 - all system-fields like 'create_time'....'delete_time' can be made hidden fields. System fields are basically 'commonFields' referred to in the mapper.commonFields() below...
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

    fieldMapping = {
        models.CharField: 'CharField',
        models.TextField: 'CharField',
        models.IntegerField: 'IntegerField',
        models.PositiveIntegerField: 'IntegerField',
        models.DateTimeField: 'DateTimeField',
        models.DateField: 'DateField',
        models.BooleanField: 'BooleanField',
        models.ForeignKey: 'ModelChoiceField',
        models.EmailField: 'EmailField',
        models.SmallIntegerField: 'IntegerField',
        models.PositiveSmallIntegerField: 'IntegerField',
        models.FloatField: 'FloatField',
        models.DecimalField: 'DecimalField',
        models.JSONField: 'JSONField',
        models.UUIDField: 'UUIDField',
    }

    argsMapping = {
        models.CharField: 'required=False',
        models.TextField: 'required=False',
        models.IntegerField: 'required=False',
        models.PositiveIntegerField: 'required=False',
        models.DateTimeField: 'required=False, widget=crud.DateTimeLocalInput()', 
        models.DateField: 'required=False',
        models.BooleanField: 'required=False',
        models.ForeignKey: 'required=False', 
        models.EmailField: 'required=False',
        models.SmallIntegerField: 'required=False',
        models.PositiveSmallIntegerField: 'required=False',
        models.FloatField: 'required=False',
        models.DecimalField: 'required=False',
        models.JSONField: 'required=False',
        models.UUIDField: 'required=False',
    }

    dictionary = {}

    def handle(self, *args, **kwargs):
        try:
            appList = apps.get_app_configs()

            for app in appList:
                if app.label not in ['tasks', 'users', 'tickets', 'documents', 'customers', 'core', 'restapi']: 
                    self.stderr.write(f" - skipping {app.label}")
                    continue
                
                imports = [
                    'from django import forms',
                    'from core.lib.FormsParent import Forms',
                    f'from {app.label}.models import *',
                    'from core.helpers import crud'
                ]
                content = strings.concatenate(imports, "\n") + "\n\n"
                content += self.processApp(appLabel=app.label)

                formsDir = os.path.join(app.path, 'lib', 'forms')
                if not os.path.exists(formsDir):
                    os.makedirs(formsDir)

                with open(os.path.join(formsDir, 'templates.py'), "wt") as f:
                    f.write(content)

                self.stderr.write(self.style.SUCCESS(f"=================\nCompleted {app.label} form templates generation.\n=================\n"))
        
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Form Templates Generation Process Interrupted: " + str(e)))

        
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
                        self.stderr.write(self.style.SUCCESS(f" - Added {entity}.{serType} form.\n"))
                else:
                    for name in self.dictionary[entity][serType]:
                        serializerClass += self.generateFormClass(name, serType, self.dictionary[entity][serType][name])
                        self.stderr.write(self.style.SUCCESS(f" - Added {entity}.{serType}.{name} form.\n"))

        return serializerClass


    def generateFormClass(self, entity, serType, arrayOfFields):
        name = f"\nclass {entity}sEditForm(Forms):"
        if not arrayOfFields:
            arrayOfFields = ["    pass"]
        return strings.concatenate([name, *arrayOfFields], "\n") + "\n\n#======================================\n\n"



    def generateFormFields(self, model):
        array = []
        
        if isinstance(model, list):
            for field in model:
                if isinstance(field, str):
                    array.append(f"    {field} = forms.CharField(required=False)")
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
            fieldType = type(field)
            formField = self.fieldMapping.get(fieldType, 'CharField')
            
            if field.get_attname() == masterTableKey and serType == 'o2o':
                continue

            if mapper.isCommonField(field.name):
                fieldName = f"{tbl}_{field.name}_id" if isinstance(field, models.ForeignKey) else f"{tbl}_{field.name}"
            else:
                fieldName = f"{field.name}_id" if isinstance(field, models.ForeignKey) else field.name

            if field.name == 'id':
                fieldName = f"{tbl}_id"
                array.append(f"    {fieldName} = forms.CharField(widget=forms.HiddenInput(), required=False)")
                continue
                
            if mapper.isCommonField(field.name):
                array.append(f"    {fieldName} = forms.CharField(widget=forms.HiddenInput(), required=False)")
                continue

            if field.name == 'parent' and isinstance(field, models.ForeignKey):
                rel_model = field.related_model.__name__
                array.append(f"    {fieldName} = forms.ModelChoiceField(queryset={rel_model}.objects.none(), required=False, empty_label=\"Select One\", label=\"Parent {rel_model}\")")
                continue

            if field.name == 'creator' and isinstance(field, models.ForeignKey):
                fieldName = f"creator_id"
                array.append(f"    {fieldName} = forms.CharField(widget=forms.HiddenInput(), required=False)")
                continue

            if isinstance(field, models.ForeignKey):
                rel_model = field.related_model.__name__
                array.append(f"    {fieldName} = forms.ModelChoiceField(queryset={rel_model}.objects.none(), required=False)")
                continue

            base_args = self.argsMapping.get(fieldType, 'required=False')
            extra_args = []
            
            if hasattr(field, 'max_length') and field.max_length:
                if fieldType in [models.CharField, models.TextField] and field.max_length > 1999:
                    extra_args.append("widget=forms.Textarea")
                else:
                    extra_args.append(f"max_length={field.max_length}")
            
            if hasattr(field, 'min_length') and field.min_length:
                extra_args.append(f"min_length={field.min_length}")
                    
            args_str = base_args
            if extra_args:
                args_str = ", ".join(extra_args) + ", " + base_args

            array.append(f"    {fieldName} = forms.{formField}({args_str})")
            
        if serType == 'o2o':
            orig = self.dictionary[entity][serType]
            orig.extend(array)
            self.dictionary[entity][serType] = orig
            return None
        else:
            tmp = model.__name__
            name = tmp[0].upper() + tmp[1:]
            self.dictionary[entity][serType][name] = array
            return None
