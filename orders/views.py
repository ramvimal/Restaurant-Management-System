from django.http import JsonResponse
from menu.models import MenuItem

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
