from menu.models import MenuItem , Category
from .serializers import CartSerializer, MenuItemSerializer , OrdersSerializer , CategorySerializer
from orders.models import Order , OrderItem
from rest_framework import viewsets 

class MenuItemsViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.all()

class OrdersViewSet(viewsets.ModelViewSet):
    serializer_class = OrdersSerializer
    queryset = Order.objects.all()

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    queryset = OrderItem.objects.all()

    def get_queryset(self):
        order_id = self.request.query_params.get('order_id')
        
        if order_id:
            return OrderItem.objects.filter(order__id=order_id)
        return OrderItem.objects.none()
        