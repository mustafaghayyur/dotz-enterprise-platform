"""
This script is a counterpart to ./manage.py frontendbuild command.
It will be run every time we build the project for browser 
testing/deployment.
"""

import os
import shlex
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    """
        to run command: 
         > python3 ./manage.py backendbuild
    """
    help = 'Backend build operations to run after npm run build.'

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
        self.load_env()

        self.stdout.write(self.style.WARNING("--- Running Backend Build Operations ---"))
        
        restart_cmd_str = os.environ.get('SERVER_RESTART_OPERATION', 'httpd -k restart')
        restart_cmd = shlex.split(restart_cmd_str)
        if not restart_cmd:
            restart_cmd = ['httpd', '-k', 'restart']
            restart_cmd_str = 'httpd -k restart'

        self.stdout.write(f"Restarting server: {restart_cmd_str}...")
        try:
            result = subprocess.run(restart_cmd, capture_output=True, text=True)
            if result.returncode == 0:
                self.stdout.write(self.style.SUCCESS("Server restarted successfully."))
            else:
                self.stderr.write(self.style.ERROR(f"Failed to restart server. Error:\n{result.stderr}"))
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"Command '{restart_cmd[0]}' not found. Is it installed and in your PATH?"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {str(e)}"))
