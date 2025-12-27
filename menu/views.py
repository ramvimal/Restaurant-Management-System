from django.shortcuts import render
from .models import Category , MenuItem

# Create your views here.
def menu_list(request):
    categories = Category.objects.all()

    menu_data = []
    for category in categories:
        
        # print(category.id)
        items = MenuItem.objects.filter(category=category,available=True)

        menu_data.append(
            {
                'category':category,
                'items':items,
            }
        )

    return render(request,"menu/menu.html",{"menu_data":menu_data})