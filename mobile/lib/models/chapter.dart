import 'package:cloud_firestore/cloud_firestore.dart';

class Chapter {
  final String id;
  final String title;
  final String description;
  final String audioUrl;
  final String? coverImageUrl;
  final int order;
  final bool isFree;
  final bool isActive;

  Chapter({
    required this.id,
    required this.title,
    required this.description,
    required this.audioUrl,
    this.coverImageUrl,
    required this.order,
    required this.isFree,
    required this.isActive,
  });

  factory Chapter.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Chapter(
      id: doc.id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      audioUrl: data['audioUrl'] ?? '',
      coverImageUrl: data['coverImageUrl'],
      order: data['order'] ?? 0,
      isFree: data['isFree'] ?? false,
      isActive: data['isActive'] ?? true,
    );
  }
}
