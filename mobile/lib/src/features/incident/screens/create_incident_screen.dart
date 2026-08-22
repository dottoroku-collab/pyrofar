import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../incident/providers/incident_provider.dart';

class CreateIncidentScreen extends StatefulWidget {
  const CreateIncidentScreen({super.key});

  @override
  State<CreateIncidentScreen> createState() => _CreateIncidentScreenState();
}

class _CreateIncidentScreenState extends State<CreateIncidentScreen> {
  final _formKey = GlobalKey<FormState>();
  final MapController _mapController = MapController();
  final ImagePicker _imagePicker = ImagePicker();

  bool _isSubmitting = false;
  bool _isSearchingMap = false;
  bool _isGettingLocation = false;

  // --- Form Fields ---
  String _jenisInsiden = 'pemadaman';
  String? _selectedKategori = 'Listrik';
  String? _selectedObjek = 'Rumah Tinggal';

  final _kategoriCustomController = TextEditingController();
  final _objekCustomController = TextEditingController();
  final _alamatController = TextEditingController();
  final _pelaporNamaController = TextEditingController();
  final _pelaporKontakController = TextEditingController();
  final _pelaporAlamatController = TextEditingController();

  // --- Map State ---
  // Default Makassar coordinates
  LatLng _selectedPosition = const LatLng(-5.147665, 119.432731);

  // --- Media State ---
  final List<XFile> _capturedPhotos = [];
  XFile? _capturedVideo;

  // Preset Kategori Kebakaran
  final List<String> _kategoriKebakaranList = [
    'Listrik',
    'Tabung Gas/Kompor',
    'Lilin / Obat Nyamuk',
    'Sampah Alang Alang',
    'Lainnya',
  ];

  // Preset Objek Kebakaran
  final List<String> _objekKebakaranList = [
    'Rumah Tinggal',
    'Toko Kios Cafe',
    'Industri Perusahaan',
    'Gudang',
    'Pasar',
    'Hotel / Asrama',
    'Kantor Sekolah',
    'Kendaraan',
    'Sampah/Alang-Alang/Dll',
  ];

  // Preset Penyelamatan
  final List<String> _kategoriPenyelamatanList = [
    'Evakuasi Hewan Liar',
    'Pohon Tumbang',
    'Pelepasan Cincin',
    'Penyelamatan Korban / SAR',
    'Banjir & Bencana Alam',
    'Lainnya',
  ];

  final List<String> _objekPenyelamatanList = [
    'Pohon / Jalan',
    'Cincin / Jari Tangan',
    'Sarang Tawon / Ular',
    'Sumur / Bangunan Runtuh',
    'Kendaraan / Sungai',
    'Lainnya',
  ];

  @override
  void initState() {
    super.initState();
    _selectedKategori = _kategoriKebakaranList.first;
    _selectedObjek = _objekKebakaranList.first;
  }

  @override
  void dispose() {
    _kategoriCustomController.dispose();
    _objekCustomController.dispose();
    _alamatController.dispose();
    _pelaporNamaController.dispose();
    _pelaporKontakController.dispose();
    _pelaporAlamatController.dispose();
    super.dispose();
  }

  void _onJenisChanged(String jenis) {
    setState(() {
      _jenisInsiden = jenis;
      if (jenis == 'pemadaman') {
        _selectedKategori = _kategoriKebakaranList.first;
        _selectedObjek = _objekKebakaranList.first;
      } else {
        _selectedKategori = _kategoriPenyelamatanList.first;
        _selectedObjek = _objekPenyelamatanList.first;
      }
    });
  }

  Future<void> _searchAddressOnMap() async {
    final query = _alamatController.text.trim();
    if (query.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan masukkan alamat kejadian terlebih dahulu.'),
          backgroundColor: AppTheme.neonOrange,
        ),
      );
      return;
    }

    setState(() => _isSearchingMap = true);

    try {
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/search?format=json&q=${Uri.encodeComponent(query)}',
      );
      final response = await http.get(url, headers: {
        'User-Agent': 'SimArmadaMobile/1.0',
      });

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          final lat = double.parse(data[0]['lat'].toString());
          final lon = double.parse(data[0]['lon'].toString());
          final newPos = LatLng(lat, lon);

          setState(() => _selectedPosition = newPos);
          _mapController.move(newPos, 16.0);

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Lokasi berhasil ditemukan pada peta!'),
                backgroundColor: AppTheme.neonGreen,
              ),
            );
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Lokasi tidak ditemukan di database peta. Geser atau tap peta secara manual.'),
                backgroundColor: AppTheme.neonOrange,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mencari lokasi: $e'),
            backgroundColor: AppTheme.neonRed,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSearchingMap = false);
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isGettingLocation = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Izin lokasi ditolak.');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Izin lokasi ditolak secara permanen. Aktifkan di Pengaturan.');
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final newPos = LatLng(position.latitude, position.longitude);
      setState(() => _selectedPosition = newPos);
      _mapController.move(newPos, 16.5);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Koordinat GPS Anda berhasil disematkan di peta!'),
            backgroundColor: AppTheme.neonGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengambil GPS: $e'),
            backgroundColor: AppTheme.neonRed,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isGettingLocation = false);
    }
  }

  // --- Media Pickers ---
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (image != null) {
        setState(() => _capturedPhotos.add(image));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengambil foto: $e'),
            backgroundColor: AppTheme.neonRed,
          ),
        );
      }
    }
  }

  Future<void> _pickVideo(ImageSource source) async {
    try {
      final XFile? video = await _imagePicker.pickVideo(
        source: source,
        maxDuration: const Duration(minutes: 2),
      );
      if (video != null) {
        setState(() => _capturedVideo = video);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengambil video: $e'),
            backgroundColor: AppTheme.neonRed,
          ),
        );
      }
    }
  }

  void _showMediaPickerSheet({required bool isVideo}) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                isVideo ? 'Ambil / Unggah Video Kejadian' : 'Ambil / Unggah Foto Kejadian',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.neonRed.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isVideo ? Icons.videocam : Icons.camera_alt,
                    color: AppTheme.neonRed,
                  ),
                ),
                title: Text(
                  isVideo ? 'Rekam Video Langsung' : 'Ambil Foto dari Kamera',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  if (isVideo) {
                    _pickVideo(ImageSource.camera);
                  } else {
                    _pickImage(ImageSource.camera);
                  }
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.neonBlue.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.photo_library, color: AppTheme.neonBlue),
                ),
                title: Text(
                  isVideo ? 'Pilih Video dari Galeri' : 'Pilih Foto dari Galeri',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  if (isVideo) {
                    _pickVideo(ImageSource.gallery);
                  } else {
                    _pickImage(ImageSource.gallery);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mohon lengkapi semua kolom wajib.'),
          backgroundColor: AppTheme.neonRed,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final kategori = (_selectedKategori == 'Lainnya' && _kategoriCustomController.text.trim().isNotEmpty)
        ? _kategoriCustomController.text.trim()
        : (_selectedKategori ?? 'Listrik');

    final objek = (_selectedObjek == 'Lainnya' && _objekCustomController.text.trim().isNotEmpty)
        ? _objekCustomController.text.trim()
        : (_selectedObjek ?? 'Rumah Tinggal');

    final data = {
      'jenis_insiden': _jenisInsiden,
      'kategori': kategori,
      'objek': objek,
      'alamat': _alamatController.text.trim(),
      'pelapor_nama': _pelaporNamaController.text.trim(),
      'pelapor_kontak': _pelaporKontakController.text.trim(),
      'pelapor_alamat': _pelaporAlamatController.text.trim(),
      'latitude': _selectedPosition.latitude.toString(),
      'longitude': _selectedPosition.longitude.toString(),
      'status': 'menunggu',
      'is_verified': false,
    };

    final success = await context.read<IncidentProvider>().createIncident(data);

    setState(() => _isSubmitting = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Laporan insiden berhasil dikirim ke Command Center!'),
          backgroundColor: AppTheme.neonGreen,
        ),
      );
      Navigator.of(context).pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Gagal membuat laporan. Silakan coba lagi.'),
          backgroundColor: AppTheme.neonRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFire = _jenisInsiden == 'pemadaman';
    final primaryAccent = isFire ? AppTheme.neonRed : AppTheme.neonBlue;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'TAMBAH LAPORAN BARU',
          style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1.1, fontSize: 16),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // --- 1. Tipe / Jenis Insiden ---
                _buildSectionHeader(
                  icon: Icons.category_rounded,
                  title: 'JENIS INSIDEN',
                  color: primaryAccent,
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _buildTypeCard(
                        title: 'Kebakaran',
                        subtitle: 'Pemadaman Api',
                        icon: Icons.local_fire_department_rounded,
                        isSelected: isFire,
                        accentColor: AppTheme.neonRed,
                        onTap: () => _onJenisChanged('pemadaman'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildTypeCard(
                        title: 'Penyelamatan',
                        subtitle: 'Rescue & Evakuasi',
                        icon: Icons.health_and_safety_rounded,
                        isSelected: !isFire,
                        accentColor: AppTheme.neonBlue,
                        onTap: () => _onJenisChanged('penyelamatan'),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // --- 2. Data Pelapor (Sesuai KTP) ---
                _buildSectionHeader(
                  icon: Icons.badge_rounded,
                  title: 'DATA PELAPOR (SESUAI KTP)',
                  color: primaryAccent,
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.surfaceHighlight),
                  ),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _pelaporNamaController,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration(
                          label: 'Nama Pelapor (Sesuai KTP)',
                          hint: 'Masukkan nama lengkap pelapor',
                          icon: Icons.person_rounded,
                          isRequired: true,
                        ),
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Nama pelapor sesuai KTP wajib diisi' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _pelaporKontakController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration(
                          label: 'No. Handphone / WhatsApp (Aktif)',
                          hint: '08xxxxxxxxxx',
                          icon: Icons.phone_android_rounded,
                          isRequired: true,
                        ),
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'No. Handphone wajib diisi' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _pelaporAlamatController,
                        maxLines: 2,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration(
                          label: 'Alamat Lengkap Pelapor (Sesuai KTP)',
                          hint: 'RT/RW, Kelurahan, Kecamatan, Kab/Kota',
                          icon: Icons.home_rounded,
                          isRequired: true,
                        ),
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Alamat pelapor sesuai KTP wajib diisi' : null,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // --- 3. Kategori & Objek Kejadian ---
                _buildSectionHeader(
                  icon: Icons.dashboard_customize_rounded,
                  title: 'KLASIFIKASI & OBJEK',
                  color: primaryAccent,
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.surfaceHighlight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Kategori Dropdown
                      const Text(
                        'Kategori Spesifik *',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _selectedKategori,
                        dropdownColor: AppTheme.surfaceHighlight,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          prefixIcon: Icon(
                            isFire ? Icons.electric_bolt_rounded : Icons.shield_rounded,
                            color: primaryAccent,
                          ),
                          filled: true,
                          fillColor: AppTheme.surfaceHighlight.withOpacity(0.5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        items: (isFire ? _kategoriKebakaranList : _kategoriPenyelamatanList)
                            .map((k) => DropdownMenuItem(value: k, child: Text(k)))
                            .toList(),
                        onChanged: (val) => setState(() => _selectedKategori = val),
                      ),
                      if (_selectedKategori == 'Lainnya') ...[
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _kategoriCustomController,
                          style: const TextStyle(color: Colors.white),
                          decoration: _buildInputDecoration(
                            label: 'Kategori Lainnya',
                            hint: 'Tuliskan kategori secara spesifik',
                            icon: Icons.edit_note_rounded,
                            isRequired: true,
                          ),
                          validator: (v) =>
                              _selectedKategori == 'Lainnya' && (v == null || v.trim().isEmpty)
                                  ? 'Harap isi rincian kategori'
                                  : null,
                        ),
                      ],

                      const SizedBox(height: 16),

                      // Objek Dropdown
                      const Text(
                        'Objek Kejadian *',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _selectedObjek,
                        dropdownColor: AppTheme.surfaceHighlight,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          prefixIcon: Icon(
                            isFire ? Icons.apartment_rounded : Icons.pets_rounded,
                            color: primaryAccent,
                          ),
                          filled: true,
                          fillColor: AppTheme.surfaceHighlight.withOpacity(0.5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        items: (isFire ? _objekKebakaranList : _objekPenyelamatanList)
                            .map((o) => DropdownMenuItem(value: o, child: Text(o)))
                            .toList(),
                        onChanged: (val) => setState(() => _selectedObjek = val),
                      ),
                      if (_selectedObjek == 'Lainnya') ...[
                        const SizedBox(height: 10),
                        TextFormField(
                          controller: _objekCustomController,
                          style: const TextStyle(color: Colors.white),
                          decoration: _buildInputDecoration(
                            label: 'Objek Lainnya',
                            hint: 'Tuliskan objek kejadian secara spesifik',
                            icon: Icons.edit_note_rounded,
                            isRequired: true,
                          ),
                          validator: (v) =>
                              _selectedObjek == 'Lainnya' && (v == null || v.trim().isEmpty)
                                  ? 'Harap isi rincian objek'
                                  : null,
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // --- 4. Alamat Kejadian & Peta ---
                _buildSectionHeader(
                  icon: Icons.location_on_rounded,
                  title: 'ALAMAT & TITIK PETA KEJADIAN',
                  color: primaryAccent,
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.surfaceHighlight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextFormField(
                        controller: _alamatController,
                        maxLines: 2,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration(
                          label: 'Alamat / Patokan Kejadian',
                          hint: 'Sebutkan nama jalan, nomor, RT/RW, dan patokan terdekat',
                          icon: Icons.edit_location_alt_rounded,
                          isRequired: true,
                        ),
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Alamat kejadian wajib diisi' : null,
                      ),
                      const SizedBox(height: 10),

                      // Tombol Cari di Peta & GPS
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _isSearchingMap ? null : _searchAddressOnMap,
                              icon: _isSearchingMap
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.search_rounded, size: 18),
                              label: const Text('Cari di Peta', style: TextStyle(fontSize: 12)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: primaryAccent,
                                side: BorderSide(color: primaryAccent.withOpacity(0.6)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _isGettingLocation ? null : _getCurrentLocation,
                              icon: _isGettingLocation
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.my_location_rounded, size: 18),
                              label: const Text('GPS Saya', style: TextStyle(fontSize: 12)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.neonGreen,
                                side: BorderSide(color: AppTheme.neonGreen.withOpacity(0.6)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 14),

                      // Peta Interaktif (Flutter Map)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: SizedBox(
                          height: 250,
                          child: Stack(
                            children: [
                              FlutterMap(
                                mapController: _mapController,
                                options: MapOptions(
                                  initialCenter: _selectedPosition,
                                  initialZoom: 15.0,
                                  onTap: (tapPosition, point) {
                                    setState(() => _selectedPosition = point);
                                  },
                                ),
                                children: [
                                  TileLayer(
                                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    userAgentPackageName: 'id.go.makassar.damkar.simArmadaMobile',
                                  ),
                                  MarkerLayer(
                                    markers: [
                                      Marker(
                                        point: _selectedPosition,
                                        width: 50,
                                        height: 50,
                                        child: Center(
                                          child: Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              color: primaryAccent,
                                              shape: BoxShape.circle,
                                              boxShadow: [
                                                BoxShadow(
                                                  color: primaryAccent.withOpacity(0.6),
                                                  blurRadius: 10,
                                                  spreadRadius: 2,
                                                )
                                              ],
                                            ),
                                            child: const Icon(
                                              Icons.location_pin,
                                              color: Colors.white,
                                              size: 26,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Positioned(
                                bottom: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.75),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'Ketuk di peta untuk atur pin',
                                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Info Koordinat Terkini
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceHighlight.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.gps_fixed_rounded, size: 16, color: primaryAccent),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Lat: ${_selectedPosition.latitude.toStringAsFixed(6)}, Lng: ${_selectedPosition.longitude.toStringAsFixed(6)}',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // --- 5. Dokumentasi Foto & Video Kejadian ---
                _buildSectionHeader(
                  icon: Icons.photo_camera_rounded,
                  title: 'BUKTI DOKUMENTASI (FOTO & VIDEO)',
                  color: primaryAccent,
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.surfaceHighlight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Tombol Aksi Media
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _showMediaPickerSheet(isVideo: false),
                              icon: const Icon(Icons.add_a_photo_rounded, size: 18),
                              label: const Text('Foto Kejadian', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.surfaceHighlight,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _showMediaPickerSheet(isVideo: true),
                              icon: const Icon(Icons.video_call_rounded, size: 20),
                              label: const Text('Video Kejadian', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.surfaceHighlight,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Preview Foto-foto
                      if (_capturedPhotos.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        Text(
                          'Foto Terlampir (${_capturedPhotos.length}):',
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 90,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _capturedPhotos.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 10),
                            itemBuilder: (ctx, idx) {
                              final photo = _capturedPhotos[idx];
                              return Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: kIsWeb
                                        ? Image.network(photo.path, width: 90, height: 90, fit: BoxFit.cover)
                                        : Image.file(File(photo.path), width: 90, height: 90, fit: BoxFit.cover),
                                  ),
                                  Positioned(
                                    top: 4,
                                    right: 4,
                                    child: GestureDetector(
                                      onTap: () => setState(() => _capturedPhotos.removeAt(idx)),
                                      child: Container(
                                        padding: const EdgeInsets.all(3),
                                        decoration: const BoxDecoration(
                                          color: Colors.black87,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.close, color: AppTheme.neonRed, size: 14),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ],

                      // Preview Video
                      if (_capturedVideo != null) ...[
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.neonBlue.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.neonBlue.withOpacity(0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.videocam_rounded, color: AppTheme.neonBlue, size: 28),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _capturedVideo!.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                    const Text(
                                      'Video siap dilampirkan',
                                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppTheme.neonRed),
                                onPressed: () => setState(() => _capturedVideo = null),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // --- 6. Tombol Submit ---
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    elevation: 8,
                    shadowColor: primaryAccent.withOpacity(0.6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              isFire ? Icons.local_fire_department_rounded : Icons.send_rounded,
                              size: 22,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'KIRIM LAPORAN SEKARANG',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ],
                        ),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader({
    required IconData icon,
    required String title,
    required Color color,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w800,
            fontSize: 13,
            letterSpacing: 1.1,
          ),
        ),
      ],
    );
  }

  Widget _buildTypeCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? accentColor.withOpacity(0.18) : AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? accentColor : AppTheme.surfaceHighlight,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: accentColor.withOpacity(0.25),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ]
              : [],
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? accentColor : Colors.white54,
              size: 28,
            ),
            const SizedBox(height: 6),
            Text(
              title,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.white70,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                color: isSelected ? accentColor : AppTheme.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    required String label,
    required String hint,
    required IconData icon,
    required bool isRequired,
  }) {
    return InputDecoration(
      labelText: isRequired ? '$label *' : label,
      hintText: hint,
      labelStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
      prefixIcon: Icon(icon, color: AppTheme.textSecondary, size: 20),
      filled: true,
      fillColor: AppTheme.surfaceHighlight.withOpacity(0.4),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.transparent),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppTheme.neonRed, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppTheme.neonRed, width: 1.5),
      ),
    );
  }
}
