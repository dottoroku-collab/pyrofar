import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../incident/providers/incident_provider.dart';
import '../../incident/screens/incident_detail_screen.dart';
import '../../incident/screens/create_incident_screen.dart';

class DashboardCCScreen extends StatefulWidget {
  const DashboardCCScreen({super.key});

  @override
  State<DashboardCCScreen> createState() => _DashboardCCScreenState();
}

class _DashboardCCScreenState extends State<DashboardCCScreen> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<IncidentProvider>().fetchIncidents();
    });

    // Auto-refresh every 5 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) {
        context.read<IncidentProvider>().fetchIncidents();
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _openDetail(incident) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => IncidentDetailScreen(incident: incident),
      ),
    );
  }

  void _openCreateForm() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const CreateIncidentScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final incidentProvider = context.watch<IncidentProvider>();
    final pendingIncidents = incidentProvider.pendingIncidents;

    return Scaffold(
      appBar: AppBar(
        title: const Text('COMMAND CENTER'),
        actions: [
          const Center(
            child: Padding(
              padding: EdgeInsets.only(right: 8.0),
              child: _PulseIndicator(),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          )
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateForm,
        backgroundColor: AppTheme.neonRed,
        icon: const Icon(Icons.add_alert, color: Colors.white),
        label: const Text('LAPORAN BARU', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Laporan Masuk',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.neonOrange,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${pendingIncidents.length} laporan menunggu verifikasi',
                style: const TextStyle(color: Colors.white54, fontSize: 13),
              ),
              const SizedBox(height: 16),
              if (incidentProvider.error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(incidentProvider.error!, style: const TextStyle(color: Colors.red)),
                ),
              Expanded(
                child: pendingIncidents.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_outline, size: 64, color: AppTheme.neonGreen.withOpacity(0.5)),
                            const SizedBox(height: 16),
                            const Text(
                              'Tidak ada laporan masuk',
                              style: TextStyle(color: Colors.white70, fontSize: 16),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Semua laporan sudah ditangani',
                              style: TextStyle(color: Colors.white38, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: pendingIncidents.length,
                        itemBuilder: (context, index) {
                          final incident = pendingIncidents[index];
                          final isFire = incident.type == 'pemadaman';

                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 6),
                            child: InkWell(
                              onTap: () => _openDetail(incident),
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    // Icon
                                    CircleAvatar(
                                      radius: 24,
                                      backgroundColor: isFire
                                          ? AppTheme.neonRed.withOpacity(0.2)
                                          : AppTheme.neonBlue.withOpacity(0.2),
                                      child: Icon(
                                        isFire ? Icons.local_fire_department : Icons.health_and_safety,
                                        color: isFire ? AppTheme.neonRed : AppTheme.neonBlue,
                                        size: 26,
                                      ),
                                    ),
                                    const SizedBox(width: 14),

                                    // Info
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            incident.title,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 6),
                                          Row(
                                            children: [
                                              const Icon(Icons.location_on, size: 14, color: Colors.white54),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  incident.location,
                                                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              const Icon(Icons.access_time, size: 14, color: Colors.white54),
                                              const SizedBox(width: 4),
                                              Text(incident.time, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),

                                    const SizedBox(width: 8),

                                    // Verification badge + arrow
                                    Column(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: incident.isVerified
                                                ? AppTheme.neonGreen.withOpacity(0.15)
                                                : AppTheme.neonOrange.withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            incident.isVerified ? 'Verified' : 'Unverified',
                                            style: TextStyle(
                                              color: incident.isVerified ? AppTheme.neonGreen : AppTheme.neonOrange,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        const Icon(Icons.chevron_right, color: Colors.white38),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PulseIndicator extends StatefulWidget {
  const _PulseIndicator();

  @override
  State<_PulseIndicator> createState() => _PulseIndicatorState();
}

class _PulseIndicatorState extends State<_PulseIndicator> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.2, end: 1.0).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: AppTheme.neonGreen,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          const Text('SIAGA', style: TextStyle(color: AppTheme.neonGreen, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
        ],
      ),
    );
  }
}
