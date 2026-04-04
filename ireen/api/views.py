from datetime import datetime

import requests
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.db.models import Case, Count, F, IntegerField, Q, Sum, When
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chemical_tracker.models import Recommendation
from chemical_tracker.models import Chemical, FinalResult, Treatment, TreatmentProgress
from logbook.models import Expense, Sale
from users.models import Profile
from .serializers import (
    ChemicalSerializer,
    ExpenseSerializer,
    FinalResultSerializer,
    RecommendationSerializer,
    SaleSerializer,
    TreatmentProgressSerializer,
    TreatmentSerializer,
)


def apply_logbook_filters(expenses, sales, request):
    filter_by = request.GET.get('filter_by', '')
    filter_value = request.GET.get('filter_value', '')
    filter_value_min = request.GET.get('filter_value_min', '')
    filter_value_max = request.GET.get('filter_value_max', '')
    filter_range_start = request.GET.get('filter_range_start', '')
    filter_range_end = request.GET.get('filter_range_end', '')

    try:
        if filter_by:
            if filter_by == 'year' and filter_value:
                year = int(filter_value)
                start_date = datetime(year, 1, 1).date()
                end_date = datetime(year, 12, 31).date()
                expenses = expenses.filter(date__range=[start_date, end_date])
                sales = sales.filter(date__range=[start_date, end_date])
            elif filter_by == 'amount_spent' and filter_value_min and filter_value_max:
                expenses = expenses.filter(
                    amount_spent__gte=float(filter_value_min),
                    amount_spent__lte=float(filter_value_max),
                )
            elif filter_by == 'amount_earned' and filter_value_min and filter_value_max:
                sales = sales.filter(
                    amount_earned__gte=float(filter_value_min),
                    amount_earned__lte=float(filter_value_max),
                )
            elif filter_by in ['product', 'item', 'category'] and filter_value and filter_range_start and filter_range_end:
                start_date = datetime.strptime(filter_range_start, '%Y-%m-%d').date()
                end_date = datetime.strptime(filter_range_end, '%Y-%m-%d').date()
                if filter_by == 'product':
                    sales = sales.filter(product__icontains=filter_value, date__range=[start_date, end_date])
                elif filter_by == 'item':
                    expenses = expenses.filter(item__icontains=filter_value, date__range=[start_date, end_date])
                elif filter_by == 'category':
                    expenses = expenses.filter(category__icontains=filter_value, date__range=[start_date, end_date])
                    sales = sales.filter(category__icontains=filter_value, date__range=[start_date, end_date])
            elif filter_by == 'date_range' and filter_range_start and filter_range_end:
                start_date = datetime.strptime(filter_range_start, '%Y-%m-%d').date()
                end_date = datetime.strptime(filter_range_end, '%Y-%m-%d').date()
                expenses = expenses.filter(date__range=[start_date, end_date])
                sales = sales.filter(date__range=[start_date, end_date])
    except ValueError:
        raise ValueError('Invalid filter values supplied.')

    return expenses, sales


class LogbookSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)
        sales = Sale.objects.filter(user=request.user)

        try:
            expenses, sales = apply_logbook_filters(expenses, sales, request)
        except ValueError:
            return Response({'detail': 'Invalid filter values supplied.'}, status=status.HTTP_400_BAD_REQUEST)

        filter_by = request.GET.get('filter_by', '')
        filter_value = request.GET.get('filter_value', '')
        filter_value_min = request.GET.get('filter_value_min', '')
        filter_value_max = request.GET.get('filter_value_max', '')
        filter_range_start = request.GET.get('filter_range_start', '')
        filter_range_end = request.GET.get('filter_range_end', '')

        total_spent = expenses.aggregate(total=Sum('amount_spent'))['total'] or 0
        total_earned = sales.aggregate(total=Sum('amount_earned'))['total'] or 0

        expense_data = list(
            expenses.values('date').annotate(total_spent=Sum('amount_spent')).order_by('date')
        )
        sale_data = list(
            sales.values('date').annotate(total_earned=Sum('amount_earned')).order_by('date')
        )

        return Response(
            {
                'totals': {
                    'spent': float(total_spent),
                    'earned': float(total_earned),
                    'profit': float(total_earned - total_spent),
                    'currency': 'ZMW',
                },
                'series': {
                    'expenses': expense_data,
                    'sales': sale_data,
                },
                'filters': {
                    'filter_by': filter_by,
                    'filter_value': filter_value,
                    'filter_value_min': filter_value_min,
                    'filter_value_max': filter_value_max,
                    'filter_range_start': filter_range_start,
                    'filter_range_end': filter_range_end,
                },
            }
        )


class ExpenseListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user).order_by('-date', '-id')

        try:
            expenses, _ = apply_logbook_filters(expenses, Sale.objects.none(), request)
        except ValueError:
            return Response({'detail': 'Invalid filter values supplied.'}, status=status.HTTP_400_BAD_REQUEST)

        data = ExpenseSerializer(expenses, many=True).data
        return Response({'count': len(data), 'results': data})

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Expense, pk=pk, user=request.user)

    def patch(self, request, pk):
        expense = self.get_object(request, pk)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        expense = self.get_object(request, pk)
        serializer = ExpenseSerializer(expense, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(request, pk)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SaleListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sales = Sale.objects.filter(user=request.user).order_by('-date', '-id')

        try:
            _, sales = apply_logbook_filters(Expense.objects.none(), sales, request)
        except ValueError:
            return Response({'detail': 'Invalid filter values supplied.'}, status=status.HTTP_400_BAD_REQUEST)

        data = SaleSerializer(sales, many=True).data
        return Response({'count': len(data), 'results': data})

    def post(self, request):
        serializer = SaleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SaleDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Sale, pk=pk, user=request.user)

    def patch(self, request, pk):
        sale = self.get_object(request, pk)
        serializer = SaleSerializer(sale, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        sale = self.get_object(request, pk)
        serializer = SaleSerializer(sale, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        sale = self.get_object(request, pk)
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChemicalSuggestionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recommendations = Recommendation.objects.all()
        if not request.user.is_staff:
            recommendations = recommendations.filter(Q(user=request.user) | Q(user__is_staff=True))

        suggestions = (
            recommendations.values('chemical_id', 'chemical__name', 'plant', 'illness')
            .annotate(
                total_count=Count('id'),
                success_count=Count(
                    Case(
                        When(Q(result='success') | Q(success=True), then=1),
                        output_field=IntegerField(),
                    )
                ),
                minor_result_count=Count(
                    Case(
                        When(Q(result='minor_result') | Q(minor_result=True), then=1),
                        output_field=IntegerField(),
                    )
                ),
            )
            .annotate(
                success_rate=F('success_count') * 100.0 / F('total_count'),
                minor_result_rate=F('minor_result_count') * 100.0 / F('total_count'),
            )
            .order_by('-success_rate', '-total_count')
        )

        return Response({'suggestions': list(suggestions)})


class ChemicalListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chemicals = Chemical.objects.filter(Q(user=request.user) | Q(user__is_staff=True)).order_by('-id')
        return Response({'count': chemicals.count(), 'results': ChemicalSerializer(chemicals, many=True).data})

    def post(self, request):
        serializer = ChemicalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChemicalDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Chemical, pk=pk, user=request.user)

    def patch(self, request, pk):
        chemical = self.get_object(request, pk)
        serializer = ChemicalSerializer(chemical, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        chemical = self.get_object(request, pk)
        serializer = ChemicalSerializer(chemical, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        chemical = self.get_object(request, pk)
        chemical.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecommendationListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recommendations = Recommendation.objects.filter(Q(user=request.user) | Q(user__is_staff=True)).order_by('-recommended_date', '-id')
        return Response({'count': recommendations.count(), 'results': RecommendationSerializer(recommendations, many=True).data})

    def post(self, request):
        serializer = RecommendationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecommendationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Recommendation, pk=pk, user=request.user)

    def patch(self, request, pk):
        recommendation = self.get_object(request, pk)
        serializer = RecommendationSerializer(recommendation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        recommendation = self.get_object(request, pk)
        serializer = RecommendationSerializer(recommendation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        recommendation = self.get_object(request, pk)
        recommendation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TreatmentListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        treatments = Treatment.objects.filter(user=request.user).select_related('chemical').order_by('-treatment_date', '-id')
        return Response({'count': treatments.count(), 'results': TreatmentSerializer(treatments, many=True).data})

    def post(self, request):
        serializer = TreatmentSerializer(data=request.data)
        if serializer.is_valid():
            treatment = serializer.save(user=request.user)
            TreatmentProgress.objects.get_or_create(
                user=request.user,
                treatment=treatment,
                defaults={
                    'date': treatment.treatment_date,
                    'details': 'first treatment.',
                },
            )
            return Response(TreatmentSerializer(treatment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TreatmentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Treatment, pk=pk, user=request.user)

    def patch(self, request, pk):
        treatment = self.get_object(request, pk)
        serializer = TreatmentSerializer(treatment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        treatment = self.get_object(request, pk)
        serializer = TreatmentSerializer(treatment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        treatment = self.get_object(request, pk)
        treatment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TreatmentProgressListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress = TreatmentProgress.objects.filter(user=request.user).select_related('treatment').order_by('-date', '-id')
        return Response({'count': progress.count(), 'results': TreatmentProgressSerializer(progress, many=True).data})

    def post(self, request):
        serializer = TreatmentProgressSerializer(data=request.data)
        if serializer.is_valid():
            try:
                treatment = Treatment.objects.get(pk=serializer.validated_data['treatment'].pk, user=request.user)
            except Treatment.DoesNotExist:
                return Response({'detail': 'Treatment not found.'}, status=status.HTTP_404_NOT_FOUND)

            progress = serializer.save(user=request.user, treatment=treatment)
            return Response(TreatmentProgressSerializer(progress).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TreatmentProgressDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(TreatmentProgress, pk=pk, user=request.user)

    def patch(self, request, pk):
        progress = self.get_object(request, pk)
        serializer = TreatmentProgressSerializer(progress, data=request.data, partial=True)
        if serializer.is_valid():
            if 'treatment' in serializer.validated_data:
                try:
                    treatment = Treatment.objects.get(pk=serializer.validated_data['treatment'].pk, user=request.user)
                except Treatment.DoesNotExist:
                    return Response({'detail': 'Treatment not found.'}, status=status.HTTP_404_NOT_FOUND)
                serializer.save(treatment=treatment)
            else:
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        progress = self.get_object(request, pk)
        serializer = TreatmentProgressSerializer(progress, data=request.data)
        if serializer.is_valid():
            try:
                treatment = Treatment.objects.get(pk=serializer.validated_data['treatment'].pk, user=request.user)
            except Treatment.DoesNotExist:
                return Response({'detail': 'Treatment not found.'}, status=status.HTTP_404_NOT_FOUND)
            serializer.save(treatment=treatment)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        progress = self.get_object(request, pk)
        progress.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FinalResultListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        results = FinalResult.objects.filter(user=request.user).select_related('treatment').order_by('-date', '-id')
        return Response({'count': results.count(), 'results': FinalResultSerializer(results, many=True).data})

    def post(self, request):
        serializer = FinalResultSerializer(data=request.data)
        if serializer.is_valid():
            try:
                treatment = Treatment.objects.get(pk=serializer.validated_data['treatment'].pk, user=request.user)
            except Treatment.DoesNotExist:
                return Response({'detail': 'Treatment not found.'}, status=status.HTTP_404_NOT_FOUND)

            result, _ = FinalResult.objects.update_or_create(
                treatment=treatment,
                defaults={
                    'user': request.user,
                    'date': serializer.validated_data.get('date'),
                    'observation': serializer.validated_data.get('observation'),
                    'success': serializer.validated_data.get('success', False),
                    'minor_result': serializer.validated_data.get('minor_result', False),
                    'failed': serializer.validated_data.get('failed', False),
                },
            )
            return Response(FinalResultSerializer(result).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FinalResultDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(FinalResult, pk=pk, user=request.user)

    def patch(self, request, pk):
        result = self.get_object(request, pk)
        serializer = FinalResultSerializer(result, data=request.data, partial=True)
        if serializer.is_valid():
            if 'treatment' in serializer.validated_data:
                try:
                    treatment = Treatment.objects.get(pk=serializer.validated_data['treatment'].pk, user=request.user)
                except Treatment.DoesNotExist:
                    return Response({'detail': 'Treatment not found.'}, status=status.HTTP_404_NOT_FOUND)
                serializer.save(treatment=treatment)
            else:
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        result = self.get_object(request, pk)
        serializer = FinalResultSerializer(result, data=request.data)
        if serializer.is_valid():
            try:
                treatment = Treatment.objects.get(pk=serializer.validated_data['treatment'].pk, user=request.user)
            except Treatment.DoesNotExist:
                return Response({'detail': 'Treatment not found.'}, status=status.HTTP_404_NOT_FOUND)
            serializer.save(treatment=treatment)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        result = self.get_object(request, pk)
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WeatherCurrentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        api_key = settings.OPENWEATHERMAP_API_KEY
        if not api_key or api_key == 'your_api_key':
            return Response(
                {'detail': 'OpenWeather API key is not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        city = request.GET.get('city', 'Lusaka')
        country = request.GET.get('country', 'ZM')
        limit = 1

        geo_url = (
            f'http://api.openweathermap.org/geo/1.0/direct?q={city},{country}&limit={limit}&appid={api_key}'
        )

        try:
            geo_response = requests.get(geo_url, timeout=10)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
        except requests.RequestException:
            return Response(
                {'detail': 'Unable to fetch geolocation data.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if not geo_data:
            return Response({'detail': 'Location not found.'}, status=status.HTTP_404_NOT_FOUND)

        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']

        weather_url = (
            f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={api_key}'
        )

        try:
            weather_response = requests.get(weather_url, timeout=10)
            weather_response.raise_for_status()
        except requests.RequestException:
            return Response(
                {'detail': 'Unable to fetch weather data.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'city': city, 'country': country, 'data': weather_response.json()})


class CsrfTokenAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})


class AuthLoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        Profile.objects.get_or_create(user=user)

        return Response(
            {
                'user': {
                    'username': user.username,
                    'email': user.email,
                }
            }
        )


class AuthLogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out successfully.'})


class AuthProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response(
            {
                'user': {
                    'username': request.user.username,
                    'email': request.user.email,
                },
                'profile': {
                    'firstname': profile.firstname or '',
                    'lastname': profile.lastname or '',
                    'bio': profile.bio or '',
                    'location': profile.location or '',
                    'birth_date': profile.birth_date.isoformat() if profile.birth_date else '',
                },
            }
        )

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)

        profile.firstname = request.data.get('firstname', profile.firstname)
        profile.lastname = request.data.get('lastname', profile.lastname)
        profile.bio = request.data.get('bio', profile.bio)
        profile.location = request.data.get('location', profile.location)

        birth_date = request.data.get('birth_date')
        if birth_date is not None:
            if birth_date == '':
                profile.birth_date = None
            else:
                try:
                    profile.birth_date = datetime.strptime(birth_date, '%Y-%m-%d').date()
                except ValueError:
                    return Response(
                        {'detail': 'Invalid birth_date format. Use YYYY-MM-DD.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        email = request.data.get('email')
        if email is not None:
            request.user.email = email
            request.user.save(update_fields=['email'])

        profile.save()

        return self.get(request)
