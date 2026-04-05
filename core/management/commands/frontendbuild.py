import os
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Frontend build: Generate index.js for components in static/{app}/js/components/'

    def add_arguments(self, parser):
        parser.add_argument('app', type=str, help='The app name (e.g., tasks)')

    def handle(self, *args, **options):
        app = options['app']
        project_root = Path(__file__).resolve().parents[3]
        components_dir = project_root / 'static' / app / 'js' / 'components'
        if not components_dir.exists():
            raise CommandError(f'Components directory does not exist: {components_dir}')

        index_file = components_dir / 'index.js'

        # Collect all .js files recursively, excluding index.js
        js_files = [f for f in components_dir.rglob('*.js') if f.name != 'index.js']

        if not js_files:
            self.stdout.write('No .js files found in components directory.')
            return

        # Generate imports and exports
        imports = []
        exports = []

        for js_file in js_files:
            relative_path = js_file.relative_to(components_dir)
            
            # Module name: path without .js, converted to camelCase
            path_str = str(relative_path.with_suffix(''))
            parts = path_str.split(os.sep)
            module_name = parts[0] + ''.join(word[:1].upper() + word[1:] for word in parts[1:])
            
            # Import identifier: same as module_name since camelCase
            import_identifier = module_name
            # Import path
            import_path = './' + str(relative_path).replace(os.sep, '/')
            imports.append(f"import {import_identifier} from '{import_path}';")
            exports.append(f"    {module_name}: {import_identifier}")

        # Write index.js content
        content = '\n'.join(imports) + '\n\n'
        content += 'export default {\n'
        content += ',\n'.join(exports) + '\n'
        content += '};\n'

        with open(index_file, 'w') as f:
            f.write(content)

        self.stdout.write(self.style.SUCCESS(f'Successfully generated {index_file}'))