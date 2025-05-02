# myapp/views.py

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from .models import Patient, Doctor, Appointment
from .serializers import PatientSerializer, DoctorSerializer, AppointmentSerializer
from rest_framework import status
from rest_framework.decorators import action
from datetime import date

from django.views.generic import TemplateView



class FrontendAppView(TemplateView):
    template_name = "index.html"

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('date')
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        today = date.today()
        outdated = Appointment.objects.filter(date__lt=today, status='Scheduled')
        outdated.update(status='Completed')  # Automatically update outdated appointments
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        patient_name = request.data.get('patient_name')
        doctor_name = request.data.get('doctor_name')
        date = request.data.get('date')
        appointment_status = request.data.get('status')

        # Validate date before processing
        if not date:
            return Response({'error': 'Date is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = Patient.objects.get(name=patient_name)
            doctor = Doctor.objects.get(name=doctor_name)
            appointment = Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                date=date,
                status=appointment_status
            )
            serializer = self.get_serializer(appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)


    def update(self, request, *args, **kwargs):
        appointment = self.get_object()
        patient_name = request.data.get('patient_name')
        doctor_name = request.data.get('doctor_name')
        date = request.data.get('date')
        appointment_status = request.data.get('status')  # Renamed to avoid conflict

        try:
            patient = Patient.objects.get(name=patient_name)
            doctor = Doctor.objects.get(name=doctor_name)
            appointment.patient = patient
            appointment.doctor = doctor
            appointment.date = date
            appointment.status = appointment_status
            appointment.save()
            serializer = self.get_serializer(appointment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        try:
            appointment = self.get_object()
            appointment.status = 'Cancelled'
            appointment.save()
            return Response({'message': 'Appointment canceled successfully.'}, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def appointment_report(request):
    doctor_name = request.query_params.get('doctor', None)
    start_date = request.query_params.get('start_date', None)
    end_date = request.query_params.get('end_date', None)

    try:
        doctor = Doctor.objects.get(name=doctor_name) if doctor_name else None
        doctor_id = doctor.id if doctor else None

        with connection.cursor() as cursor:
            # Basic appointment statistics
            query = """
                SELECT COUNT(*) AS total_appointments, 
                       COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS completed_appointments,
                       COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS cancelled_appointments,
                       COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) AS scheduled_appointments,
                       AVG(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) * 100 AS completion_rate,
                       AVG(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) * 100 AS cancellation_rate
                FROM myapp_appointment
                WHERE (%s IS NULL OR doctor_id = %s)
                  AND (date BETWEEN %s AND %s);
            """
            cursor.execute(query, [doctor_id, doctor_id, start_date, end_date])
            row = cursor.fetchone()

            # Most frequent doctor
            freq_doctor_query = """
                SELECT d.name, COUNT(*) AS freq_count
                FROM myapp_appointment a
                JOIN myapp_doctor d ON a.doctor_id = d.id
                WHERE (a.date BETWEEN %s AND %s)
                GROUP BY d.name
                ORDER BY freq_count DESC
                LIMIT 1;
            """
            cursor.execute(freq_doctor_query, [start_date, end_date])
            freq_doctor = cursor.fetchone()

            # Day with the most appointments
            most_appointments_day_query = """
                SELECT date, COUNT(*) AS num_appointments
                FROM myapp_appointment
                WHERE (date BETWEEN %s AND %s)
                GROUP BY date
                ORDER BY num_appointments DESC
                LIMIT 1;
            """
            cursor.execute(most_appointments_day_query, [start_date, end_date])
            most_day = cursor.fetchone()

        # views.py (part of appointment_report function)
        report = {
            "total_appointments": row[0] or 0,
            "completed_appointments": row[1] or 0,
            "cancelled_appointments": row[2] or 0,
            "scheduled_appointments": row[3] or 0,
            "completion_rate": row[4] if row[4] is not None else 0,
            "cancellation_rate": row[5] if row[5] is not None else 0,
            "most_frequent_doctor": freq_doctor[0] if freq_doctor else "N/A",
            "day_with_most_appointments": most_day[0] if most_day else "N/A",
            "num_appointments_on_peak_day": most_day[1] if most_day else 0,
        }
        return Response(report)


    except Doctor.DoesNotExist:
        return Response({"error": "Doctor not found"}, status=404)