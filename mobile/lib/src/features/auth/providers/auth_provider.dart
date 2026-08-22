import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/location_service.dart';
import '../../../core/services/notification_service.dart';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');
      
      if (token != null) {
        await _fetchCurrentUser();
      }
    } catch (e) {
      // Ignored
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // API expects JSON with email and password
      final response = await ApiClient().dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      final token = response.data['access_token'];
      final userJson = response.data['user'];
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', token);

      _user = User.fromJson(userJson);

      // Start GPS tracking for operator roles
      await LocationService().start(_user!.role);
      
      // Start polling notifications
      NotificationService().startPolling();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Login gagal. Periksa kembali NIP/Email dan password Anda.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> _fetchCurrentUser() async {
    try {
      final response = await ApiClient().dio.get('/auth/me');
      _user = User.fromJson(response.data);

      // Resume GPS tracking if user is an operator
      await LocationService().start(_user!.role);

      // Start polling notifications
      NotificationService().startPolling();
    } catch (e) {
      _user = null;
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('access_token');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    // Stop GPS tracking and clear server-side location data
    await LocationService().stop();
    
    // Stop polling notifications
    NotificationService().stopPolling();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    _user = null;
    notifyListeners();
  }
}
