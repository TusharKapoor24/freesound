# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-06-19 21:16
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sounds', '0007_auto_20161018_1809'),
    ]

    operations = [
        migrations.CreateModel(
            name='RandomSound',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('sound', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sounds.Sound')),
            ],
        ),
    ]
