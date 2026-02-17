from django.db import models
from django.utils import timezone

class Order(models.Model):
    customer_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    total_amount = models.FloatField()
    phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    address = models.TextField(default="no")

    payment_choices = [
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
    ]
    payment_mode = models.CharField(
        max_length=20,
        choices=payment_choices,
        default='CASH')

    status_choices = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED','Cancelled'),
    ]

    status = models.CharField(
        max_length=20,
        choices=status_choices,
        default='PENDING'
    )

    paid_at = models.DateTimeField(null=True, blank=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=100,default="null")
    price = models.FloatField()
    quantity = models.IntegerField()

    def get_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"Order #{self.id} - {self.order.customer_name}"