from users.drm.schema import users
from tasks.drm.schema import tasks

# schema is made by merging all other mappers' schemas 
schema = users | tasks
