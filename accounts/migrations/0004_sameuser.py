# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-10-21 11:22
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Count


def populate_sameuser(apps, schema_editor):
    User = apps.get_model("auth", "User")
    SameUser = apps.get_model("accounts", "SameUser")

    # All user accounts who have duplicate emails
    dup_users = User.objects.values("email").annotate(num_email=Count('email')).filter(num_email__gt=1).exclude(email="")

    for us in dup_users:
        uss = User.objects.filter(email=us["email"]).order_by('-last_login').all()
        # The account for this email which has logged in most recently
        u1 = uss[0]
        # All others (could be more than 2)
        for u in uss[1:]:
            SameUser.objects.create(main_user=u1, main_orig_email=u1.email, secondary_user=u, secondary_orig_email=u.email)
            email = u.email
            email = "%s@freesound.org" % (email.replace("@", "%"), )
            u.email = email
            u.save()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0003_auto_20160914_1100'),
    ]

    operations = [
        migrations.CreateModel(
            name='SameUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_orig_email', models.CharField(max_length=200)),
                ('secondary_orig_email', models.CharField(max_length=200)),
                ('main_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('secondary_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.RunPython(populate_sameuser, migrations.RunPython.noop)
    ]
