from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from django.contrib import messages
from .models import Product, Category, Supplier, StockTransaction
from .forms import ProductForm, CategoryForm, SupplierForm, StockTransactionForm


# Authentication Views
def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password')
    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect('login')


def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return redirect('register')
        
        user = User.objects.create_user(username=username, password=password, email=email)
        login(request, user)
        return redirect('dashboard')
    
    return render(request, 'register.html')


# Dashboard View
@login_required(login_url='login')
def dashboard(request):
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_suppliers = Supplier.objects.count()
    low_stock = Product.objects.filter(quantity__lte=5)
    recent_transactions = StockTransaction.objects.all().order_by('-date')[:5]

    context = {
        'total_products': total_products,
        'total_categories': total_categories,
        'total_suppliers': total_suppliers,
        'low_stock': low_stock,
        'recent_transactions': recent_transactions,
    }
    return render(request, 'dashboard.html', context)


# Product Views
@login_required(login_url='login')
def product_list(request):
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    
    products = Product.objects.all()
    
    if query:
        products = products.filter(Q(name__icontains=query) | Q(category__name__icontains=query))
    
    if category:
        products = products.filter(category__id=category)
    
    categories = Category.objects.all()
    
    context = {
        'products': products,
        'categories': categories,
        'query': query,
        'selected_category': category,
    }
    return render(request, 'product_list.html', context)


@login_required(login_url='login')
def product_detail(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    transactions = StockTransaction.objects.filter(product=product).order_by('-date')
    
    context = {
        'product': product,
        'transactions': transactions,
    }
    return render(request, 'product_detail.html', context)


@login_required(login_url='login')
def add_product(request):
    form = ProductForm(request.POST or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Product added successfully')
        return redirect('product_list')
    return render(request, 'form.html', {'form': form, 'title': 'Add Product'})


@login_required(login_url='login')
def edit_product(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    form = ProductForm(request.POST or None, instance=product)
    if form.is_valid():
        form.save()
        messages.success(request, 'Product updated successfully')
        return redirect('product_detail', product_id=product.id)
    return render(request, 'form.html', {'form': form, 'title': 'Edit Product'})


@login_required(login_url='login')
def delete_product(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    if request.method == 'POST':
        product.delete()
        messages.success(request, 'Product deleted successfully')
        return redirect('product_list')
    return render(request, 'confirm_delete.html', {'object': product, 'object_type': 'Product'})


# Category Views
@login_required(login_url='login')
def category_list(request):
    categories = Category.objects.annotate(product_count=Count('product'))
    return render(request, 'category_list.html', {'categories': categories})


@login_required(login_url='login')
def add_category(request):
    form = CategoryForm(request.POST or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Category added successfully')
        return redirect('category_list')
    return render(request, 'form.html', {'form': form, 'title': 'Add Category'})


@login_required(login_url='login')
def edit_category(request, category_id):
    category = get_object_or_404(Category, pk=category_id)
    form = CategoryForm(request.POST or None, instance=category)
    if form.is_valid():
        form.save()
        messages.success(request, 'Category updated successfully')
        return redirect('category_list')
    return render(request, 'form.html', {'form': form, 'title': 'Edit Category'})


@login_required(login_url='login')
def delete_category(request, category_id):
    category = get_object_or_404(Category, pk=category_id)
    if request.method == 'POST':
        category.delete()
        messages.success(request, 'Category deleted successfully')
        return redirect('category_list')
    return render(request, 'confirm_delete.html', {'object': category, 'object_type': 'Category'})


# Supplier Views
@login_required(login_url='login')
def supplier_list(request):
    suppliers = Supplier.objects.annotate(product_count=Count('product'))
    return render(request, 'supplier_list.html', {'suppliers': suppliers})


@login_required(login_url='login')
def add_supplier(request):
    form = SupplierForm(request.POST or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Supplier added successfully')
        return redirect('supplier_list')
    return render(request, 'form.html', {'form': form, 'title': 'Add Supplier'})


@login_required(login_url='login')
def edit_supplier(request, supplier_id):
    supplier = get_object_or_404(Supplier, pk=supplier_id)
    form = SupplierForm(request.POST or None, instance=supplier)
    if form.is_valid():
        form.save()
        messages.success(request, 'Supplier updated successfully')
        return redirect('supplier_list')
    return render(request, 'form.html', {'form': form, 'title': 'Edit Supplier'})


@login_required(login_url='login')
def delete_supplier(request, supplier_id):
    supplier = get_object_or_404(Supplier, pk=supplier_id)
    if request.method == 'POST':
        supplier.delete()
        messages.success(request, 'Supplier deleted successfully')
        return redirect('supplier_list')
    return render(request, 'confirm_delete.html', {'object': supplier, 'object_type': 'Supplier'})


# Stock Transaction Views
@login_required(login_url='login')
def stock_transaction(request):
    form = StockTransactionForm(request.POST or None)
    if form.is_valid():
        transaction = form.save(commit=False)
        transaction.performed_by = request.user
        
        # Update product quantity
        product = transaction.product
        if transaction.transaction_type == 'IN':
            product.quantity += transaction.quantity
        else:
            if product.quantity >= transaction.quantity:
                product.quantity -= transaction.quantity
            else:
                messages.error(request, 'Insufficient stock')
                return render(request, 'form.html', {'form': form, 'title': 'Stock Transaction'})
        
        transaction.save()
        product.save()
        messages.success(request, 'Stock transaction recorded successfully')
        return redirect('dashboard')
    
    return render(request, 'form.html', {'form': form, 'title': 'Stock Transaction'})


@login_required(login_url='login')
def transaction_history(request):
    transactions = StockTransaction.objects.all().order_by('-date')
    product = request.GET.get('product', '')
    
    if product:
        transactions = transactions.filter(product__id=product)
    
    products = Product.objects.all()
    
    context = {
        'transactions': transactions,
        'products': products,
        'selected_product': product,
    }
    return render(request, 'transaction_history.html', context)
