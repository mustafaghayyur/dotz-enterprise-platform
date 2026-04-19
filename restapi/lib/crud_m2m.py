from rest_framework.response import Response
from rest_framework import status

from core.helpers import misc
from core.helpers.crud import generateError, generateResponse, isValidId
from core.helpers.pagination import assembleParamsForView, determineHasMore
from core.lib.state import State


class M2MOperations():
    def __init__(self, state: State):
        self.state = state
        self.mapper = self.state.get('mapper')

    def create(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        idField = self.state.get('tbl') + '_id'

        serialized = GenericSerializer(data=data)

        if serialized.is_valid():
            result = cruder.create(serialized.validated_data)

            if result:
                return Response(generateResponse({ idField: result.id }), status=status.HTTP_201_CREATED)

            raise Exception('Error 892: Created record could not be fetched.')
        else:
            return Response(generateError(serialized.errors, "Validation errors occured."), status=status.HTTP_400_BAD_REQUEST)
    

    def update(self):
        raise Exception('Error 891: M2M records cannot be updated.')


    def delete(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        
        serialized = GenericSerializer(data=data)
        
        if serialized.is_valid():
            cruder.delete(serialized.validated_data)
            return Response(generateResponse(dict(data), additionalMsg=f'No errors occured during record(s) removal with supplied data.'), status=status.HTTP_200_OK)
        else:
            return Response(generateError(serialized.errors, "Validation errors occured."), status=status.HTTP_400_BAD_REQUEST)


    def read(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        request = self.state.get('request')
        data = self.state.get('data')

        serialized = GenericSerializer(data=data)

        if serialized.is_valid():
            records = CrudClass(current_user=self.state.get('user')).read(serialized.validated_data)
            if records:
                if isinstance(records, list) and len(records) > 1:
                    serialized = GenericSerializer(records, many=True)
                    pgntn = assembleParamsForView(request.query_params)
                    hasMore = determineHasMore(records, pgntn['page_size'])
                    misc.log(serialized.data, 'Reading raw record1')
                    return Response(generateResponse(serialized.data, pgntn['page'], pgntn['page_size'], hasMore))
                else:
                    # Extract the single record from the list so DRF serializes the object, not the list
                    serialized = GenericSerializer(records[0])
                    misc.log([records[0], serialized.data], 'Reading raw record2')
                    return Response(generateResponse(serialized.data))
                
            return Response(generateResponse([], additionalMsg=['No records found']))
        else:
            return Response(generateError(serialized.errors, "Validation errors occured."), status=status.HTTP_400_BAD_REQUEST)
