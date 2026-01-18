from django.urls import path
from . import views

urlpatterns = [    
    path("login/", views.cashier_login, name="cashier_login"),
    path("cashier/dashboard/", views.cashier_dashboard, name="cashier_dashboard"),
    path("logout/", views.cashier_logout, name="cashier_logout"),
    # path("cashier/order-complete/<int:order_id>/",views.mark_order_completed,name="order_complete"),
    path("cashier/update-status/<int:order_id>/", views.update_order_status, name="update_order_status"),
    path("cashier/pending-count/", views.pending_orders_count, name="pending_orders_count"),
    path("cashier/order/<int:order_id>/", views.cashier_order_detail, name="cashier_order_detail"),
]


