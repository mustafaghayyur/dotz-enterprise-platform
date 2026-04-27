import os
import sys
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    """
        to run command: 
         > python3 ./manage.py schemaupdates
    """
    help = 'Wrapper command for schema updates: makemigrations -> migrate -> generateSchema -> generateSerializers'

    def load_env(self):
        """Loads environment variables from static/.env if available."""
        base_dir = str(getattr(settings, 'BASE_DIR', os.getcwd()))
        env_path = os.path.join(base_dir, 'static', '.env')
        
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    # Ignore comments and empty lines
                    if line and not line.startswith('#') and '=' in line:
                        key, val = line.split('=', 1)
                        os.environ[key.strip()] = val.strip().strip("'\"")

    def handle(self, *args, **options):
        # Setup environment variables from static/.env
        self.load_env()
        
        base_dir = str(getattr(settings, 'BASE_DIR', os.getcwd()))
        manage_py = os.path.join(base_dir, 'manage.py')
        
        # Use current venv's python unless an explicit PYTHON_EXEC is defined in the .env file.
        python_exec = os.environ.get('PYTHON_EXEC', sys.executable)

        self.stdout.write(self.style.WARNING("\n--- Step 1: Running makemigrations ---"))
        # Using subprocess guarantees fully interactive prompts are passed natively to the user
        result = subprocess.run([python_exec, manage_py, 'makemigrations'])
        if result.returncode != 0:
            self.stderr.write(self.style.ERROR("makemigrations failed or was interrupted. Aborting schema updates."))
            return

        self.stdout.write("\n")
        confirm = input("Do you want to proceed with 'migrate'? (y/N): ").strip().lower()
        if confirm != 'y':
            self.stdout.write(self.style.ERROR("Migration aborted by user. Exiting..."))
            return

        self.stdout.write(self.style.WARNING("\n--- Step 2: Running migrate ---"))
        result = subprocess.run([python_exec, manage_py, 'migrate'])
        if result.returncode != 0:
            self.stderr.write(self.style.ERROR("migrate failed or was interrupted. Aborting schema updates."))
            return

        self.stdout.write(self.style.WARNING("\n--- Step 3: Running generateSchema ---"))
        result = subprocess.run([python_exec, manage_py, 'generateSchema'])
        if result.returncode != 0:
            self.stderr.write(self.style.ERROR("generateSchema failed. Aborting schema updates."))
            return

        self.stdout.write(self.style.WARNING("\n--- Step 4: Running generateSerializers ---"))
        result = subprocess.run([python_exec, manage_py, 'generateSerializers'])
        if result.returncode != 0:
            self.stderr.write(self.style.ERROR("generateSerializers failed."))
            return

        self.stdout.write(self.style.WARNING("\n--- Step 5: Running generateFormTemplates ---"))
        result = subprocess.run([python_exec, manage_py, 'generateFormTemplates'])
        if result.returncode != 0:
            self.stderr.write(self.style.ERROR("generateFormTemplates failed."))
            return

        self.stdout.write(self.style.SUCCESS("\n=======================================\n Schema updates completed successfully! \n=======================================\n"))
