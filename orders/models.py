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

    status_choices = [
        ('SELECT STATUS','Select Status'),
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    status = models.CharField(
        max_length=13,
        choices=status_choices,
        default='SELECT STATUS'
    )

    status_updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_status_locked(self):
        if self.status != "PAID" or not self.paid_at:
            return False
        return timezone.now() > self.paid_at + timezone.timedelta(seconds=10)
    

    


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=100,default="null")
    price = models.FloatField()
    quantity = models.IntegerField()

    def get_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"Order #{self.id} - {self.order.customer_name}"