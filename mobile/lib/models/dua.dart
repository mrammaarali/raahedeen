import 'package:cloud_firestore/cloud_firestore.dart';

class Dua {
  final String id;
  final String title;
  final String category;
  final String arabic;
  final String transliteration;
  final String meaning;
  final bool isActive;

  Dua({
    required this.id,
    required this.title,
    required this.category,
    required this.arabic,
    required this.transliteration,
    required this.meaning,
    required this.isActive,
  });

  factory Dua.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Dua(
      id: doc.id,
      title: data['title'] ?? '',
      category: data['category'] ?? '',
      arabic: data['arabic'] ?? '',
      transliteration: data['transliteration'] ?? '',
      meaning: data['meaning'] ?? '',
      isActive: data['isActive'] ?? true,
    );
  }
}
