from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from chemical_tracker.models import Chemical, Recommendation
from logbook.models import Expense, Sale


class ApiAuthTests(TestCase):
    def test_api_requires_authentication(self):
        url = reverse('api:logbook_summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)


class LogbookSummaryApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='apiuser', password='secret123')
        self.client.login(username='apiuser', password='secret123')

    def test_logbook_summary_returns_user_totals(self):
        Expense.objects.create(user=self.user, item='Seed', amount_spent=100, date='2026-04-01')
        Sale.objects.create(user=self.user, product='Tomatoes', amount_earned=250, date='2026-04-02')

        response = self.client.get(reverse('api:logbook_summary'))
        self.assertEqual(response.status_code, 200)

        payload = response.json()
        self.assertIn('totals', payload)
        self.assertEqual(payload['totals']['spent'], 100.0)
        self.assertEqual(payload['totals']['earned'], 250.0)
        self.assertEqual(payload['totals']['profit'], 150.0)


class LogbookCrudApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cruduser', password='secret123')
        self.client.login(username='cruduser', password='secret123')

    def test_expense_crud_flow(self):
        create_response = self.client.post(
            reverse('api:expense_list'),
            data={
                'item': 'Fertilizer',
                'amount_spent': '120.50',
                'quantity': 2,
                'category': 'Inputs',
                'date': '2026-04-01',
            },
        )
        self.assertEqual(create_response.status_code, 201)
        expense_id = create_response.json()['id']

        list_response = self.client.get(reverse('api:expense_list'))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()['results']), 1)

        patch_response = self.client.patch(
            reverse('api:expense_detail', args=[expense_id]),
            data={'amount_spent': '150.00'},
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.json()['amount_spent'], '150.00')

        delete_response = self.client.delete(reverse('api:expense_detail', args=[expense_id]))
        self.assertEqual(delete_response.status_code, 204)

    def test_sale_crud_flow(self):
        create_response = self.client.post(
            reverse('api:sale_list'),
            data={
                'product': 'Tomatoes',
                'amount_earned': '300.00',
                'quantity': 10,
                'category': 'Produce',
                'date': '2026-04-02',
            },
        )
        self.assertEqual(create_response.status_code, 201)
        sale_id = create_response.json()['id']

        list_response = self.client.get(reverse('api:sale_list'))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()['results']), 1)

        patch_response = self.client.patch(
            reverse('api:sale_detail', args=[sale_id]),
            data={'amount_earned': '325.00'},
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.json()['amount_earned'], '325.00')

        delete_response = self.client.delete(reverse('api:sale_detail', args=[sale_id]))
        self.assertEqual(delete_response.status_code, 204)


class ChemicalSuggestionsApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='apiuser2', password='secret123')
        self.client.login(username='apiuser2', password='secret123')

    def test_suggestions_include_success_rate(self):
        chemical = Chemical.objects.create(
            user=self.user,
            name='Chem A',
            active_ingredient='X',
            usage_instructions='Use once weekly',
        )

        Recommendation.objects.create(
            user=self.user,
            chemical=chemical,
            recommended_date='2026-04-01',
            reason='Blight control',
            result='success',
            plant='Tomato',
            illness='Blight',
            success=True,
        )

        response = self.client.get(reverse('api:chemical_suggestions'))
        self.assertEqual(response.status_code, 200)

        payload = response.json()
        self.assertIn('suggestions', payload)
        self.assertGreaterEqual(len(payload['suggestions']), 1)
        self.assertIn('success_rate', payload['suggestions'][0])
