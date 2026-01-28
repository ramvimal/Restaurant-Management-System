from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from orders.models import Order 
from menu.models import MenuItem , Category
from django.http import JsonResponse
from django.views.decorators.http import require_POST , require_GET
from django.contrib.auth.decorators import login_required, user_passes_test


def cashier_login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user and user.groups.filter(name="Cashier").exists():
            login(request, user)
            return redirect("cashier_dashboard")

        return render(request, "cashier/login.html", {
            "error": "Invalid credentials or not a cashier"
        })

    return render(request, "cashier/login.html")

def is_cashier(user):
    return user.groups.filter(name="Cashier").exists()


@login_required
@user_passes_test(is_cashier)
def cashier_dashboard(request):
    
    orders = Order.objects.exclude(status="FAILED").order_by("-created_at")
    menu_items_count = MenuItem.objects.count()
    total_orders = Order.objects.count()
    categories = Category.objects.all()


    category_menu = []
    for category in categories:
        available_items = category.menuitem_set.filter(available=True)
        sold_out_items = category.menuitem_set.filter(available=False)

        items = list(available_items) + list(sold_out_items)

        if items:
            category_menu.append({
                "category": category,
                "items": items
            })

    return render(request,"cashier/dashboard.html",
    {
        "orders":orders,
        "menu_items":menu_items_count,
        "total_orders":total_orders,
        "category_menu": category_menu
    })


@login_required
@require_GET
def pending_orders_count(request):
    count = Order.objects.filter(status="PENDING").count()
    return JsonResponse({"pending_orders": count})


@login_required
def cashier_logout(request):
    logout(request)
    return redirect("cashier_login")


@login_required
@user_passes_test(is_cashier)
def cashier_order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    return JsonResponse({
        "id": order.id,
        "customer_name": order.customer_name,
        "status": order.status,
        "total_amount": order.total_amount,
        "items": [
            {
                "name": item.item_name,
                "qty": item.quantity,
                "price": item.price
            }
            for item in order.items.all()
        ]
    })

    # def mark_order_completed(request, order_id):
    #     order = Order.objects.get(id=order_id)
    #     order.status = "COMPLETED"
    #     order.save()

    #     return JsonResponse({"success": True})



@login_required
@user_passes_test(is_cashier)
@require_POST
def update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    new_status = request.POST.get("status")

    valid_statuses = [
        "PENDING", "CONFIRMED", "PREPARING",
        "READY", "DELIVERED", "CANCELLED"
    ]

    if new_status not in valid_statuses:
        return JsonResponse({"error": "Invalid status"}, status=400)

    order.status = new_status
    order.save()

    return JsonResponse({
        "success": True,
        "status": order.status
    })

@require_POST
@login_required
@user_passes_test(is_cashier)
def toggle_menu_item(request, item_id):
    item = get_object_or_404(MenuItem, id=item_id)
    item.available = not item.available
    item.save()

    return JsonResponse({
        "success": True,
        "available": item.available
    })