#
# Freesound is (c) MUSIC TECHNOLOGY GROUP, UNIVERSITAT POMPEU FABRA
#
# Freesound is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# Freesound is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# Authors:
#     See AUTHORS file.
#

from django.core.management.base import BaseCommand
from utils.aws import report_ses_stats


class Command(BaseCommand):
    help = 'Retrieves email stats from AWS SES and reports it to graylog.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--short-term-datapoints',
            type=int,
            dest='n_datapoints',
            help="Number of datapoints to aggregate for short-term stats (cronjob interval / aws interval (15mins))",
        )

        parser.add_argument(
            '--long-term-sample-size',
            type=int,
            dest='sample_size',
            help="Number of datapoints to aggregate for short-term stats (cronjob interval / aws interval (15mins))",
        )

    def handle(self, *args, **options):
        report_ses_stats(sample_size=options['sample_size'], n_points=options['n_datapoints'])
