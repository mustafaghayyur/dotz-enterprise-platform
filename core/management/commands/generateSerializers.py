import importlib
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models
from core.helpers import strings
from core.DRMcore.mappers.schema.main import schema

class Command(BaseCommand):
    help = 'Generates boilerplate DRF serializer code for a given app and model.'

    # Map Django model fields to DRF Serializer fields
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
    }

    dictionary = {}

    def add_arguments(self, parser):
        parser.add_argument('appLabel', type=str, help='App label (e.g., tasks)')

    def handle(self, *args, **kwargs):
        appList = apps.get_app_configs()
        imports = ['from rest_framework.serializers import *', 'from restapi.validators.generic import *']
    
        for app in appList:
            content = strings.concatenate(imports, "\n") + "\n\n"
            content += self.processApp(appLabel=app.label)

            with open(app.path + '/validators/templates.py', "wt") as f:
                f.write(content)
        

        
    def processApp(self, **kwargs):
        appLabel = kwargs['appLabel']

        try:
            modelsList = apps.get_app_config('your_appLabel').get_models()
        except LookupError:
            self.stderr.write(self.style.ERROR(f"Models for {appLabel} not found."))
            return
        
        # self.style.SUCCESS(f"\n")
    

        for model in modelsList:    
            [enitity, serType, fields] = self.generateSerializer(model)
            
        # once we have mapped all models...
        for entity in self.dictionary:
            for serType in self.dictionary[entity]:
                if serType == 'o2o':
                    serializerClass += self.generateSerializerClass(entity, serType, self.dictionary[entity][serType])
                else:
                    for name in self.dictionary[entity][serType]:
                        serializerClass += self.generateSerializerClass(name, serType, self.dictionary[entity][serType][name])

        return serializerClass


    def generateSerializerClass(self, entity, serType, arrayOfSerializer):
        name = f"\nclass {entity}s{serType}RecordSerializerTemplate(Serializer):"
        return strings.concatenate([name, *arrayOfSerializer], "\n") + "\n\n#======================================\n\n"



    def generateSerializer(self, model):
        array = []
        mapper = model.objects.getMapper()
        mt = mapper.master('tbl')
        mtEntry = schema[mt]
        mtModule = importlib.import_module(mtEntry['path'])
        mtModel = getattr(mtModule, mtEntry['model'])

        tbl = mapper.tableAbbreviation(model._meta.db_table)
        tblEntry = schema[tbl]
        
        tmp = f'{mtEntry['model']}s'
        entity = tmp[0].upper() + tmp[1:]
        serType = tblEntry['type']

        o2oFieldsList = None

        if entity not in self.dictionary:
            self.dictionary[entity] = { 'o2o': [], 'm2m': {}, 'rlc': {} }
            o2oFieldsList = mapper.generateO2OFields()
            self.dictionary[entity]['o2o'] = self.generateSerializer(o2oFieldsList)
        
        for field in model._meta.fields:
            fieldType = type(field)
            drfField = self.fieldMapping.get(fieldType, 'CharField')
            
            # Build kwargs dynamically
            kwargsList = []
            if field.null:
                kwargsList.append("allow_null=True")
            kwargsList.append(f"required={not field.blank and not field.null}")
            
            if hasattr(field, 'max_length') and field.max_length:
                kwargsList.append(f"max_length={field.max_length}")

            kwargsStr = ", ".join(kwargsList)
            if mapper.isCommonField(field.name):
                fieldName = f"{tbl}_{field.name}_id" if isinstance(field, models.ForeignKey) else f"{tbl}_{field.name}"
            else:
                fieldName = f"{field.name}_id" if isinstance(field, models.ForeignKey) else field.name

            array.append(f"    {fieldName} = {drfField}({kwargsStr})")
        
        if serType == 'o2o':
            orig = self.dictionary[entity][serType]
            orig.extend(array)
            self.dictionary[entity][serType] = orig
            return [entity, serType, self.dictionary[entity][serType]]
        
        else:
            tmp = model.__name__
            name = tmp[0].upper() + tmp[1:]
            self.dictionary[entity][serType][name] = array
            return [entity, serType, self.dictionary[entity][serType][name]]
        
        return None
