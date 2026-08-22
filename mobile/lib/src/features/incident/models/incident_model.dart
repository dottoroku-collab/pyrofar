class Incident {
  final String id;
  final String title;       // kategori
  final String location;    // alamat
  final String time;        // formatted waktu_lapor
  final String type;        // jenis_insiden: 'pemadaman' | 'penyelamatan'
  String status;            // 'menunggu', 'berangkat', 'penanganan', 'selesai', 'batal'

  // Extra fields for detail
  final String objek;
  final String pelaporNama;
  final String pelaporKontak;
  final String? pelaporAlamat;
  final String? latitude;
  final String? longitude;
  final bool isVerified;
  final String? waktuLapor;   // raw ISO string
  final String? waktuBerangkat;
  final String? waktuTiba;
  final String? waktuSelesai;

  Incident({
    required this.id,
    required this.title,
    required this.location,
    required this.time,
    required this.type,
    this.status = 'menunggu',
    this.objek = '',
    this.pelaporNama = '',
    this.pelaporKontak = '',
    this.pelaporAlamat,
    this.latitude,
    this.longitude,
    this.isVerified = false,
    this.waktuLapor,
    this.waktuBerangkat,
    this.waktuTiba,
    this.waktuSelesai,
  });

  factory Incident.fromJson(Map<String, dynamic> json) {
    String formattedTime = '';
    if (json['waktu_lapor'] != null) {
      try {
        DateTime dt = DateTime.parse(json['waktu_lapor']);
        formattedTime = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} WITA';
      } catch (e) {
        formattedTime = json['waktu_lapor'].toString();
      }
    }

    return Incident(
      id: json['id'].toString(),
      title: json['kategori'] ?? 'Tidak ada kategori',
      location: json['alamat'] ?? 'Tidak ada lokasi',
      time: formattedTime,
      type: json['jenis_insiden'] ?? 'pemadaman',
      status: json['status'] ?? 'menunggu',
      objek: json['objek'] ?? '',
      pelaporNama: json['pelapor_nama'] ?? '',
      pelaporKontak: json['pelapor_kontak'] ?? '',
      pelaporAlamat: json['pelapor_alamat'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      isVerified: json['is_verified'] ?? false,
      waktuLapor: json['waktu_lapor'],
      waktuBerangkat: json['waktu_berangkat'],
      waktuTiba: json['waktu_tiba'],
      waktuSelesai: json['waktu_selesai'],
    );
  }

  Incident copyWith({
    String? id,
    String? title,
    String? location,
    String? time,
    String? type,
    String? status,
    bool? isVerified,
  }) {
    return Incident(
      id: id ?? this.id,
      title: title ?? this.title,
      location: location ?? this.location,
      time: time ?? this.time,
      type: type ?? this.type,
      status: status ?? this.status,
      objek: objek,
      pelaporNama: pelaporNama,
      pelaporKontak: pelaporKontak,
      pelaporAlamat: pelaporAlamat,
      latitude: latitude,
      longitude: longitude,
      isVerified: isVerified ?? this.isVerified,
      waktuLapor: waktuLapor,
      waktuBerangkat: waktuBerangkat,
      waktuTiba: waktuTiba,
      waktuSelesai: waktuSelesai,
    );
  }
}
