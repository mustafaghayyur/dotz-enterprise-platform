from rest_framework.response import Response
from rest_framework import status

from core.helpers import misc
from core.helpers.crud import generateError, generateResponse, isValidId
from core.helpers.pagination import assembleParamsForView, determineHasMore
from core.lib.state import State


class RLCOperations():
    def __init__(self, state: State):
        self.state = state
        self.mapper = self.state.get('mapper')

    def create(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        idKey = self.state.get('tbl') + '_' + self.mapper.column('id')
        
        serialized = GenericSerializer(data=data)
        if serialized.is_valid():
            dictionary = serialized.validated_data
            dictionary['user_id'] = self.state.get('user').id
            result = cruder.create(dictionary)
            if result:
                return Response(generateResponse({idKey: result.id}), status=status.HTTP_201_CREATED)
                
            raise Exception("Error 834: Could not determine create response.")
        else:
            return Response(generateError(serialized.errors, "Validation errors occured."), status=status.HTTP_400_BAD_REQUEST)
        
    def update(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        idKey = self.state.get('tbl') + '_' + self.mapper.column('id')

        serialized = GenericSerializer(data=data)
        if serialized.is_valid():
            result = cruder.update(serialized.validated_data)
            if result:
                return Response(generateResponse({idKey: result.id}), status=status.HTTP_200_OK)
                
            raise Exception("Error 833: Could not determine update response.")
        else:
            return Response(generateError(serialized.errors), status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self):
        """
            Delete RLC record bet its ID.
            @todo: add delateAll end-point as well, for all MT children
        """
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        idKey = self.state.get('tbl') + '_' + self.mapper.column('id')

        if isValidId(dict(data), idKey):
            cruder.delete(data.get(idKey))
            return Response(generateResponse({ idKey: data.get(idKey, None) }, additionalMsg=f'No errors occured while archiving [{self.state.get('tbl')}] record(s) with id matching: {data.get(idKey, None)}.'), status=status.HTTP_200_OK)
        
        raise Exception(f'Error 832: Record id not valid: [{data.get(idKey, None)}]. Delete aborted.')

    def read(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        fk_name = cruder.mapper.master('foreignKeyName')
        idKey = self.state.get('tbl') + '_' + self.mapper.column('id')
        request = self.state.get('request')
        requestType = None

        if data.get(idKey, None) is None and data.get(fk_name, None) is not None:
            requestType = 'byMtId'
            records = cruder.read({
                fk_name: data.get(fk_name),
            })
            serialized = GenericSerializer(records, many=True)
        
        if data.get(idKey, None) is not None and data.get(fk_name, None) is None:
            requestType = 'byId'
            records = cruder.read({
                idKey: data.get(idKey),
            })
            serialized = GenericSerializer(records)

        if requestType is None:
            raise Exception('Error 830: RLC read requests should only provide CT id or MT id.')        

        if requestType == 'byMtId':
            pgntn = assembleParamsForView(request.query_params)
            hasMore = determineHasMore(records, pgntn['page_size'])
            return Response(generateResponse(serialized.data, pgntn['page'], pgntn['page_size'], hasMore))
        
        if requestType == 'byId':
            return Response(generateResponse(serialized.data))
        
        raise Exception('Error 831: Something went wrong with RLC record(s) retrieval.')   
