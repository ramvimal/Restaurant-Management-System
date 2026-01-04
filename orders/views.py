from django.shortcuts import render , redirect , get_object_or_404
from .models import Order, OrderItem
from menu.models import MenuItem
from django.http import JsonResponse , HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib import colors
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
    request.session.modified = True

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

def clear_cart(request):
    request.session['cart'] = {}
    request.session.modified = True
    return JsonResponse({"status": "cart cleared"})

# -------------------- CHECKOUT --------------------

def checkout_page(request):
    if not request.session.get("cart"):
        return redirect("/")
    return render(request, 'orders/checkout.html')


@csrf_exempt
def checkout_confirm(request):
    # block checkout if a paid order exists
    active_order_id = request.session.get("active_order_id")
    if active_order_id:
        order = Order.objects.filter(id=active_order_id).first()
        if order and order.status == "PAID":
            request.session.pop("active_order_id", None)
        elif order and order.status == "PENDING":
            return JsonResponse({"order_id": order.id})

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    cart = request.session.get("cart")
    if not cart:
        return JsonResponse({"error": "Cart empty"}, status=400)



    data = json.loads(request.body)

    order = Order.objects.create(
        customer_name=data.get("customer_name"),
        phone=data.get("phone"),
        address=data.get("address"),
        total_amount=0,
        status="PENDING"
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
    print(item["price"])
    order.total_amount = total
    order.save()

    # ✅ store ONLY active order id
    request.session["active_order_id"] = order.id
    request.session.modified = True

    return JsonResponse({"order_id": order.id})

# -------------------- PAYMENT --------------------

def payment_page(request, order_id):
    order = Order.objects.get(id=order_id) 
      
    if order.status != "PENDING":
        return redirect("order_bill", order_id=order.id)

    return render(request, "orders/payment.html", {"order": order})



@csrf_exempt
def payment_success(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status == "PAID":
        return JsonResponse({"message": "Already paid"})

    order.status = "PAID"
    order.save()

    request.session.pop("active_order_id", None)
    request.session["cart"] = {}
    request.session.modified = True

    return JsonResponse({"success": True})




def payment_fail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    order.status = "FAILED"
    order.save()

    return render(request, "orders/payment_failed.html", {"order": order})

# -------------------- ORDER CONFIRMATION & BILL --------------------

def order_confirmed(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != "PAID":
        return redirect(f"/payment/{order.id}/")

    return render(request, "orders/order_confirmed.html", {"order": order})

def bill_view(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != "PAID":
        return redirect(f"/payment/{order.id}/")

    return render(request, "orders/bill.html", {"order": order})

def bill_pdf(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Starting vertical position
    y = height - 60
    center = width / 2

    # --- Header Section (Centered) ---
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(center, y, "SHREE RAM HOTEL")
    y -= 18
    p.setFont("Helvetica", 11)
    p.drawCentredString(center, y, "Maruti Chowk Rajkot")
    y -= 25

    # Dashed Line
    p.setDash(3, 3) 
    p.line(50, y, width - 50, y)
    y -= 15
    p.drawCentredString(center, y, "RECEIPT")
    y -= 10
    p.line(50, y, width - 50, y)
    y -= 25

    # --- Customer & Invoice Details ---
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Name: {order.customer_name.upper()}")
    p.drawRightString(width - 50, y, f"Invoice No: {order.id}")
    y -= 15
    p.drawString(50, y, "Table: #98") # Static example or use order.table
    p.drawRightString(width - 50, y, f"Date: {order.created_at.strftime('%d %b %Y')}")
    y -= 20

    # --- Table Header ---
    p.line(50, y, width - 50, y)
    y -= 15
    p.setFont("Helvetica-Bold", 11)
    p.drawString(50, y, "Item")
    p.drawCentredString(center + 20, y, "Price")
    p.drawCentredString(center + 80, y, "Qty")
    p.drawRightString(width - 50, y, "Total")
    y -= 10
    p.line(50, y, width - 50, y)
    y -= 20

    # --- Line Items ---
    p.setFont("Helvetica", 11)
    subtotal = 0
    for item in order.items.all():
        p.drawString(50, y, item.item_name)
        # Assuming item has a 'price' field
        p.drawCentredString(center + 20, y, f"₹{item.price}") 
        p.drawCentredString(center + 80, y, f"{item.quantity:02d}")
        
        item_total = item.get_total()
        subtotal += item_total
        p.drawRightString(width - 50, y, f"₹{item_total}")
        y -= 20

    # --- Totals Section ---
    p.line(50, y, width - 50, y)
    y -= 20
    
    # Final Total
    p.setFont("Helvetica-Bold", 12)
    p.drawRightString(width - 50, y, f"Total: ₹{order.total_amount}")
    y -= 40

    # --- Footer (Thermal Receipt Style) ---
    p.setDash(1, 0) # Back to solid line
    p.setStrokeColor(colors.lightgrey)
    p.line(50, y, width - 50, y)
    y -= 20
    
    p.setFont("Helvetica-Bold", 9)
    p.drawCentredString(center, y, "**SAVE PAPER SAVE NATURE !!**")
    y -= 15
    p.setFont("Helvetica", 8)
    p.drawCentredString(center, y, "YOU CAN NOW CALL US ON 1800 226344 (TOLL-")
    y -= 10
    p.drawCentredString(center, y, "FREE) FOR QUERIES/COMPLAINTS.")
    y -= 15
    p.drawCentredString(center, y, f"Time: {order.created_at.strftime('%H:%M')}")
    y -= 20
    p.line(50, y, width - 50, y)

    p.showPage()
    p.save()

    buffer.seek(0)
    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="invoice_{order.id}.pdf"'
    return response