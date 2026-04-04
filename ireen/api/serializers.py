from rest_framework import serializers

from chemical_tracker.models import Chemical, FinalResult, Recommendation, Treatment, TreatmentProgress
from logbook.models import Expense, Sale


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'item', 'amount_spent', 'quantity', 'category', 'date']


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = ['id', 'product', 'amount_earned', 'quantity', 'category', 'date']


class ChemicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chemical
        fields = ['id', 'name', 'active_ingredient', 'usage_instructions', 'associated_products']


class RecommendationSerializer(serializers.ModelSerializer):
    chemical_name = serializers.CharField(source='chemical.name', read_only=True)

    class Meta:
        model = Recommendation
        fields = [
            'id',
            'chemical',
            'chemical_name',
            'recommended_date',
            'reason',
            'result',
            'plant',
            'illness',
            'success',
            'minor_result',
        ]


class TreatmentSerializer(serializers.ModelSerializer):
    chemical_name = serializers.CharField(source='chemical.name', read_only=True)

    class Meta:
        model = Treatment
        fields = [
            'id',
            'chemical',
            'chemical_name',
            'plant',
            'illness',
            'treatment_date',
            'is_preventative',
            'duration_days',
            'times_per_week',
        ]


class TreatmentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentProgress
        fields = ['id', 'treatment', 'date', 'details']


class FinalResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalResult
        fields = ['id', 'treatment', 'date', 'observation', 'success', 'minor_result', 'failed']