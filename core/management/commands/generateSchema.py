import os
import pprint
import re
from django.core.management.base import BaseCommand
from django.apps import apps
#from django.db import models



class Command(BaseCommand):
    """
        to run command: 
         > python3 ./manage.py generateSchema
    """
    help = 'Generates valid schema definitions for all models/tables in system.'
    errors = []

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **kwargs):
        processed_apps = []
        try:
            appList = apps.get_app_configs()
        
            for app in appList:
                if app.label not in ['tasks', 'users', 'tickets', 'documents', 'customers', 'core', 'restapi']: 
                    self.stderr.write(f" - skipping {app.label}")
                    continue
                
                content = self.processApp(appLabel=app.label)
                if not content:
                    continue

                drmDir = os.path.join(app.path, 'drm')
                if not os.path.exists(drmDir):
                    os.makedirs(drmDir)

                with open(os.path.join(drmDir, 'schema.py'), "wt") as f:
                    f.write(content)

                processed_apps.append(app.label)
                self.stderr.write(self.style.SUCCESS(f"=================\nCompleted {app.label} schema generation.\n=================\n"))
        
            # Generate the main schema file
            self.generateMainSchemaFile(processed_apps)

            for error in self.errors:
                self.stderr.write(self.style.ERROR(error))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Schema Generation Process Interrupted: " + str(e)))

    def generateMainSchemaFile(self, processed_apps):
        core_schema_dir = os.path.join(apps.get_app_config('core').path, 'DRMcore', 'mappers')
        if not os.path.exists(core_schema_dir):
            os.makedirs(core_schema_dir)
            
        filepath = os.path.join(core_schema_dir, 'schema.py')
        
        imports = [f"from {app}.drm.schema import {app}" for app in processed_apps]
        merges = " | ".join(processed_apps)
        
        content = "\n".join(imports) + "\n\n"
        content += "# schema is made by merging all other mappers' schemas \n"
        content += f"schema = {merges}\n"

        with open(filepath, "wt") as f:
            f.write(content)
        self.stderr.write(self.style.SUCCESS(f"=================\nCompleted main schema generation at {filepath}.\n=================\n"))
        
    def processApp(self, **kwargs):
        appLabel = kwargs['appLabel']
        app_schema = {}

        try:
            modelsList = apps.get_app_config(appLabel).get_models()
        except LookupError:
            self.stderr.write(self.style.ERROR(f"Models for {appLabel} not found."))
            return ""

        for model in modelsList:    
            result = self.generateSchemaInfo(model)
            if result:
                tbl_code, info = result
                app_schema[tbl_code] = info
                self.stderr.write(self.style.SUCCESS(f" - Added {appLabel}.{model.__name__} schema definition.\n"))

        if not app_schema:
            return ""

        return self.generateSchemaCode(appLabel, app_schema)

    def generateSchemaCode(self, appLabel, app_schema):
        # Use pprint to output a cleanly formatted Python dictionary
        formatted_dict = pprint.pformat(app_schema, indent=4, width=100, sort_dicts=False)
        code = f"\n{appLabel} = {formatted_dict}\n"
        return code

    def generateSchemaInfo(self, model):
        # Safely skip standard Django models that don't use DRM
        if not hasattr(model, 'objects') or not hasattr(model.objects, 'getMapper'):
            return None

        docstring = model.__doc__ or ""
        tbl = '#ERROR'

        try:
            mapper = model.objects.getMapper()
            tbl = mapper.tableAbbreviation(model._meta.db_table)
        except Exception as e:
            tbl = '#ERROR'
        
        # Attempt to parse 'o2o', 'm2m', 'rlc' from docstring
        model_type = '#ERROR'
        match = re.search(r'\b(o2o|m2m|rlc)\b', docstring.lower())
        if match:
            model_type = match.group(1)

        info = {
            'table': model._meta.db_table,
            'model': model.__name__,
            'path': model.__module__,
            'type': model_type,
            'cols': [field.column for field in model._meta.fields],
        }

        if tbl == '#ERROR' or tbl is None:
            tblMatch = re.search(r'#(\w{4})#', docstring)
            if tblMatch:
                tbl = tblMatch.group(1)
            else:
                tbl = '#ERROR - ' + model._meta.db_table
                self.errors.append(' - Could not get tbl-code for table: ' + model._meta.db_table)
        
        if model_type == '#ERROR':
            self.errors.append('Could not determine rel-type for table: ' + model._meta.db_table)

        return tbl, info