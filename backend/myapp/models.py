# myapp/models.py

from django.db import models

class Patient(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(default='unknown@example.com')


    def __str__(self):
        return self.name

class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=50, default='General')

    def __str__(self):
        return self.name

class Appointment(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['doctor', 'date'], name='idx_doctor_date'),
            models.Index(fields=['status'], name='idx_status'),
            models.Index(fields=['date'], name='idx_date'),
        ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled')
    ])

    def __str__(self):
        return f"Appointment for {self.patient.name} with {self.doctor.name} on {self.date}"
