from django.contrib import admin
from .models import Category, Event, TicketType, EventImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'is_active', 'created_at']
    list_filter = ['type', 'is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


class TicketTypeInline(admin.TabularInline):
    model = TicketType
    extra = 1


class EventImageInline(admin.TabularInline):
    model = EventImage
    extra = 1


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'venue', 'city', 'start_date', 'status', 'is_featured']
    list_filter = ['status', 'is_featured', 'is_trending', 'category']
    search_fields = ['title', 'venue', 'city']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [TicketTypeInline, EventImageInline]
    readonly_fields = ['created_at', 'updated_at']
