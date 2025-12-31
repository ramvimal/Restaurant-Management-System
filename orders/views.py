from django.shortcuts import render , redirect
from .models import Order, OrderItem
from menu.models import MenuItem
from django.http import JsonResponse
import json
from menu.models import MenuItem
from django.views.decorators.csrf import csrf_exempt
# Create your views here.


def add_to_cart(request, item_id):
    item = MenuItem.objects.get(id=item_id)
    cart = request.session.get('cart', {})

    #print(item_id)
    item_id = str(item_id)

    if item_id in cart:
        cart[item_id]['quantity'] += 1
    else:
        cart[item_id] = {
            'name': item.name,
            'price': float(item.price),
            'quantity': 1,
            'image': item.img_url
        }


    request.session['cart'] = cart

    # calculate totals
    total_items = sum(i['quantity'] for i in cart.values())
    total_price = sum(i['price'] * i['quantity'] for i in cart.values())

    return JsonResponse({
        'cart': cart,
        'total_items': total_items,
        'total_price': total_price
    })

def get_cart(request):
    cart = request.session.get('cart', {})
    return JsonResponse(cart_response(cart))


def cart_response(cart):
    total_items = sum(i['quantity'] for i in cart.values())
    total_price = sum(i['price'] * i['quantity'] for i in cart.values())

    return {
        'cart': cart,
        'total_items': total_items,
        'total_price': total_price
    }

def increase_quantity(request, item_id):
    cart = request.session.get('cart', {})
    item_id = str(item_id)

    if item_id in cart:
        cart[item_id]['quantity'] += 1

    request.session['cart'] = cart
    return JsonResponse(cart_response(cart))

def decrease_quantity(request, item_id):
    cart = request.session.get('cart', {})
    item_id = str(item_id)

    if item_id in cart:
        cart[item_id]['quantity'] -= 1
        if cart[item_id]['quantity'] <= 0:
            del cart[item_id]

    request.session['cart'] = cart
    return JsonResponse(cart_response(cart))

def remove_from_cart(request, item_id):
    cart = request.session.get('cart', {})
    item_id = str(item_id)

    if item_id in cart:
        del cart[item_id]

    request.session['cart'] = cart
    return JsonResponse(cart_response(cart))

def order_bill(request, order_id):
    order = Order.objects.get(id=order_id)
    return render(request, 'orders/bill.html', {'order': order})

def checkout_page(request):
    if not request.session.get("cart"):
        return redirect("/")
    return render(request, 'orders/checkout.html')

@csrf_exempt
def checkout_confirm(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    # 🔐 Prevent duplicate checkout
    if request.session.get("order_confirmed") and request.session.get("current_order_id"):
        return JsonResponse(
            {
                "order_id": request.session["current_order_id"]
            }
        )

    cart = request.session.get("cart")
    if not cart:
        return JsonResponse({"error": "Cart expired"}, status=400)

    data = json.loads(request.body)

    customer_name = data.get("customer_name", "Guest")
    phone = data.get("phone", "")

    # ✅ Create order (PENDING for payment flow)
    order = Order.objects.create(
        customer_name=customer_name,
        phone=phone,
        total_amount=0,
        status="PENDING"   # important
    )

    total = 0
    for item in cart.values():
        OrderItem.objects.create(
            order=order,
            item_name=item["name"],
            price=item["price"],
            quantity=item["quantity"]
        )
        total += item["price"] * item["quantity"]

    order.total_amount = total
    order.save()

    # ✅ Mark checkout as completed (VERY IMPORTANT)
    request.session["order_confirmed"] = True
    request.session["current_order_id"] = order.id
    request.session.modified = True

    # ❌ DO NOT clear cart here (clear after payment success)
    return JsonResponse({"order_id": order.id})

def payment_page(request, order_id):
    order = Order.objects.get(id=order_id)

    if order.status != "PENDING":
        return redirect("order_bill", order_id=order.id)

    return render(request, "orders/payment.html", {"order": order})

def payment_success(request, order_id):
    order = Order.objects.get(id=order_id)

    if order.status == "PAID":
        return redirect("order_bill", order_id=order.id)

    order.status = "PAID"
    order.save()

    # clear cart only after payment
    request.session["cart"] = {}
    request.session.pop("current_order_id", None)

    return redirect("order_bill", order_id=order.id)

def payment_fail(request, order_id):
    order = Order.objects.get(id=order_id)
    order.status = "FAILED"
    order.save()

    return render(request, "orders/payment_failed.html", {"order": order})
