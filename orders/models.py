from django.db import models

class Order(models.Model):
    customer_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    total_amount = models.FloatField()
    phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    status_choices = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    status = models.CharField(
        max_length=10,
        choices=status_choices,
        default='PENDING'
    )



class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=100,default="null")
    price = models.FloatField()
    quantity = models.IntegerField()

    def get_total(self):
        return self.price * self.quantity
