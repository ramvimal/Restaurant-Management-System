from django.urls import path
from . import views

urlpatterns = [
    path('add-to-cart/<int:item_id>/', views.add_to_cart, name='add_to_cart'),
    path('get-cart/', views.get_cart, name='get_cart'), 
    path('cart/increase/<int:item_id>/', views.increase_quantity, name='increase_quantity'),
    path('cart/decrease/<int:item_id>/', views.decrease_quantity, name='decrease_quantity'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('bill/<int:order_id>/', views.order_bill, name='order_bill'),

    path('checkout/', views.checkout_page, name='checkout'),          
    path('checkout/confirm/', views.checkout_confirm, name='checkout_confirm'), 
    path("payment/<int:order_id>/", views.payment_page, name="payment_page"),
    path("payment/success/<int:order_id>/", views.payment_success, name="payment_success"),
    path("payment/fail/<int:order_id>/", views.payment_fail, name="payment_fail"),

]