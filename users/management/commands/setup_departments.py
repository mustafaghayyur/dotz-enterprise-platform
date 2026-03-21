from django.core.management.base import BaseCommand
from users.models import User, Department, DepartmentUser
import random

class Command(BaseCommand):
    help = 'Create departments and assign users to them'

    def handle(self, *args, **options):
        # First, update user levels
        self.stdout.write('Updating user levels to 10-50 range...\n')

        users = list(User.objects.all())
        total_users = len(users)

        # 60% stay at level 10
        level_10_count = int(total_users * 0.6)
        level_10_users = random.sample(users, level_10_count)

        # Remaining 40% get levels 20, 30, 40, 50
        remaining_users = [u for u in users if u not in level_10_users]
        higher_levels = [20, 30, 40, 50]

        for user in level_10_users:
            user.user_level = 10
            user.save()

        for user in remaining_users:
            user.user_level = random.choice(higher_levels)
            user.save()

        self.stdout.write(f'Updated {total_users} users with new level distribution')

        # Create departments
        self.stdout.write('\nCreating 6 departments with parent-child relationships...\n')

        # Get a random creator for departments
        creator = User.objects.filter(user_level__gte=20).first()
        if not creator:
            creator = User.objects.first()

        # Create parent departments first
        parent1 = Department.objects.create(
            name='Engineering',
            description='Software development and technical operations',
            creator=creator
        )

        parent2 = Department.objects.create(
            name='Operations',
            description='Business operations and administration',
            creator=creator
        )

        # Create child departments
        departments_data = [
            {'name': 'Frontend Development', 'description': 'UI/UX and frontend technologies', 'parent': parent1},
            {'name': 'Backend Development', 'description': 'Server-side development and APIs', 'parent': parent1},
            {'name': 'Quality Assurance', 'description': 'Testing and quality control', 'parent': parent1},
            {'name': 'Human Resources', 'description': 'People management and recruitment', 'parent': parent2},
        ]

        child_departments = []
        for dept_data in departments_data:
            dept = Department.objects.create(
                name=dept_data['name'],
                description=dept_data['description'],
                creator=creator,
                parent=dept_data['parent']
            )
            child_departments.append(dept)

        all_departments = [parent1, parent2] + child_departments

        self.stdout.write('Created departments:')
        for dept in all_departments:
            parent_name = f" (child of {dept.parent.name})" if dept.parent else " (parent)"
            self.stdout.write(f'  - {dept.name}{parent_name}')

        # Assign users to departments randomly
        self.stdout.write('\nAssigning users to departments randomly...\n')

        users = list(User.objects.all())
        assignments_created = 0

        for user in users:
            # Each user gets 1-3 random department assignments
            num_assignments = random.randint(1, 3)
            assigned_departments = random.sample(all_departments, num_assignments)

            for dept in assigned_departments:
                DepartmentUser.objects.get_or_create(
                    user=user,
                    department=dept,
                    defaults={'latest': 1}
                )
                assignments_created += 1

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully completed setup!'))
        self.stdout.write(f'- Updated {total_users} user levels')
        self.stdout.write(f'- Created {len(all_departments)} departments')
        self.stdout.write(f'- Created {assignments_created} department-user assignments')

        # Show level distribution
        self.stdout.write('\nNew user level distribution:')
        for level in [10, 20, 30, 40, 50]:
            count = User.objects.filter(user_level=level).count()
            self.stdout.write(f'  Level {level}: {count} users')

        # Show department assignments
        self.stdout.write('\nDepartment membership:')
        for dept in all_departments:
            count = DepartmentUser.objects.filter(department=dept).count()
            dept_type = "parent" if not dept.parent else "child"
            self.stdout.write(f'  {dept.name} ({dept_type}): {count} members')