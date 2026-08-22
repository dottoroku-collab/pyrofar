import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'dart:io' show Platform;

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;

  factory ApiClient() {
    return _instance;
  }

  static String getBaseUrl() {
    if (kIsWeb) {
      return const String.fromEnvironment('API_URL',
          defaultValue: 'https://api.pyrofar.com/api/v1');
    }
    if (Platform.isAndroid) {
      // Changed to host IP so it works on physical devices too. 
      // If using emulator, 192.168.88.163 still works as long as they are on the same network.
      return const String.fromEnvironment('API_URL',
          defaultValue: 'https://api.pyrofar.com/api/v1');
    }
    return const String.fromEnvironment('API_URL',
        defaultValue: 'https://api.pyrofar.com/api/v1');
  }

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: getBaseUrl(), 
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('access_token');
          // Handle global logout if needed
        }
        return handler.next(e);
      },
    ));
  }
}
