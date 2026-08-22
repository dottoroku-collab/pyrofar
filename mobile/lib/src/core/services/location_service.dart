import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../api/api_client.dart';

/// Background GPS location service that periodically sends the device's
/// position to the backend tracking endpoint.
///
/// Only activated for operator roles (not pimpinan / administrator).
class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  StreamSubscription<Position>? _positionStream;
  Timer? _timer;
  Position? _lastPosition;
  bool _isRunning = false;

  /// Current personnel status: 'standby', 'berangkat', 'penanganan'
  String _personnelStatus = 'standby';

  bool get isRunning => _isRunning;
  String get personnelStatus => _personnelStatus;

  /// Update the personnel status that is sent with each GPS update.
  void updateStatus(String status) {
    const validStatuses = {'standby', 'berangkat', 'penanganan'};
    _personnelStatus = validStatuses.contains(status) ? status : 'standby';
    
    // Immediately send update to backend with new status if we have a position
    if (_lastPosition != null) {
      _sendLocationToBackend(_lastPosition!);
    }
  }

  /// Roles that should NOT be tracked.
  static const _nonTrackedRoles = {'pimpinan', 'administrator', 'operator_cc'};

  /// Start the periodic location updates.
  /// Returns `false` if the role is excluded or permissions are denied.
  Future<bool> start(String role) async {
    try {
      if (_nonTrackedRoles.contains(role)) {
        return false;
      }

      // Request location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied ||
            permission == LocationPermission.deniedForever) {
          return false;
        }
      }

      if (_isRunning) return true; // Already running

      _isRunning = true;

      // Define platform specific settings for background updates
      late LocationSettings locationSettings;
      if (defaultTargetPlatform == TargetPlatform.android) {
        locationSettings = AndroidSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
          intervalDuration: const Duration(seconds: 15),
        );
      } else if (defaultTargetPlatform == TargetPlatform.iOS || defaultTargetPlatform == TargetPlatform.macOS) {
        locationSettings = AppleSettings(
          accuracy: LocationAccuracy.high,
          activityType: ActivityType.automotiveNavigation,
          distanceFilter: 10,
          pauseLocationUpdatesAutomatically: false,
          allowBackgroundLocationUpdates: true,
          showBackgroundLocationIndicator: true,
        );
      } else {
        locationSettings = const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        );
      }

      // Also get initial position immediately to populate the map quickly
      try {
        _lastPosition = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        if (_lastPosition != null) {
          await _sendLocationToBackend(_lastPosition!);
        }
      } catch (_) {}

      _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings).listen(
        (Position position) async {
          _lastPosition = position;
          await _sendLocationToBackend(position);
        },
        onError: (e) {
          print('Location tracking stream error: $e');
        },
      );

      // Setup a heartbeat timer to ensure backend doesn't drop the user
      // if they haven't moved (since backend drops after 2 mins of no updates)
      _timer = Timer.periodic(const Duration(seconds: 30), (timer) {
        if (_lastPosition != null) {
          _sendLocationToBackend(_lastPosition!);
        }
      });

      return true;
    } catch (e) {
      print('LocationService start error: $e');
      return false;
    }
  }

  /// Stop location tracking (called on logout).
  Future<void> stop() async {
    await _positionStream?.cancel();
    _timer?.cancel();
    _positionStream = null;
    _timer = null;
    _lastPosition = null;
    _isRunning = false;
    _personnelStatus = 'standby';

    // Notify backend to remove this user's tracking record
    try {
      await ApiClient().dio.delete('/tracking/clear');
    } catch (_) {
      // Best-effort: ignore network errors during logout cleanup
    }
  }

  /// Send GPS position to backend.
  Future<void> _sendLocationToBackend(Position position) async {
    try {
      final Map<String, dynamic> body = {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'accuracy_m': position.accuracy,
        'speed_kmh': position.speed >= 0 ? (position.speed * 3.6) : 0.0,
        'heading': position.heading >= 0 ? position.heading : null,
        'personnel_status': _personnelStatus,
      };

      await ApiClient().dio.post('/tracking/update-location', data: body);
    } catch (e) {
      print('Location posting error: $e');
      // Silently ignore errors — will retry next cycle
    }
  }
}
