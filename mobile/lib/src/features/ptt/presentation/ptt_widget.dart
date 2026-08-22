import 'package:flutter/material.dart';
import 'package:livekit_client/livekit_client.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/api/api_client.dart';

class PttWidget extends StatefulWidget {
  const PttWidget({Key? key}) : super(key: key);

  @override
  State<PttWidget> createState() => _PttWidgetState();
}

class _PttWidgetState extends State<PttWidget> {
  Room? _room;
  bool _isConnecting = false;
  bool _isConnected = false;
  bool _isTalking = false;

  @override
  void initState() {
    super.initState();
    _connectToLiveKit();
  }

  Future<void> _connectToLiveKit() async {
    setState(() => _isConnecting = true);
    try {
      // 1. Request microphone permissions
      final status = await Permission.microphone.request();
      if (status != PermissionStatus.granted) {
        debugPrint('PTT: Microphone permission denied ($status)');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal: Akses mikrofon ditolak! Izinkan di Settings.')),
          );
        }
        setState(() => _isConnecting = false);
        return;
      }

      // 2. Get Token from Backend
      debugPrint('PTT: Requesting token...');
      final response = await ApiClient().dio.get('/ptt/token');
      final token = response.data['token'];
      debugPrint('PTT: Token received: $token');

      // Note: we assume livekit is running on the local network IP or localhost
      // For local testing on physical iOS, this needs to be the Mac's IP.
      // We will read it from BACKEND_URL and replace port with 7880.
      final backendUrl = ApiClient().dio.options.baseUrl;
      final uri = Uri.parse(backendUrl);
      final livekitUrl = 'ws://${uri.host}:7880';
      debugPrint('PTT: Connecting to LiveKit at $livekitUrl');

      // 3. Connect to LiveKit
      _room = Room();
      
      // Listen to room events if needed
      _room?.addListener(_onRoomChange);

      await _room?.connect(livekitUrl, token);
      debugPrint('PTT: Connected successfully');

      setState(() {
        _isConnected = true;
        _isConnecting = false;
      });
    } catch (e) {
      debugPrint('PTT Connection Error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal connect PTT: $e')),
        );
      }
      setState(() => _isConnecting = false);
    }
  }

  void _onRoomChange() {
    // Handle participant events if needed
  }

  Future<void> _startTalking() async {
    if (!_isConnected || _room == null) return;
    try {
      setState(() => _isTalking = true);
      await _room?.localParticipant?.setMicrophoneEnabled(true);
    } catch (e) {
      debugPrint('Error starting mic: $e');
      setState(() => _isTalking = false);
    }
  }

  Future<void> _stopTalking() async {
    if (!_isConnected || _room == null) return;
    try {
      setState(() => _isTalking = false);
      await _room?.localParticipant?.setMicrophoneEnabled(false);
    } catch (e) {
      debugPrint('Error stopping mic: $e');
    }
  }

  @override
  void dispose() {
    _room?.removeListener(_onRoomChange);
    _room?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isConnecting) {
      return const FloatingActionButton(
        onPressed: null,
        backgroundColor: Colors.grey,
        child: CircularProgressIndicator(color: Colors.white),
      );
    }

    if (!_isConnected) {
      return FloatingActionButton(
        onPressed: _connectToLiveKit,
        backgroundColor: Colors.redAccent,
        tooltip: 'Connect PTT',
        child: const Icon(Icons.wifi_off),
      );
    }

    return GestureDetector(
      onPanDown: (_) => _startTalking(),
      onPanEnd: (_) => _stopTalking(),
      onPanCancel: () => _stopTalking(),
      child: FloatingActionButton(
        onPressed: () {}, // Handled by gesture detector
        backgroundColor: _isTalking ? Colors.red : Colors.green,
        elevation: _isTalking ? 12 : 6,
        child: Icon(
          _isTalking ? Icons.mic : Icons.mic_none,
          size: 32,
        ),
      ),
    );
  }
}
