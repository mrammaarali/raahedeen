import 'package:cloud_firestore/cloud_firestore.dart';

class Product {
  final String id;
  final String name;
  final String category;
  final String description;
  final List<String> imageUrls;
  final bool isActive;
  final int sortOrder;
  final String whatsappTemplate;

  Product({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.imageUrls,
    required this.isActive,
    required this.sortOrder,
    required this.whatsappTemplate,
  });

  factory Product.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Product(
      id: doc.id,
      name: data['name'] ?? '',
      category: data['category'] ?? '',
      description: data['description'] ?? '',
      imageUrls: List<String>.from(data['imageUrls'] ?? []),
      isActive: data['isActive'] ?? true,
      sortOrder: data['sortOrder'] ?? 0,
      whatsappTemplate: data['whatsappTemplate'] ?? 'I want to buy {productName} - ID {productId}',
    );
  }
}
