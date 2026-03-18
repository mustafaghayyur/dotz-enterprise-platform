import importlib
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from core.helpers import pagination, crud, misc
from core.DRMcore.mappers.schema.main import schema

@api_view(['POST'])
def list(request, format=None):
    """
        Generic list endpoint for all models using QuerySetManager.
        
        Request body should contain:
        {
            'tbl': 'tata',  # table key to identify model from schema
            'selectors': ['field1', 'field2'],  # fields to select (optional)
            'conditions': {'field': 'value'},  # where conditions (optional)
            'ordering': [{'tbl': 'tata', 'col': 'name', 'sort': 'DESC'}],  # ordering (optional)
            'joins': {'inner|tbl1_col': 'tbl2_col'},  # join definitions (optional)
            'limit': {'page': 1, 'page_size': 20}  # pagination (optional)
            'translations': {'id': 'tata_id'}  # translations as specified by Django ORM (optional)
        }
    """
    try:
        postData = request.data
        
        # Validate that 'tbl' key exists to identify model
        if 'tbl' not in postData:
            raise ValidationError("Error 800: Missing required 'tbl' parameter to identify model.")
        
        tblKey = postData['tbl']
        
        # Validate table key exists in schema
        if tblKey not in schema:
            raise ValidationError(f"Error 801: Invalid table key '{tblKey}'. Not found in schema.")
        
        schemaEntry = schema[tblKey]
        
        # Dynamically load the model using importlib
        modelModule = importlib.import_module(schemaEntry['path'])
        Model = getattr(modelModule, schemaEntry['model'])
        mapper = Model.objects.getMapper()
        
        # Get serializer from DRM mappers based on table key
        # Dynamically get the appropriate mapper for serialization
        Serializer = mapper.serializers(tblKey, 'generic')


        # Handle pagination
        pgntn = pagination.assembleParamsForView(postData.get('limit', []), mapper.defaults('limit_value'))
        # Prepare limit parameter for fetch (format: [offset, page_size])
        paginatedLimit = [str(pgntn['offset']), str(pgntn['page_size'])]

        # Execute fetch using QuerySetManager
        records = (Model.objects.select(postData.get('selectors', None))
                   .where(postData.get('conditions', None))
                   .orderby(postData.get('ordering', None))
                   .join(postData.get('joins', None))
                   .limit(paginatedLimit)
                   .translate(postData.get('translations', None))
                   .enableCurrentUserRestrictions(request.user).fetch())
        
        # Serialize the results
        serialized = Serializer(records, many=True)
        
        # Determine if there are more records
        hasMore = pagination.determineHasMore(records, pgntn['page_size'])
        
        # Return response using standard response generator
        return Response(
            crud.generateResponse(
                serialized.data,
                pgntn['page'],
                pgntn['page_size'],
                hasMore
            )
        )
    
    except ValidationError as e:
        return Response(
            crud.generateError(e, "Validation errors have been caught."),
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            crud.generateError(e, "An error occurred while fetching records."),
            status=status.HTTP_400_BAD_REQUEST
        )

