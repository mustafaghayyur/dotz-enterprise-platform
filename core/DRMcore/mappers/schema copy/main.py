from .departments import departments
from .tasks import tasks
from .workspaces import workspaces
from .users import users

# schema is made by merging all other mappers' schemas 
schema = departments | tasks | workspaces | users
