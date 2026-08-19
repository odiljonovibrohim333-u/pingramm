from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
User = get_user_model()

# O'z user'ingni top (username'ingni yoz)
u = User.objects.filter(username='ibrohim').first()

# Parolni tekshir
print(u)
print(u.is_active)
print(u.check_password('ibrohim333'))   # shu parolni yozganmiding?