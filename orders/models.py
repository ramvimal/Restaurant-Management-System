from django.db import models

# Create your models here.

class Order(models.Model):
    create_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Order #{self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order,on_delete=models.CASCADE)
    food_item = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8,decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def get_total(self):
        return self.price * self.quantity