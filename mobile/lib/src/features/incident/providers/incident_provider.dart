import 'package:flutter/material.dart';
import '../models/incident_model.dart';
import '../../../core/api/api_client.dart';
import 'package:dio/dio.dart';

class IncidentProvider with ChangeNotifier {
  List<Incident> _incidents = [];
  bool _isLoading = false;
  String? _error;

  List<Incident> get incidents => _incidents;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Incident> get pendingIncidents =>
      _incidents.where((i) => i.status == 'menunggu').toList();

  List<Incident> get activeIncidents =>
      _incidents.where((i) => i.status != 'menunggu' && i.status != 'selesai' && i.status != 'batal').toList();

  Future<void> fetchIncidents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient().dio.get('/insiden/');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        _incidents = data.map((json) => Incident.fromJson(json)).toList();
      }
    } on DioException catch (e) {
      _error = 'Gagal memuat data insiden: ${e.message}';
    } catch (e) {
      _error = 'Terjadi kesalahan: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createIncident(Map<String, dynamic> data) async {
    try {
      final response = await ApiClient().dio.post('/insiden/', data: data);
      if (response.statusCode == 201) {
        await fetchIncidents();
        return true;
      }
      return false;
    } on DioException catch (e) {
      _error = 'Gagal membuat laporan: ${e.message}';
      notifyListeners();
      return false;
    }
  }

  Future<void> verifyIncident(String id) async {
    await updateIncidentData(id, {'is_verified': true});
  }

  Future<void> updateIncidentData(String id, Map<String, dynamic> data) async {
    try {
      final response = await ApiClient().dio.patch(
        '/insiden/$id',
        data: data,
      );

      if (response.statusCode == 200) {
        // Re-fetch to get accurate server state
        await fetchIncidents();
      }
    } on DioException catch (e) {
      _error = 'Gagal update data: ${e.message}';
      notifyListeners();
    }
  }

  Future<void> dispatchIncident(String id) async {
    await updateIncidentData(id, {'status': 'berangkat'});
  }

  Future<void> acceptIncident(String id) async {
    await updateIncidentData(id, {
      'waktu_berangkat': DateTime.now().toUtc().toIso8601String()
    });
  }

  Future<void> arriveAtLocation(String id) async {
    await updateIncidentData(id, {
      'status': 'penanganan',
      'waktu_tiba': DateTime.now().toUtc().toIso8601String()
    });
  }

  Future<void> resolveIncident(String id) async {
    await updateIncidentData(id, {
      'status': 'selesai',
      'waktu_selesai': DateTime.now().toUtc().toIso8601String()
    });
  }
}
