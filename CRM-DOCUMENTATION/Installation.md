# Installation:

 1) Setup Python 3.14+: compatibility with 3.13 might be possible, but requires further testing.

 2) In an appropriate location, setup a Python virtual environment to run your application from. See internet for setting up virtual environments. Open your commandline-utility, and enter cd into your preferred working location and:

   > cd /path/to/dev/env/

   > python -m venv pyEnv

 3) Assuming you named your virtual environment pyEnv, in your command-line terminal:

    > source ../path/to/pyEnv/bin/activate

    > (pyEnv) pip install Django==5.2.7

    > (pyEnv): python pip install Django

    These steps will activate your virtual env and allow you install Django into that env.

    We are using Django version 5.2 at time of development.

 4) While still in your virtualEnv, proceed to setup a new django project:

    > (pyEnv): django-admin startproject project

 5) Once setup... you are ready to install our CRM project inside /path/to/django/project. CD into the neawly created project directory, and remove the pre-existing 'project' SUB-DIRECTORY. 

 6) Download our CRM project into the 'project' parent directory (you should use our recommended install method). Once downloaded, ensure all files/directories match the git-repo online.

 7) Open project/settings-template.py, adjust all settings to match your dev environment, then save the modified file as 'settings.py', removing the -template sufiix from file-name.

 8) In your terminal, run:

   > pyhton manage.py

   This should output the default selection screen highliting all available commands the django manage.py script allows. If this command-list shows up with out any errors being thrown, you have successfully configured Dotz-CRM.

 9) Run mugrations in the terminal:

   > python manage.py migrate

  This will ensure all migrations are run in your configured Database.

 10) You are now ready to run the CRM in your current dev environment. Launch the CRM app using WSGI or equivalent service and the Dotz CRM should appear! 

 11) Create a super user using @todo add init setup operations and instructions here.


 ## Setting up first System admin user:
Login to your preferred MySQL administration suite. Create a new record with the following pieces of information:

 1) Insert New Row: Add a new record with the following fields:

   > id: Auto-increment or a unique number. (leave empty)
 
   > username: Your chosen username (e.g., sysadmin).
 
   > email: Your email (e.g., admin@example.com).
 
   > password: This must be a hashed password! You can generate one by running python manage.py shell and using from django.contrib.auth.hashers import make_password; make_password('your_strong_password'). Copy the output.

   > is_superuser: Set to 1 (True).

   > is_staff: Set to 1 (True).

   > is_active: Set to 1 (True).

   > date_joined: Current date/time (leave empty for auto-fill) @todo confirm auto-fill behaviour

   > first_name, last_name, user_permissions, groups, etc.: Can be left empty or set appropriately.

   > user_level: set to 99 for system-admin level access.

   > Save: Click "Go" or "Save" to insert the record.

   > Access Admin: Navigate to your Django admin (/admin/) and log in with your new username and hashed password. 

