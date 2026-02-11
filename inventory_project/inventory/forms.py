from django import forms
from .models import Product, Category, Supplier, StockTransaction


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = '__all__'


class SupplierForm(forms.ModelForm):
    class Meta:
        model = Supplier
        fields = '__all__'


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'


class StockTransactionForm(forms.ModelForm):
    class Meta:
        model = StockTransaction
        fields = ['product', 'quantity', 'transaction_type']
