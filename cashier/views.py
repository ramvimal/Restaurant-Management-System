from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from orders.models import Order 
from menu.models import MenuItem
from django.http import JsonResponse
from django.views.decorators.http import require_POST 
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

def cashier_logout(request):
    logout(request)
    return redirect("cashier_login")

@login_required(login_url="cashier_login")
@user_passes_test(is_cashier, login_url="cashier_login")
def cashier_dashboard(request):
    orders = Order.objects.exclude(status="FAILED").order_by("-created_at")
    pending_orders = Order.objects.filter(status="PENDING").count()
    menu_items = MenuItem.objects.count()
    return render(request, "cashier/dashboard.html", {
        "orders": orders,
        "pending_orders":pending_orders,
        "menu_items":menu_items,
    })




def mark_order_completed(request, order_id):
    """
    Cashier marks order as completed (after serving)
    """
    order = Order.objects.get(id=order_id)
    order.status = "COMPLETED"
    order.save()

    return JsonResponse({"success": True})

@require_POST
def update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    new_status = request.POST.get("status")

    if new_status not in ["PENDING", "PAID", "FAILED","SELECT STATUS"]:
        return JsonResponse({"error": "Invalid status"}, status=400)


    if order.status == "PAID" and new_status != "PAID":
        if order.paid_at and order.is_status_locked:
            return JsonResponse({"error": "Status locked"}, status=403)

    # ✅ Set paid_at ONLY first time PAID is selected
    if new_status == "PAID" and order.paid_at is None:
        order.paid_at = timezone.now()

    order.status = new_status
    order.save()

    return JsonResponse({
        "success": True,
        "status": order.status,
        "locked": order.is_status_locked
    })


# def cashier_login(request):
#     if request.method == "POST":  
#         username = request.POST.get("username")
#         password = request.POST.get("password")

#         user = authenticate(request, username=username, password=password)
#         if user and user.groups.filter(name="Cashier").exists():
#             print("success")
#             login(request, user)
#             return redirect("cashier_dashboard")

#         return render(request, "cashier/login.html", {
#             "error": "Invalid credentials or not a cashier"
#         })

#     return render(request, "cashier/login.html")


# def cashier_dashboard(request):
#     if not request.user.groups.filter(name="Cashier").exists():
#         return redirect("cashier_login")
    
#     panding_orders = Order.objects.filter(status="PENDING").count()
#     total_menu = MenuItem.objects.count()
#     orders = Order.objects.all()
#     Order.objects.exclude(status="FAILED").order_by("-created_at")

    
#     return render(request,"cashier/dashboard.html",
#                 {"panding_orders":panding_orders,
#                 "total_menu":total_menu,
#                 "orders":orders})

    

# def cashier_order_detail(request, order_id):
#     if not request.user.groups.filter(name="Cashier").exists():
#         return redirect("/")

#     order = get_object_or_404(Order, id=order_id)

#     if request.method == "POST":
#         order.status = "COMPLETED"
#         order.save()
#         return redirect("cashier_dashboard")

#     return render(request, "cashier/order_detail.html", {
#         "order": order
#     })
