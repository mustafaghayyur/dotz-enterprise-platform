from rest_framework.response import Response
from rest_framework import status

from core.helpers import crud, misc
from core.lib.state import State


class O2OOperations():
    def __init__(self, state: State):
        self.state = state
        self.mapper = self.state.get('mapper')

    def create(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        serialized = GenericSerializer(data=self.state.get('data'))

        if serialized.is_valid():
            result = cruder.create(serialized.validated_data)

            if result:
                record = cruder.fullRecord(result.id)
                retrievedSerialized = GenericSerializer(record[0])
                return Response(crud.generateResponse(retrievedSerialized.data), status=status.HTTP_201_CREATED)
            
            raise Exception("Error 821: Could not determine create response.")
        else:
            return Response(crud.generateError(serialized.errors, "Validation errors occured."), status=status.HTTP_400_BAD_REQUEST)
    

    def update(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        serialized = GenericSerializer(data=self.state.get('data'))

        if serialized.is_valid():
            result = cruder.update(serialized.validated_data)
            
            if result:
                record = cruder.fullRecord(result.id)
                retrievedSerialized = GenericSerializer(record[0])
                return Response(crud.generateResponse(retrievedSerialized.data), status=status.HTTP_200_OK)
                
            raise Exception("Error 822: Could not determine update response.")
        else:
            return Response(crud.generateError(serialized.errors), status=status.HTTP_400_BAD_REQUEST)


    def delete(self):
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        tbl = self.state.get('tbl')
        idField = f'{tbl}_id'
        
        if crud.isValidId(dict(data), idField):
            cruder.delete(data.get(idField, None))
            return Response(crud.generateResponse({'messages': f'Record(s) with id matching {data.get(idField, None)} have been archived in system.'}), status=status.HTTP_200_OK)
        
        raise Exception('Error 823: Record id not valid. Delete aborted.')


    def read(self):
        GenericSerializer = self.state.get('serializerClass')
        CrudClass = self.state.get('crudClass')
        cruder = CrudClass(current_user=self.state.get('user'))
        data = self.state.get('data')
        tbl = self.state.get('tbl')
        idField = f'{tbl}_id'
        if crud.isValidId(dict(data), idField):
            record = cruder.fullRecord(data.get(idField, None))
            if record:
                serialized = GenericSerializer(record[0])
                return Response(crud.generateResponse(serialized.data))
            
            raise Exception('Error 824: No records found matching id: ' + data.get(idField, None))
        
        raise Exception('Error 825: Record ID not valid.')
     