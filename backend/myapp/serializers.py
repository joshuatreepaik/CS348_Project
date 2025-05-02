# myapp/serializers.py

from rest_framework import serializers
from .models import Patient, Doctor, Appointment

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'doctor', 'date', 'status', 'patient_name', 'doctor_name']
