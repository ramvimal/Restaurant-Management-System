from rest_framework.decorators import api_view
from rest_framework.response import Response
from menu.models import MenuItem
from .serializers import MenuItemSerializer , OrdersSerializer
from orders.models import Order


@api_view(["GET"])
def menu_list_api(request):
    items = MenuItem.objects.all()
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def order_list_api(request):
    orders = Order.objects.filter(status="PENDING")
    serializer = OrdersSerializer(orders, many=True)
    return Response(serializer.data)
