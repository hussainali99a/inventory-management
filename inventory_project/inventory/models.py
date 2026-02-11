from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_low_stock(self):
        return self.quantity <= self.reorder_level

    def __str__(self):
        return self.name


class StockTransaction(models.Model):
    TRANSACTION_TYPE = (
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)
    date = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.transaction_type}"


@receiver(post_save, sender=StockTransaction)
def update_stock(sender, instance, created, **kwargs):
    if created:
        product = instance.product
        if instance.transaction_type == 'IN':
            product.quantity += instance.quantity
        else:
            product.quantity -= instance.quantity
        product.save()
