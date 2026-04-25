import os
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models
from core.helpers import strings
from core.DRMcore.mappers.schema.main import schema

class Command(BaseCommand):
    """
        to run command: 
         > python3 ./manage.py generateSchema
    """
    help = 'Generates valid schema definitions for all models/tables in system.'

    dictionary = {}

    def add_arguments(self, parser):
        pass
        #parser.add_argument('appLabel', type=str, help='App label (e.g., tasks)')

    def handle(self, *args, **kwargs):
        try:
            appList = apps.get_app_configs()
        
            for app in appList:
                if app.label not in ['tasks', 'users', 'tickets', 'documents', 'customers', 'core', 'restapi']: 
                    self.stderr.write(f" - skipping {app.label}")
                    continue
                
                content = self.processApp(appLabel=app.label)

                drmDir = os.path.join(app.path, 'drm')
                if not os.path.exists(drmDir):
                    os.makedirs(drmDir)

                with open(os.path.join(drmDir, 'schema.py'), "wt") as f:
                    f.write(content)

                self.stderr.write(self.style.SUCCESS(f"=================\nCompleted {app.label} schema generation.\n=================\n"))
        
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Schema Generation Process Interrupted: " + str(e)))

        
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
            self.generateSerializer(model)
            
        # once we have mapped all models...
        for entity in self.dictionary:
            for serType in self.dictionary[entity]:
                if serType == 'o2o':
                    if self.dictionary[entity][serType]:
                        serializerClass += self.generateSerializerClass(entity, serType, self.dictionary[entity][serType])
                        self.stderr.write(self.style.SUCCESS(f" - Added {entity}.{serType} serializer.\n"))
                else:
                    for name in self.dictionary[entity][serType]:
                        serializerClass += self.generateSerializerClass(name, serType, self.dictionary[entity][serType][name])
                        self.stderr.write(self.style.SUCCESS(f" - Added {entity}.{serType}.{name} serializer.\n"))

        return serializerClass


    def generateSerializerClass(self, entity, serType, arrayOfSerializer):
        name = f"\nclass {entity}s{serType}RecordSerializerTemplate(serializers.Serializer):"
        return strings.concatenate([name, *arrayOfSerializer], "\n") + "\n\n#======================================\n\n"



    def generateSerializer(self, model):
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
        tmp = f"{mtEntry['model']}s"
        entity = tmp[0].upper() + tmp[1:]
        serType = tblEntry['type']

        o2oFieldsList = None

        if entity not in self.dictionary:
            self.dictionary[entity] = { 'o2o': [], 'm2m': {}, 'rlc': {} }
            
        
        for field in model._meta.fields:
            fieldType = type(field)
            drfField = self.fieldMapping.get(fieldType, 'CharField')
            
            if field.get_attname() == masterTableKey and serType == 'o2o':
                continue

            # self.stderr.write(f" - inspecting field: {field.get_attname()}: {masterTableKey} ({serType})")

            # map out rest of field definition:
            if field.name == 'latest':
                argsList = 'latestChoiceOpts'
            else:
                argsList = self.argsMapping.get(fieldType, 'charNullableOpts')

            if drfField == 'DateTimeFieldForJS':
                component = ''
            else:
                component = 'serializers.'

            additionalArgs = ''

            if hasattr(field, 'max_length') and field.max_length:
                additionalArgs += f"max_length={field.max_length}, "
            if hasattr(field, 'min_length') and field.min_length:
                additionalArgs += f"min_length={field.min_length}, "

            if mapper.isCommonField(field.name):
                fieldName = f"{tbl}_{field.name}_id" if isinstance(field, models.ForeignKey) else f"{tbl}_{field.name}"
            else:
                fieldName = f"{field.name}_id" if isinstance(field, models.ForeignKey) else field.name

            array.append(f"    {fieldName} = {component}{drfField}({additionalArgs}**{argsList})")
        
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
    