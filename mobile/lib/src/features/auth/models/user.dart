class User {
  final int id;
  final String nama;
  final String? email;
  final String role;
  final bool isActive;

  User({
    required this.id,
    required this.nama,
    this.email,
    required this.role,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      nama: json['nama'],
      email: json['email'],
      role: json['role'],
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nama': nama,
      'email': email,
      'role': role,
      'is_active': isActive,
    };
  }
}
