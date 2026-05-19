"""
Run once to set up the database:
  python setup.py
"""
import os
import subprocess
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')


def run(cmd):
    print(f'\n>>> {cmd}')
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f'ERROR: command failed with exit code {result.returncode}')
        sys.exit(1)


if __name__ == '__main__':
    run('python manage.py makemigrations users auth_app events bookings payments')
    run('python manage.py migrate')
    print('\n✅ Database ready!')
    print('\nRun: python manage.py createsuperuser')
    print('Then: python manage.py runserver')
