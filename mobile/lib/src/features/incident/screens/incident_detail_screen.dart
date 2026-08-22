import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../incident/models/incident_model.dart';
import '../../incident/providers/incident_provider.dart';

class IncidentDetailScreen extends StatelessWidget {
  final Incident incident;

  const IncidentDetailScreen({super.key, required this.incident});

  @override
  Widget build(BuildContext context) {
    // Watch the provider so the screen rebuilds after verify/dispatch
    final provider = context.watch<IncidentProvider>();
    // Get fresh data from provider list
    final liveIncident = provider.incidents
        .where((i) => i.id == incident.id)
        .firstOrNull ?? incident;

    final isFire = liveIncident.type == 'pemadaman';
    final Color accentColor = isFire ? AppTheme.neonRed : AppTheme.neonBlue;
    final IconData typeIcon = isFire ? Icons.local_fire_department : Icons.health_and_safety;

    return Scaffold(
      appBar: AppBar(
        title: const Text('DETAIL LAPORAN'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- Header Card ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: accentColor.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: accentColor.withOpacity(0.2),
                          child: Icon(typeIcon, color: accentColor, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                liveIncident.title,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isFire
                                      ? AppTheme.neonRed.withOpacity(0.15)
                                      : AppTheme.neonBlue.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  isFire ? 'PEMADAMAN' : 'PENYELAMATAN',
                                  style: TextStyle(
                                    color: accentColor,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Verification badge
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                      decoration: BoxDecoration(
                        color: liveIncident.isVerified
                            ? AppTheme.neonGreen.withOpacity(0.1)
                            : AppTheme.neonOrange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: liveIncident.isVerified
                              ? AppTheme.neonGreen.withOpacity(0.3)
                              : AppTheme.neonOrange.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            liveIncident.isVerified ? Icons.verified : Icons.warning_amber_rounded,
                            color: liveIncident.isVerified ? AppTheme.neonGreen : AppTheme.neonOrange,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            liveIncident.isVerified ? 'LAPORAN TERVERIFIKASI' : 'BELUM DIVERIFIKASI',
                            style: TextStyle(
                              color: liveIncident.isVerified ? AppTheme.neonGreen : AppTheme.neonOrange,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // --- Info Section ---
              _buildSectionTitle('Informasi Kejadian'),
              const SizedBox(height: 12),
              _buildInfoRow(Icons.location_on, 'Alamat', liveIncident.location),
              _buildInfoRow(Icons.home_work, 'Objek', liveIncident.objek),
              _buildInfoRow(Icons.access_time, 'Waktu Lapor', liveIncident.time),
              _buildInfoRow(Icons.category, 'Status', _statusLabel(liveIncident.status)),

              const SizedBox(height: 24),

              // --- Pelapor Section ---
              _buildSectionTitle('Data Pelapor'),
              const SizedBox(height: 12),
              _buildInfoRow(Icons.person, 'Nama', liveIncident.pelaporNama),
              _buildInfoRow(Icons.phone, 'Kontak', liveIncident.pelaporKontak),
              if (liveIncident.pelaporAlamat != null && liveIncident.pelaporAlamat!.isNotEmpty)
                _buildInfoRow(Icons.location_city, 'Alamat Pelapor', liveIncident.pelaporAlamat!),

              const SizedBox(height: 32),

              // --- Action Buttons ---
              if (liveIncident.status == 'menunggu') ...[
                if (!liveIncident.isVerified)
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.neonGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.verified, size: 22),
                      label: const Text('VERIFIKASI LAPORAN', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      onPressed: () async {
                        await provider.verifyIncident(liveIncident.id);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Laporan berhasil diverifikasi! Notifikasi WA diteruskan ke grup siaga.'),
                              backgroundColor: AppTheme.neonGreen,
                            ),
                          );
                        }
                      },
                    ),
                  ),

                if (liveIncident.isVerified) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.neonBlue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.send, size: 22),
                      label: const Text('DISPATCH ARMADA', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: AppTheme.surface,
                            title: const Text('Konfirmasi Dispatch'),
                            content: const Text('Apakah Anda yakin ingin mendispatch armada untuk laporan ini?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text('BATAL', style: TextStyle(color: Colors.white54)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.neonBlue),
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text('YA, DISPATCH', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        );

                        if (confirm == true) {
                          await provider.dispatchIncident(liveIncident.id);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Armada berhasil diberangkatkan!'),
                                backgroundColor: AppTheme.neonBlue,
                              ),
                            );
                          }
                        }
                      },
                    ),
                  ),
                ],
              ],

              // Status indicator for non-pending
              if (liveIncident.status != 'menunggu')
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceHighlight,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    children: [
                      Icon(_statusIcon(liveIncident.status), size: 40, color: _statusColor(liveIncident.status)),
                      const SizedBox(height: 8),
                      Text(
                        _statusLabel(liveIncident.status),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _statusColor(liveIncident.status),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 16),

              // Tombol Bagikan ke WhatsApp
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const FaIcon(FontAwesomeIcons.whatsapp, size: 22),
                  label: const Text(
                    'BAGIKAN KE WHATSAPP',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  onPressed: () async {
                    final jenisStr = isFire ? 'KEBAKARAN' : 'PENYELAMATAN (RESCUE)';
                    final mapsLink = (liveIncident.latitude != null && liveIncident.longitude != null)
                        ? 'https://maps.google.com/?q=${liveIncident.latitude},${liveIncident.longitude}'
                        : '-';
                    final text = '🚨 *SIAGA DAMKAR - LAPORAN INSIDEN* 🚨\n━━━━━━━━━━━━━━━━━━━━━━\n🔥 *Jenis Insiden* : $jenisStr\n🏷️ *Kategori*      : ${liveIncident.title}\n🏢 *Objek Kejadian* : ${liveIncident.objek.isEmpty ? '-' : liveIncident.objek}\n📍 *Alamat Lokasi* : ${liveIncident.location}\n🗺️ *Titik Peta*    : $mapsLink\n\n👤 *Data Pelapor (Sesuai KTP)*:\n• *Nama*   : ${liveIncident.pelaporNama}\n• *Kontak* : ${liveIncident.pelaporKontak}\n• *Alamat* : ${liveIncident.pelaporAlamat ?? '-'}\n\n⚠️ *Status*: *${liveIncident.status.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━━━\n_Sistem Informasi Manajemen Armada (PYROFAR)_';
                    final uri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(text)}');
                    try {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Gagal membuka WhatsApp: $e')),
                        );
                      }
                    }
                  },
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppTheme.textSecondary,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppTheme.textSecondary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                const SizedBox(height: 2),
                Text(
                  value.isEmpty ? '-' : value,
                  style: const TextStyle(color: Colors.white, fontSize: 15),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'menunggu': return 'Menunggu';
      case 'berangkat': return 'Armada Berangkat';
      case 'penanganan': return 'Dalam Penanganan';
      case 'selesai': return 'Selesai';
      case 'batal': return 'Dibatalkan';
      default: return status;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'berangkat': return Icons.local_shipping;
      case 'penanganan': return Icons.build;
      case 'selesai': return Icons.check_circle;
      case 'batal': return Icons.cancel;
      default: return Icons.hourglass_empty;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'berangkat': return AppTheme.neonBlue;
      case 'penanganan': return AppTheme.neonOrange;
      case 'selesai': return AppTheme.neonGreen;
      case 'batal': return AppTheme.neonRed;
      default: return AppTheme.textSecondary;
    }
  }
}
