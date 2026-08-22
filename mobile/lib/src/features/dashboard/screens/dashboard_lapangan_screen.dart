import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/location_service.dart';
import '../../auth/providers/auth_provider.dart';
import '../../incident/providers/incident_provider.dart';
import '../../incident/models/incident_model.dart';
import '../../ptt/presentation/ptt_widget.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

class DashboardLapanganScreen extends StatefulWidget {
  const DashboardLapanganScreen({super.key});

  @override
  State<DashboardLapanganScreen> createState() => _DashboardLapanganScreenState();
}

class _DashboardLapanganScreenState extends State<DashboardLapanganScreen>
    with SingleTickerProviderStateMixin {
  
  late AnimationController _pulseController;
  late Animation<Color?> _colorAnimation;

  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<IncidentProvider>().fetchIncidents();
    });

    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) {
        context.read<IncidentProvider>().fetchIncidents();
      }
    });
    
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    
    _colorAnimation = ColorTween(
      begin: AppTheme.neonRed.withOpacity(0.5),
      end: AppTheme.neonRed,
    ).animate(_pulseController);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _handleTerima(Incident incident) {
    HapticFeedback.heavyImpact();
    context.read<IncidentProvider>().acceptIncident(incident.id);
    _pulseController.stop();
  }

  Future<void> _handleTiba(Incident incident) async {
    HapticFeedback.heavyImpact();
    try {
      await context.read<IncidentProvider>().arriveAtLocation(incident.id);
      if (mounted) {
        final error = context.read<IncidentProvider>().error;
        if (error != null) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Terjadi kesalahan.')));
      }
    }
  }

  Future<void> _handleSelesai(Incident incident) async {
    HapticFeedback.heavyImpact();
    try {
      await context.read<IncidentProvider>().resolveIncident(incident.id);
      if (mounted) {
        final error = context.read<IncidentProvider>().error;
        if (error != null) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Terjadi kesalahan.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final isRescue = authProvider.user?.role == 'operator_lapangan_penyelamatan';
    
    final incidentProvider = context.watch<IncidentProvider>();
    final activeIncidents = incidentProvider.activeIncidents;
    
    final bool isStandby = activeIncidents.isEmpty;

    // Sync personnel status to LocationService for map marker color
    if (isStandby) {
      LocationService().updateStatus('standby');
    } else {
      // Simplification for marker color if there are multiple, just take the first one's status
      LocationService().updateStatus(activeIncidents.first.status);
    }
    
    // Stop pulsing if there are no new 'berangkat' incidents that haven't been accepted? 
    // Actually let's just pulse if there's any 'menunggu' (if ever) or 'berangkat'
    final hasNewDispatch = activeIncidents.any((i) => i.status == 'menunggu' || i.status == 'berangkat');
    
    if (hasNewDispatch && !_pulseController.isAnimating) {
      _pulseController.repeat(reverse: true);
      HapticFeedback.heavyImpact();
    } else if (!hasNewDispatch && _pulseController.isAnimating) {
      _pulseController.stop();
      _pulseController.reset();
    }
    
    return Scaffold(
      backgroundColor: isStandby ? const Color(0xFF064E3B) : AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(isRescue ? 'UNIT RESCUE' : 'UNIT PEMADAM'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authProvider.logout(),
          )
        ],
      ),
      body: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          return Container(
            color: hasNewDispatch ? _colorAnimation.value : Colors.transparent,
            child: SafeArea(
              child: isStandby ? _buildStandbyView() : _buildIncidentsPageView(activeIncidents, isRescue),
            ),
          );
        },
      ),
      floatingActionButton: const PttWidget(),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }

  Widget _buildStandbyView() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const [
          Icon(Icons.check_circle_outline, size: 100, color: AppTheme.neonGreen),
          SizedBox(height: 24),
          Text(
            'STANDBY',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: AppTheme.neonGreen),
          ),
          Text(
            'Menunggu instruksi Command Center',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentsPageView(List<Incident> incidents, bool isRescue) {
    return Column(
      children: [
        if (incidents.length > 1)
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              '${incidents.length} INSIDEN AKTIF',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ),
        Expanded(
          child: PageView.builder(
            itemCount: incidents.length,
            itemBuilder: (context, index) {
              return _buildIncidentCard(incidents[index], isRescue);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildIncidentCard(Incident currentTask, bool isRescue) {
    final String status = currentTask.status;
    final bool isDispatched = status == 'menunggu';
    final bool isOnWay = status == 'berangkat';
    final bool isOnLocation = status == 'penanganan';

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (isDispatched) ...[
            Icon(isRescue ? Icons.medical_services : Icons.local_fire_department, size: 100, color: Colors.white),
            const SizedBox(height: 24),
            const Text(
              'DARURAT!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Card(
              color: Colors.black54,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('Lokasi: ${currentTask.location}', style: const TextStyle(fontSize: 18, color: Colors.white)),
                    const SizedBox(height: 8),
                    Text('Objek: ${currentTask.title}', style: const TextStyle(color: Colors.white70)),
                  ],
                ),
              ),
            ),
            const Spacer(),
            SizedBox(
              height: 80,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.neonRed,
                ),
                onPressed: () => _handleTerima(currentTask),
                child: const Text('TERIMA & MELUNCUR', style: TextStyle(fontSize: 24)),
              ),
            ),
          ] else if (isOnWay) ...[
            const Icon(Icons.navigation, size: 80, color: AppTheme.neonBlue),
            const SizedBox(height: 16),
            const Text('MENUJU LOKASI', textAlign: TextAlign.center, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.neonBlue)),
            Card(
              color: Colors.black54,
              margin: const EdgeInsets.only(top: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('Lokasi: ${currentTask.location}', style: const TextStyle(fontSize: 16, color: Colors.white)),
                  ],
                ),
              ),
            ),
            if (currentTask.latitude != null && currentTask.longitude != null)
              Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.neonBlue, width: 2),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: FlutterMap(
                      options: MapOptions(
                        initialCenter: LatLng(
                          double.tryParse(currentTask.latitude!) ?? 0,
                          double.tryParse(currentTask.longitude!) ?? 0,
                        ),
                        initialZoom: 15.0,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.sim.armada',
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: LatLng(
                                double.tryParse(currentTask.latitude!) ?? 0,
                                double.tryParse(currentTask.longitude!) ?? 0,
                              ),
                              width: 40,
                              height: 40,
                              child: const Icon(Icons.location_on, color: Colors.red, size: 40),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              const Spacer(),
            SizedBox(
              height: 80,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.neonBlue,
                  foregroundColor: Colors.white,
                ),
                onPressed: () => _handleTiba(currentTask),
                child: const Text('TIBA DI LOKASI', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ),
            ),
          ] else if (isOnLocation) ...[
            const Icon(Icons.build, size: 80, color: AppTheme.neonOrange),
            const SizedBox(height: 24),
            const Text('DALAM PENANGANAN', textAlign: TextAlign.center, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.neonOrange)),
            Card(
              color: Colors.black54,
              margin: const EdgeInsets.only(top: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('Lokasi: ${currentTask.location}', style: const TextStyle(fontSize: 16, color: Colors.white)),
                  ],
                ),
              ),
            ),
            const Spacer(),
            SizedBox(
              height: 80,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.neonGreen),
                onPressed: () => _handleSelesai(currentTask),
                child: const Text('PENANGANAN SELESAI', style: TextStyle(fontSize: 24)),
              ),
            ),
          ]
        ],
      ),
    );
  }
}
