from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from .models import Product, Category, Supplier, StockTransaction
from .forms import ProductForm, CategoryForm, SupplierForm, StockTransactionForm


@login_required
def dashboard(request):
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_suppliers = Supplier.objects.count()
    low_stock = Product.objects.filter(quantity__lte=5)

    context = {
        'total_products': total_products,
        'total_categories': total_categories,
        'total_suppliers': total_suppliers,
        'low_stock': low_stock,
    }
    return render(request, 'dashboard.html', context)


@login_required
def product_list(request):
    products = Product.objects.all()
    return render(request, 'product_list.html', {'products': products})


@login_required
def add_product(request):
    form = ProductForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('product_list')
    return render(request, 'form.html', {'form': form})


@login_required
def stock_transaction(request):
    form = StockTransactionForm(request.POST or None)
    if form.is_valid():
        transaction = form.save(commit=False)
        transaction.performed_by = request.user
        transaction.save()
        return redirect('dashboard')
    return render(request, 'form.html', {'form': form})
