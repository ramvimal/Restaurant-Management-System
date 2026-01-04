from django.contrib import admin
from .models import Category, MenuItem

class MenuItemAdmin(admin.ModelAdmin):
    def has_module_permission(self, request):
        return request.user.groups.filter(name="Manager").exists()

    def has_view_permission(self, request, obj=None):
        return request.user.groups.filter(name="Manager").exists()

    def has_change_permission(self, request, obj=None):
        return request.user.groups.filter(name="Manager").exists()

    def has_add_permission(self, request):
        return request.user.groups.filter(name="Manager").exists()

    def has_delete_permission(self, request, obj=None):
        return request.user.groups.filter(name="Manager").exists()


admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Category, MenuItemAdmin)
