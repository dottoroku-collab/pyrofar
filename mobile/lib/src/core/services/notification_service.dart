import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../api/api_client.dart';
import '../utils/fcm_handler.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  Timer? _timer;
  bool _isRunning = false;

  void startPolling() {
    if (_isRunning) return;
    _isRunning = true;
    _timer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _fetchAndShowNotifications();
    });
  }

  void stopPolling() {
    _timer?.cancel();
    _timer = null;
    _isRunning = false;
  }

  Future<void> _fetchAndShowNotifications() async {
    try {
      final response = await ApiClient().dio.get('/notifikasi');
      if (response.data is List) {
        final List notifs = response.data;
        for (var notif in notifs) {
          if (notif['is_read'] == false) {
            // Show notification
            _showLocalNotification(notif);
            
            // Mark as read
            await ApiClient().dio.put('/notifikasi/${notif['id']}/read');
          }
        }
      }
    } catch (e) {
      debugPrint('Notification polling error: $e');
    }
  }

  void _showLocalNotification(Map<String, dynamic> notif) {
    final title = 'Notifikasi SIM Armada';
    final body = notif['pesan'] ?? 'Anda mendapat pesan baru';
    
    flutterLocalNotificationsPlugin.show(
      id: notif['id'] ?? DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title: title,
      body: body,
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'emergency_channel',
          'Emergency Alerts',
          channelDescription: 'Bypasses Do Not Disturb for critical fire/rescue alerts.',
          importance: Importance.max,
          priority: Priority.max,
          fullScreenIntent: true,
          category: AndroidNotificationCategory.alarm,
          audioAttributesUsage: AudioAttributesUsage.alarm,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
          interruptionLevel: InterruptionLevel.critical,
        ),
      ),
    );
  }
}
