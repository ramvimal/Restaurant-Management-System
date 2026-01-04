from django.contrib import admin
from .models import Order , OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    
    def has_change_permission(self, request, obj=None):
        if obj and obj.status == "PAID":
            return False
        return True
    
    def has_delete_permission(self,request,obj=None):
        if obj and obj.status == "PAID":
            return False
        return True
    
    def get_readonly_fields(self,request,obj=None):
        if obj and obj.status == "PAID":
            return ("item_name","price", "quantity")
        return ()
        
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "phone", "total_amount", "status", "created_at")
    list_filter=('id','customer_name','status', 'phone','total_amount','created_at')
    search_fields = ('id', 'customer_name')
    search_help_text = "Searhch order id or name"
    inlines = [OrderItemInline]

    def has_delete_permission(self, request, obj=None):
        return request.user.groups.filter(name="Manager").exists()

    def has_change_permission(self, request, obj=None):
        if obj and obj.status == "PAID":
            return False
        return True     
    
    
