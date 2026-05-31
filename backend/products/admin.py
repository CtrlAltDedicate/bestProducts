from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'price', 'stock', 'created_by', 'created_at']
    list_filter = ['category']
    search_fields = ['title', 'category']
