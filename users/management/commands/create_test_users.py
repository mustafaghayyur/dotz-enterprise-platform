from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User, UserProfile
import random

class Command(BaseCommand):
    help = 'Create 20 random test users with profiles'

    def handle(self, *args, **options):
        # Realistic first and last names
        first_names = [
            'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily',
            'James', 'Maria', 'William', 'Jennifer', 'Christopher', 'Linda', 'Daniel',
            'Patricia', 'Matthew', 'Susan', 'Joseph', 'Margaret', 'Andrew', 'Dorothy',
            'Joshua', 'Barbara', 'Nicholas', 'Helen', 'Anthony', 'Sandra', 'Mark', 'Donna'
        ]

        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
            'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
            'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
        ]

        # Office locations
        office_locations = [
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
            'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
            'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC'
        ]

        # Phone number generators
        def generate_office_phone():
            return f"({random.randint(200,999)})-{random.randint(200,999)}-{random.randint(1000,9999)}"

        def generate_cell_phone():
            return f"({random.randint(200,999)})-{random.randint(200,999)}-{random.randint(1000,9999)}"

        def generate_extension():
            return f"{random.randint(100,999)}"

        users_created = 0

        self.stdout.write('Creating 20 random test users...\n')

        for i in range(20):
            # Generate user data
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            username = f"{first_name.lower()}.{last_name.lower()}{random.randint(1,99)}"

            # Ensure unique username
            while User.objects.filter(username=username).exists():
                username = f"{first_name.lower()}.{last_name.lower()}{random.randint(1,999)}"

            email = f"{username}@company.com"

            # Random user level (1-5 for testing variety)
            user_level = random.randint(1, 5)

            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                user_level=user_level,
                is_staff=random.choice([True, False]) if user_level >= 3 else False,
                is_active=True
            )

            # Create user profile with realistic data
            legal_first = first_name if random.choice([True, False]) else f"{first_name} {random.choice(['A.', 'B.', 'C.', 'D.'])}"
            legal_last = last_name

            profile = UserProfile.objects.create(
                user=user,
                legal_first_name=legal_first,
                legal_last_name=legal_last,
                office_phone=generate_office_phone() if random.choice([True, False]) else None,
                office_ext=generate_extension() if random.choice([True, False]) else None,
                cell_phone=generate_cell_phone() if random.choice([True, False]) else None,
                home_phone=generate_office_phone() if random.choice([True, False]) else None,
                office_location=random.choice(office_locations) if random.choice([True, False]) else None
            )

            users_created += 1
            self.stdout.write(f'  Created user: {username} ({first_name} {last_name}) - Level {user_level}')

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {users_created} test users with profiles!'))
        self.stdout.write('\nUser levels distribution:')
        for level in range(1, 6):
            count = User.objects.filter(user_level=level).count()
            if count > 0:
                self.stdout.write(f'  Level {level}: {count} users')